// Cena 3D do corpo humano (three.js), carregada dentro de uma WebView.
// Modelo estilizado feito com formas simples: protótipo para validar
// interação e desempenho antes de trocar pelo modelo anatômico do Z-Anatomy.
//
// Comunicação:
//   WebView -> app: { type: 'ready' } | { type: 'tap', organ, system } | { type: 'tap', organ: null } | { type: 'error', message }
//   app -> WebView: window.setLayer('pele' | 'musculos' | 'ossos'), window.highlight(system | null), window.resetView(),
//                   window.focusOrgan(organId) (aproxima a câmera), window.centerOrgan(organId) (só centraliza), window.focusSystem(sistema), window.setBottomInset(0..1) (área coberta pelo cartão)
//
// Atenção: este arquivo é uma String.raw, então o JS interno não pode usar crase nem "${".

export const THREE_VERSION = '0.187.0';

export const BODY_HTML = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; touch-action: none;
    background: radial-gradient(circle at 50% 35%, #FFFFFF 0%, #EAF4FF 45%, #D9E4FF 100%);
    -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  canvas { display: block; }
  #msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font: 600 16px -apple-system, Roboto, sans-serif; color: #5B5F7A; text-align: center; padding: 24px; }
</style>
<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/"
} }
</script>
</head>
<body>
<div id="msg">Carregando o corpo humano...</div>
<script>
  function send(obj) {
    var data = JSON.stringify(obj);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(data);
    else if (window.parent && window.parent !== window) window.parent.postMessage(data, '*');
    window.__lastMessage = obj;
  }
  setTimeout(function () {
    if (!window.__ready) {
      document.getElementById('msg').textContent = 'Não consegui carregar o 3D. Confira a conexão com a internet.';
      send({ type: 'error', message: 'timeout' });
    }
  }, 15000);
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Renderizador, câmera, luz ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.01, 50);
const HOME_POS = new THREE.Vector3(0, 0.95, 4.9);
const HOME_TARGET = new THREE.Vector3(0, 0.78, 0);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
// Zoom livre: aproxima até partes pequenas (ex.: tronco encefálico), na direção dos dedos,
// e dois dedos também arrastam a imagem
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.zoomSpeed = 1.2;
controls.minDistance = 0.12;
controls.maxDistance = 6;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.addEventListener('start', function () { controls.autoRotate = false; });

scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa5d6, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(2, 3, 2.5);
scene.add(sun);
const rim = new THREE.DirectionalLight(0xc9b8ff, 1.0);
rim.position.set(-2, 1.5, -2.5);
scene.add(rim);

// Chão: um disco suave
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(0.55, 48),
  new THREE.MeshBasicMaterial({ color: 0xbcc8ff, transparent: true, opacity: 0.45 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.001;
scene.add(floor);

// ---------- Cores por sistema ----------
const COR = {
  tegumentar: 0xF6C6A5,
  muscular: 0xF0607A,
  esqueletico: 0xFFF1D0,
  nervoso: 0x9B5DE5,
  circulatorio: 0xE63950,
  respiratorio: 0x4CC9F0,
  digestorio: 0xFF9F1C,
  figado: 0xC8643C,
  urinario: 0xFFD23F
};

// ---------- Camadas ----------
const layers = {
  pele: new THREE.Group(),
  musculos: new THREE.Group(),
  ossos: new THREE.Group() // ossos + órgãos
};
Object.values(layers).forEach(function (g) { scene.add(g); });
const allMeshes = [];

function makeMat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.5, metalness: 0.0 }, opts || {}));
}

function place(group, geo, color, pos, info, opts) {
  opts = opts || {};
  const m = new THREE.Mesh(geo, makeMat(color, opts.mat));
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (opts.scale) m.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
  if (opts.rot) m.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
  m.userData = { organ: info[0], system: info[1], ghost: !!opts.ghost, semFoco: !!opts.semFoco, baseOpacity: m.material.opacity, baseTransparent: m.material.transparent };
  group.add(m);
  allMeshes.push(m);
  return m;
}

// Cápsula entre dois pontos (membros, ossos longos, tubos)
const UP = new THREE.Vector3(0, 1, 0);
function limb(group, a, b, r, color, info, opts) {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const len = Math.max(va.distanceTo(vb), 0.001);
  const m = place(group, new THREE.CapsuleGeometry(r, len, 6, 18), color, null, info, opts);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, vb.clone().sub(va).normalize());
  return m;
}

function sphere(r) { return new THREE.SphereGeometry(r, 32, 24); }
function both(fn) { fn(1); fn(-1); } // lado esquerdo (+x) e direito (-x) do corpo

// Pontos-chave do corpo (pés em y = 0, altura ~1,75)
const SH = [0.205, 1.385, 0];   // ombro
const EL = [0.265, 1.10, 0];    // cotovelo
const WR = [0.30, 0.86, 0.01];  // punho
const HP = [0.095, 0.92, 0];    // quadril
const KN = [0.105, 0.50, 0.01]; // joelho
const AN = [0.11, 0.09, 0];     // tornozelo
function sx(p, s) { return [p[0] * s, p[1], p[2]]; }

// ========== CAMADA 1: PELE ==========
(function () {
  const g = layers.pele, c = COR.tegumentar, i = ['pele', 'tegumentar'];
  place(g, sphere(0.12), c, [0, 1.625, 0.005], i, { scale: [0.95, 1.12, 1.05] });
  both(function (s) { place(g, sphere(0.025), c, [0.112 * s, 1.62, 0], i, { scale: [0.5, 1, 0.8] }); }); // orelhas
  place(g, sphere(0.018), c, [0, 1.6, 0.125], i, { scale: [0.8, 1.2, 1] }); // nariz
  limb(g, [0, 1.44, 0], [0, 1.53, 0], 0.052, c, i);
  limb(g, [0, 1.02, 0], [0, 1.30, 0], 0.17, c, i, { scale: [1.12, 1, 0.74] });
  both(function (s) {
    place(g, sphere(0.068), c, sx(SH, s), i);
    limb(g, sx(SH, s), sx(EL, s), 0.052, c, i);
    limb(g, sx(EL, s), sx(WR, s), 0.044, c, i);
    place(g, sphere(0.045), c, [0.31 * s, 0.80, 0.015], i, { scale: [0.55, 1.15, 0.9] });
    limb(g, sx(HP, s), sx(KN, s), 0.085, c, i);
    limb(g, sx(KN, s), sx(AN, s), 0.06, c, i);
    place(g, new THREE.BoxGeometry(0.085, 0.06, 0.2, 2, 2, 2), c, [0.11 * s, 0.035, 0.045], i);
  });
  // Unhas das mãos e dos pés
  both(function (s) {
    place(g, new THREE.BoxGeometry(0.024, 0.018, 0.006), 0xFF9EC4, [0.31 * s, 0.76, 0.037], ['unhas', 'tegumentar'], { semFoco: s < 0 });
    place(g, new THREE.BoxGeometry(0.045, 0.006, 0.03), 0xFF9EC4, [0.11 * s, 0.067, 0.122], ['unhas', 'tegumentar'], { semFoco: true });
  });
  // olhos e boca (só decoração)
  both(function (s) {
    place(g, sphere(0.014), 0x3A2E5C, [0.04 * s, 1.645, 0.112], i);
  });
  place(g, new THREE.TorusGeometry(0.025, 0.005, 8, 20, Math.PI), 0xD0645A, [0, 1.575, 0.115], i, { rot: [0, 0, Math.PI] });
})();

// ========== CAMADA 2: MÚSCULOS ==========
(function () {
  const g = layers.musculos, c = COR.muscular;
  const c2 = 0xD94468; // tom mais escuro para destacar músculos específicos
  place(g, sphere(0.115), c, [0, 1.625, 0.005], ['musculos_rosto', 'muscular'], { scale: [0.95, 1.12, 1.05] });
  limb(g, [0, 1.44, 0], [0, 1.53, 0], 0.048, c, ['musculos_tronco', 'muscular']);
  limb(g, [0, 1.02, 0], [0, 1.30, 0], 0.16, c, ['musculos_tronco', 'muscular'], { scale: [1.12, 1, 0.7] });
  both(function (s) {
    place(g, sphere(0.075), c2, [0.072 * s, 1.315, 0.062], ['peitoral', 'muscular'], { scale: [1.15, 0.6, 0.5], rot: [0, 0, 0.25 * s] });
    place(g, sphere(0.066), c2, sx(SH, s), ['deltoide', 'muscular']);
    limb(g, sx(SH, s), sx(EL, s), 0.048, c, ['biceps', 'muscular']);
    limb(g, [0.24 * s, 1.30, 0.025], [0.26 * s, 1.15, 0.025], 0.03, c2, ['biceps', 'muscular']);
    limb(g, sx(EL, s), sx(WR, s), 0.04, c, ['antebraco', 'muscular']);
    place(g, sphere(0.042), c, [0.31 * s, 0.80, 0.015], ['antebraco', 'muscular'], { scale: [0.55, 1.15, 0.9] });
    limb(g, sx(HP, s), sx(KN, s), 0.08, c, ['quadriceps', 'muscular']);
    limb(g, [0.10 * s, 0.85, 0.04], [0.105 * s, 0.58, 0.045], 0.05, c2, ['quadriceps', 'muscular']);
    place(g, sphere(0.085), c2, [0.075 * s, 0.93, -0.06], ['gluteo', 'muscular'], { scale: [1, 1, 0.8] });
    limb(g, sx(KN, s), sx(AN, s), 0.055, c, ['panturrilha', 'muscular']);
    limb(g, [0.11 * s, 0.42, -0.025], [0.11 * s, 0.26, -0.025], 0.04, c2, ['panturrilha', 'muscular']);
    place(g, new THREE.BoxGeometry(0.08, 0.055, 0.19), c, [0.11 * s, 0.035, 0.045], ['panturrilha', 'muscular']);
    // Tendão calcâneo (de Aquiles), por trás do tornozelo
    limb(g, [0.11 * s, 0.25, -0.05], [0.11 * s, 0.045, -0.06], 0.009, 0xF4EEE2, ['tendoes', 'muscular']);
  });
  for (let r = 0; r < 3; r++) {
    both(function (s) {
      place(g, new THREE.BoxGeometry(0.055, 0.048, 0.03), c2, [0.032 * s, 1.17 - r * 0.058, 0.1], ['abdominais', 'muscular']);
    });
  }
})();

// ========== CAMADA 3: OSSOS ==========
(function () {
  const g = layers.ossos, c = COR.esqueletico;
  // Crânio translúcido para deixar o encéfalo visível
  place(g, sphere(0.108), c, [0, 1.635, 0], ['cranio', 'esqueletico'],
    { scale: [0.95, 1.1, 1.05], ghost: true, mat: { transparent: true, opacity: 0.28, depthWrite: false } });
  place(g, new THREE.TorusGeometry(0.06, 0.012, 10, 24, Math.PI), c, [0, 1.555, 0.035], ['mandibula', 'esqueletico'],
    { rot: [Math.PI / 2 - 0.3, 0, Math.PI] });
  // Coluna: vértebras em anel para mostrar a medula por dentro
  for (let k = 0; k < 20; k++) {
    const y = 0.96 + k * 0.029;
    const geo = new THREE.TorusGeometry(0.016, 0.008, 8, 18);
    geo.rotateX(Math.PI / 2);
    place(g, geo, c, [0, y, -0.065], ['coluna', 'esqueletico']);
    // Disco de cartilagem entre uma vértebra e a próxima
    if (k < 19) place(g, new THREE.CylinderGeometry(0.019, 0.019, 0.009, 18), 0x9FD8F0, [0, y + 0.0145, -0.065], ['cartilagens', 'esqueletico']);
  }
  // Costelas: arcos abertos na frente
  for (let k = 0; k < 7; k++) {
    const R = 0.115 + Math.sin((k / 6) * Math.PI) * 0.025;
    const geo = new THREE.TorusGeometry(R, 0.0075, 8, 40, Math.PI * 1.7);
    geo.rotateZ(-Math.PI * 1.35);
    geo.rotateX(Math.PI / 2);
    place(g, geo, c, [0, 1.40 - k * 0.04, -0.01], ['costelas', 'esqueletico'], { scale: [1.05, 1, 0.78] });
  }
  place(g, new THREE.BoxGeometry(0.03, 0.16, 0.012), c, [0, 1.30, 0.088], ['esterno', 'esqueletico']);
  both(function (s) {
    limb(g, [0.02 * s, 1.445, 0.06], [0.19 * s, 1.415, 0.0], 0.011, c, ['clavicula', 'esqueletico']);
    place(g, sphere(0.03), c, sx(SH, s), ['umero', 'esqueletico']);
    limb(g, sx(SH, s), sx(EL, s), 0.016, c, ['umero', 'esqueletico']);
    limb(g, [0.255 * s, 1.09, 0.012], [0.29 * s, 0.87, 0.02], 0.009, c, ['radio_ulna', 'esqueletico']);
    limb(g, [0.275 * s, 1.09, -0.012], [0.31 * s, 0.87, 0.0], 0.009, c, ['radio_ulna', 'esqueletico']);
    place(g, new THREE.BoxGeometry(0.02, 0.09, 0.05), c, [0.31 * s, 0.80, 0.012], ['maos', 'esqueletico']);
    place(g, sphere(0.024), c, sx(HP, s), ['femur', 'esqueletico']);
    limb(g, sx(HP, s), [0.105 * s, 0.52, 0.0], 0.021, c, ['femur', 'esqueletico']);
    place(g, sphere(0.018), c, [0.105 * s, 0.50, 0.04], ['patela', 'esqueletico'], { scale: [1, 1, 0.6] });
    limb(g, [0.105 * s, 0.48, 0.008], [0.11 * s, 0.08, 0.008], 0.016, c, ['tibia_fibula', 'esqueletico']);
    limb(g, [0.125 * s, 0.47, -0.012], [0.125 * s, 0.09, -0.012], 0.008, c, ['tibia_fibula', 'esqueletico']);
    place(g, new THREE.BoxGeometry(0.06, 0.035, 0.17), c, [0.11 * s, 0.03, 0.04], ['pes', 'esqueletico']);
  });
  // Pelve
  const pelvis = new THREE.TorusGeometry(0.085, 0.022, 10, 32);
  pelvis.rotateX(Math.PI / 2 - 0.35);
  place(g, pelvis, c, [0, 0.95, -0.005], ['pelve', 'esqueletico'], { scale: [1.15, 1, 0.8] });
})();

// ========== ÓRGÃOS (mesma camada dos ossos) ==========
const animated = { heart: null, lungs: [] };
(function () {
  const g = layers.ossos;
  // Nervoso
  place(g, sphere(0.085), COR.nervoso, [0, 1.665, 0.005], ['encefalo', 'nervoso'], { scale: [0.92, 0.82, 1.12] });
  place(g, sphere(0.035), 0xB98BF0, [0, 1.6, -0.055], ['cerebelo', 'nervoso'], { scale: [1.4, 0.8, 1] });
  limb(g, [0, 1.625, -0.015], [0, 1.565, -0.055], 0.014, 0xC2A3F5, ['tronco_encefalico', 'nervoso']);
  limb(g, [0, 1.55, -0.062], [0, 0.97, -0.065], 0.0075, COR.nervoso, ['medula', 'nervoso']);
  both(function (s) {
    limb(g, [0.03 * s, 1.40, -0.05], sx(SH, s), 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [SH[0] * s, SH[1], 0.025], [EL[0] * s, EL[1], 0.025], 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [EL[0] * s, EL[1], 0.025], [WR[0] * s, WR[1], 0.03], 0.0035, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [0.03 * s, 0.97, -0.05], [HP[0] * s, 0.88, -0.03], 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [HP[0] * s, 0.88, -0.03], [0.1 * s, 0.52, -0.03], 0.0045, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [0.1 * s, 0.52, -0.03], [0.11 * s, 0.1, -0.03], 0.004, COR.nervoso, ['nervos', 'nervoso']);
  });
  // Respiratório
  both(function (s) {
    limb(g, [0.012 * s, 1.612, 0.1], [0.012 * s, 1.6, 0.045], 0.007, 0x7FD6F5, ['fossas_nasais', 'respiratorio']);
  });
  limb(g, [0, 1.6, 0.03], [0, 1.53, 0.012], 0.012, 0xF7A8C0, ['faringe', 'respiratorio']);
  place(g, new THREE.CylinderGeometry(0.019, 0.015, 0.035, 18), 0x2F9FD0, [0, 1.512, 0.03], ['laringe', 'respiratorio']);
  limb(g, [0, 1.49, 0.03], [0, 1.39, 0.03], 0.011, COR.respiratorio, ['traqueia', 'respiratorio']);
  // Diafragma: cúpula de músculo abaixo dos pulmões
  place(g, new THREE.SphereGeometry(0.13, 36, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), 0xF48FA8, [0, 1.17, 0.0], ['diafragma', 'respiratorio'],
    { scale: [1.15, 0.38, 0.85], mat: { side: THREE.DoubleSide } });
  both(function (s) {
    limb(g, [0, 1.385, 0.03], [0.045 * s, 1.35, 0.02], 0.008, 0x1588B8, ['bronquios', 'respiratorio']);
    limb(g, [0.045 * s, 1.35, 0.02], [0.08 * s, 1.3, 0.035], 0.005, 0x1588B8, ['bronquios', 'respiratorio']);
    limb(g, [0.045 * s, 1.35, 0.02], [0.07 * s, 1.24, 0.03], 0.005, 0x1588B8, ['bronquios', 'respiratorio']);
    const lung = place(g, sphere(0.07), COR.respiratorio, [0.075 * s, 1.29, 0.005], ['pulmoes', 'respiratorio'], { scale: [0.85, 1.45, 0.95] });
    animated.lungs.push(lung);
  });
  // Circulatório
  animated.heart = place(g, sphere(0.042), COR.circulatorio, [0.025, 1.255, 0.05], ['coracao', 'circulatorio'],
    { scale: [1, 1.18, 0.9], rot: [0, 0, -0.45] });
  limb(g, [0.02, 1.29, 0.04], [0.0, 1.37, 0.0], 0.0095, COR.circulatorio, ['aorta', 'circulatorio']);
  limb(g, [0.0, 1.37, -0.02], [-0.012, 0.96, -0.035], 0.009, COR.circulatorio, ['aorta', 'circulatorio']);
  // Veias (azul): voltam para o coração
  const VEIA = 0x3D6FE0;
  limb(g, [-0.03, 1.4, 0.0], [-0.012, 1.27, 0.04], 0.009, VEIA, ['veias', 'circulatorio']);
  limb(g, [-0.03, 0.96, -0.02], [-0.012, 1.23, 0.035], 0.009, VEIA, ['veias', 'circulatorio']);
  both(function (s) {
    limb(g, [-0.03, 1.4, 0.0], [SH[0] * s, SH[1] - 0.03, 0.02], 0.0045, VEIA, ['veias', 'circulatorio']);
    limb(g, [SH[0] * s, SH[1] - 0.03, 0.02], [WR[0] * s - 0.012 * s, WR[1], 0.025], 0.004, VEIA, ['veias', 'circulatorio']);
    limb(g, [-0.03, 0.96, -0.02], [HP[0] * s - 0.012 * s, 0.88, 0.035], 0.005, VEIA, ['veias', 'circulatorio']);
    limb(g, [HP[0] * s - 0.012 * s, 0.88, 0.035], [0.11 * s, 0.1, 0.03], 0.0045, VEIA, ['veias', 'circulatorio']);
  });
  both(function (s) {
    limb(g, [0.02 * s, 1.37, 0.0], [SH[0] * s, SH[1] - 0.02, -0.02], 0.005, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [SH[0] * s, SH[1] - 0.02, -0.02], [WR[0] * s + 0.01 * s, WR[1], -0.01], 0.0045, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [-0.012, 0.96, -0.035], [HP[0] * s, 0.88, 0.02], 0.0055, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [HP[0] * s, 0.88, 0.02], [0.095 * s, 0.1, 0.02], 0.005, COR.circulatorio, ['arterias', 'circulatorio']);
  });
  // Digestório
  place(g, sphere(0.026), 0xF06A86, [0, 1.565, 0.05], ['boca', 'digestorio'], { scale: [1, 0.4, 1.4] });
  place(g, new THREE.TorusGeometry(0.03, 0.006, 8, 24, Math.PI), 0xFFFFFF, [0, 1.578, 0.055], ['boca', 'digestorio'], { rot: [Math.PI / 2, 0, Math.PI] });
  limb(g, [0.0, 1.09, 0.0], [0.095, 1.105, 0.005], 0.013, 0xF5C46B, ['pancreas', 'digestorio']);
  place(g, sphere(0.015), 0x79C97E, [-0.035, 1.125, 0.072], ['vesicula', 'digestorio'], { scale: [0.8, 1.3, 0.8] });
  limb(g, [0, 1.5, 0.005], [0.035, 1.17, 0.01], 0.0075, COR.digestorio, ['esofago', 'digestorio']);
  place(g, sphere(0.05), COR.digestorio, [0.055, 1.135, 0.04], ['estomago', 'digestorio'], { scale: [1.25, 0.85, 0.8], rot: [0, 0, 0.5] });
  place(g, sphere(0.07), COR.figado, [-0.05, 1.165, 0.03], ['figado', 'digestorio'], { scale: [1.3, 0.65, 0.9], rot: [0, 0, -0.25] });
  place(g, new THREE.TorusKnotGeometry(0.045, 0.012, 140, 12, 3, 5), 0xFFB347, [0, 1.0, 0.045], ['intestino_delgado', 'digestorio'], { scale: [1.05, 0.85, 0.55] });
  const colon = new THREE.TorusGeometry(0.085, 0.017, 12, 48, Math.PI * 1.6);
  colon.rotateZ(-Math.PI * 0.3);
  place(g, colon, 0xE8850F, [0, 1.0, 0.03], ['intestino_grosso', 'digestorio'], { scale: [1.05, 0.95, 0.7] });
  // Urinário
  both(function (s) {
    place(g, sphere(0.03), COR.urinario, [0.075 * s, 1.08, -0.045], ['rins', 'urinario'], { scale: [0.8, 1.3, 0.7] });
    limb(g, [0.07 * s, 1.04, -0.04], [0.02 * s, 0.91, 0.03], 0.004, 0xE6B800, ['ureteres', 'urinario']);
  });
  place(g, sphere(0.03), COR.urinario, [0, 0.9, 0.04], ['bexiga', 'urinario'], { scale: [1.1, 0.9, 1] });
  limb(g, [0, 0.875, 0.045], [0, 0.835, 0.05], 0.0045, 0xE6B800, ['uretra', 'urinario']);
})();

// ========== BOLHAS DE AUMENTO (partes microscópicas) ==========
// Cada bolha aparece ao lado de um órgão quando a tag é tocada.
const detalhes = new THREE.Group();
detalhes.visible = false;
scene.add(detalhes);
const bolhas = {}; // id da parte -> { grupo, ancora }

function tube(group, pts, r, color, info) {
  const curve = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }));
  return place(group, new THREE.TubeGeometry(curve, 48, r, 8, false), color, null, info);
}

function novaBolha(ids, ancora, raio) {
  const grupo = new THREE.Group();
  grupo.visible = false;
  detalhes.add(grupo);
  place(grupo, sphere(raio || 0.11), 0xFFFFFF, [0, 0, 0], [ids[0], 'bolha'],
    { ghost: true, mat: { transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.1 } });
  const b = { grupo: grupo, ancora: new THREE.Vector3(ancora[0], ancora[1], ancora[2]) };
  ids.forEach(function (id) { bolhas[id] = b; });
  return grupo;
}

// Neurônio: corpo celular, dendritos, axônio com bainha e terminais
(function () {
  const g = novaBolha(['neuronios'], [0, 1.665, 0.005]);
  const i = ['neuronios', 'nervoso'], c = 0x9B5DE5;
  place(g, sphere(0.02), c, [-0.035, 0.02, 0], i);
  [[-0.08, 0.06, 0.01], [-0.075, -0.01, 0.02], [-0.05, 0.07, -0.02], [-0.02, 0.065, 0.02], [-0.07, 0.035, -0.03]].forEach(function (p) {
    limb(g, [-0.035, 0.02, 0], p, 0.0035, 0xB98BF0, i);
  });
  limb(g, [-0.02, 0.008, 0], [0.06, -0.045, 0], 0.004, c, i);
  for (let k = 0; k < 3; k++) {
    const t = 0.2 + k * 0.27;
    place(g, new THREE.CapsuleGeometry(0.008, 0.012, 4, 12), 0xF2E9FF, [-0.02 + 0.08 * t, 0.008 - 0.053 * t, 0], i,
      { rot: [0, 0, Math.atan2(-0.053, 0.08) + Math.PI / 2] });
  }
  [[0.085, -0.03, 0.01], [0.08, -0.07, 0], [0.07, -0.06, 0.025]].forEach(function (p) {
    limb(g, [0.06, -0.045, 0], p, 0.0025, c, i);
    place(g, sphere(0.006), 0xD7C2FF, p, i);
  });
})();

// Alvéolos: bronquíolo terminando em "cachos" com capilares
(function () {
  const g = novaBolha(['alveolos'], [0.085, 1.24, 0.01]);
  const i = ['alveolos', 'respiratorio'];
  limb(g, [0, 0.08, 0], [0, 0.02, 0], 0.008, 0x1588B8, i);
  [[-0.04, -0.02, 0], [0.04, -0.02, 0.005], [0, -0.05, -0.01]].forEach(function (c) {
    limb(g, [0, 0.02, 0], c, 0.005, 0x1588B8, i);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      place(g, sphere(0.014), 0x8FDDF7, [c[0] + Math.cos(a) * 0.017, c[1] + Math.sin(a) * 0.014, c[2] + (k % 2 ? 0.01 : -0.01)], i);
    }
    const cap = new THREE.TorusGeometry(0.026, 0.0025, 6, 30);
    place(g, cap, 0xE63950, c, i, { rot: [0.5, 0.3, 0] });
  });
})();

// Néfron: glomérulo (novelo de capilares) e túbulos
(function () {
  const g = novaBolha(['nefrons'], [0.075, 1.08, -0.045]);
  const i = ['nefrons', 'urinario'];
  place(g, new THREE.TorusKnotGeometry(0.014, 0.004, 64, 8, 2, 5), 0xE63950, [-0.04, 0.04, 0], i);
  place(g, sphere(0.026), 0xFFD23F, [-0.04, 0.04, 0], i, { mat: { transparent: true, opacity: 0.45, depthWrite: false } });
  tube(g, [[-0.02, 0.03, 0], [0.02, 0.05, 0.01], [0.04, 0.02, -0.01], [0.01, 0.0, 0.01], [0.03, -0.03, 0], [0.02, -0.075, 0], [0.0, -0.03, 0.005], [-0.02, -0.07, 0]], 0.006, 0xE6B800, i);
  tube(g, [[-0.02, -0.07, 0], [-0.05, -0.04, 0.01], [-0.06, -0.08, 0]], 0.007, 0xC99400, i);
})();

// Capilares: arteríola (vermelha) que vira vênula (azul) por uma rede fina
(function () {
  const g = novaBolha(['capilares'], [0.29, 0.92, 0.0]);
  const i = ['capilares', 'circulatorio'];
  limb(g, [-0.09, 0.03, 0], [-0.04, 0.03, 0], 0.01, 0xE63950, i);
  limb(g, [0.04, -0.03, 0], [0.09, -0.03, 0], 0.01, 0x3D6FE0, i);
  const cores = [0xE63950, 0xC0457A, 0x9A4FA8, 0x6E5BC8, 0x3D6FE0];
  for (let k = 0; k < 5; k++) {
    const dz = (k - 2) * 0.012;
    tube(g, [[-0.04, 0.03, 0], [-0.015, 0.04 - k * 0.012, dz], [0.015, -0.01 - k * 0.008, -dz], [0.04, -0.03, 0]], 0.0028, cores[k], i);
  }
})();

// Sangue: hemácias, leucócitos e plaquetas
(function () {
  const g = novaBolha(['sangue'], [0.025, 1.255, 0.05]);
  const i = ['sangue', 'circulatorio'];
  const pos = [[-0.05, 0.03, 0.01], [0.0, 0.05, -0.02], [0.05, 0.02, 0.02], [-0.03, -0.03, -0.02], [0.03, -0.04, 0.0], [-0.06, -0.01, 0.03], [0.06, -0.01, -0.03]];
  pos.forEach(function (p, k) {
    place(g, new THREE.TorusGeometry(0.012, 0.008, 12, 24), 0xE63950, p, i, { rot: [k * 0.7, k * 1.1, 0] });
  });
  place(g, sphere(0.018), 0xF3EEFF, [0.005, -0.005, 0.03], i);
  place(g, sphere(0.015), 0xE9E0FF, [-0.01, 0.0, -0.05], i);
  [[0.03, 0.06, 0.02], [-0.02, 0.07, 0.03], [0.07, 0.04, -0.01], [-0.07, 0.05, -0.02], [0.0, -0.07, 0.02]].forEach(function (p) {
    place(g, sphere(0.005), 0xFFC93C, p, i, { scale: [1.4, 0.6, 1] });
  });
})();

// Pele em corte: epiderme, derme (vasos, glândulas, pelo) e hipoderme
(function () {
  const g = novaBolha(['epiderme', 'derme', 'hipoderme', 'pelos', 'glandulas_suor', 'glandulas_sebo'], [0.28, 0.98, 0.03], 0.12);
  place(g, new THREE.BoxGeometry(0.15, 0.045, 0.09), 0xFFE08A, [0, -0.05, 0], ['hipoderme', 'tegumentar']);
  place(g, new THREE.BoxGeometry(0.15, 0.055, 0.09), 0xF6A3AE, [0, 0.0, 0], ['derme', 'tegumentar']);
  place(g, new THREE.BoxGeometry(0.15, 0.016, 0.09), 0xF6C6A5, [0, 0.0355, 0], ['epiderme', 'tegumentar']);
  limb(g, [-0.075, -0.005, 0.047], [0.075, -0.005, 0.047], 0.004, 0xE63950, ['derme', 'tegumentar']);
  // Pelo com folículo
  limb(g, [-0.03, -0.02, 0.02], [-0.04, 0.09, 0.02], 0.0035, 0x4A3B2A, ['pelos', 'tegumentar']);
  place(g, sphere(0.008), 0x6B4F3A, [-0.03, -0.022, 0.02], ['pelos', 'tegumentar']);
  // Glândula sebácea ao lado do pelo
  place(g, sphere(0.01), 0xFFF3C4, [-0.018, 0.0, 0.02], ['glandulas_sebo', 'tegumentar'], { scale: [1, 1.3, 1] });
  // Glândula sudorípara: novelo com um duto até a superfície
  place(g, new THREE.TorusKnotGeometry(0.01, 0.003, 48, 6, 2, 3), 0x4CC9F0, [0.035, -0.03, 0.02], ['glandulas_suor', 'tegumentar']);
  limb(g, [0.035, -0.02, 0.02], [0.04, 0.044, 0.02], 0.0025, 0x4CC9F0, ['glandulas_suor', 'tegumentar']);
})();

// Linha que liga a bolha ao órgão
const conector = new THREE.Mesh(
  new THREE.CylinderGeometry(0.0022, 0.0022, 1, 8),
  new THREE.MeshBasicMaterial({ color: 0x9AA5D6, transparent: true, opacity: 0.8 })
);
detalhes.add(conector);

function esconderBolhas() {
  detalhes.visible = false;
  Object.keys(bolhas).forEach(function (k) { bolhas[k].grupo.visible = false; });
}

// Posiciona a bolha ao lado da âncora, do lado que a câmera vê melhor
function mostrarBolha(id) {
  const b = bolhas[id];
  esconderBolhas();
  const frente = camera.position.clone().sub(controls.target);
  frente.y = 0;
  if (frente.lengthSq() < 1e-6) frente.set(0, 0, 1);
  frente.normalize();
  const direita = new THREE.Vector3(frente.z, 0, -frente.x);
  const lado = b.ancora.clone().setY(0).dot(direita) >= 0 ? 1 : -1;
  const pos = b.ancora.clone().add(direita.multiplyScalar(0.24 * lado)).add(frente.multiplyScalar(0.06));
  b.grupo.position.copy(pos);
  b.grupo.lookAt(pos.clone().add(camera.position.clone().sub(controls.target).setY(0)));
  const meio = pos.clone().add(b.ancora).multiplyScalar(0.5);
  conector.position.copy(meio);
  conector.scale.set(1, Math.max(pos.distanceTo(b.ancora) - 0.11, 0.01), 1);
  conector.quaternion.setFromUnitVectors(UP, pos.clone().sub(b.ancora).normalize());
  conector.position.copy(b.ancora.clone().add(pos.clone().sub(b.ancora).normalize().multiplyScalar((pos.distanceTo(b.ancora) - 0.11) / 2)));
  b.grupo.visible = true;
  detalhes.visible = true;
  return b;
}

// ---------- Camada visível e destaque ----------
let currentLayer = 'pele';
let currentHighlight = null;
let focusedOrgan = null; // parte aproximada pelas tags do cartão

function setLayer(name) {
  if (!layers[name]) return;
  currentLayer = name;
  Object.keys(layers).forEach(function (k) { layers[k].visible = (k === name); });
  applyHighlight();
}

function applyHighlight() {
  allMeshes.forEach(function (m) {
    const mat = m.material, u = m.userData;
    const focado = focusedOrgan && u.organ === focusedOrgan;
    // Com uma parte em foco, o resto do sistema fica meio apagado e o resto do corpo quase some
    const on = focusedOrgan ? focado : !currentHighlight || u.system === currentHighlight;
    const meio = focusedOrgan && !focado && u.system === currentHighlight;
    if (on) {
      mat.transparent = u.baseTransparent;
      mat.opacity = u.baseOpacity;
      mat.depthWrite = !u.baseTransparent;
      mat.emissive.setHex(currentHighlight || focado ? mat.color.getHex() : 0x000000);
      mat.emissiveIntensity = focado ? 0.45 : currentHighlight ? 0.28 : 0;
    } else {
      mat.transparent = true;
      mat.opacity = Math.min(u.baseOpacity, meio ? 0.35 : 0.1);
      mat.depthWrite = false;
      mat.emissive.setHex(0x000000);
    }
    mat.needsUpdate = true;
  });
}

function highlight(system) {
  currentHighlight = system || null;
  focusedOrgan = null;
  esconderBolhas();
  applyHighlight();
}

// Movimento suave da câmera
let camAnim = null;
function animateCamera(toTarget, toPos) {
  controls.autoRotate = false;
  camAnim = {
    fromT: controls.target.clone(), toT: toTarget,
    fromP: camera.position.clone(), toP: toPos,
    start: performance.now(), dur: 750
  };
}

function focusOrgan(id) {
  const box = new THREE.Box3();
  let found = false;
  if (bolhas[id]) {
    // Parte microscópica: abre a bolha de aumento e enquadra bolha + órgão
    const b = mostrarBolha(id);
    box.expandByObject(b.grupo);
    found = true;
  } else {
    esconderBolhas();
    allMeshes.forEach(function (m) {
      if (m.userData.organ === id && !m.userData.semFoco && isShown(m)) { box.expandByObject(m); found = true; }
    });
  }
  if (!found) return;
  focusedOrgan = id;
  applyHighlight();
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  // Bolhas pedem mais zoom: os detalhes são pequenos
  const dist = bolhas[id] ? Math.min(Math.max(size * 3, 1.0), 2) : Math.min(Math.max(size * 5, 1.1), 4.5);
  // Mantém o ângulo atual na horizontal, olhando levemente de cima
  const dir = camera.position.clone().sub(controls.target);
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
  dir.normalize();
  dir.y = 0.18;
  dir.normalize();
  animateCamera(center, center.clone().add(dir.multiplyScalar(dist)));
}

// Enquadra todas as peças visíveis de um sistema (cartão de visão geral)
function focusSystem(sys) {
  focusedOrgan = null;
  esconderBolhas();
  applyHighlight();
  const box = new THREE.Box3();
  let found = false;
  allMeshes.forEach(function (m) {
    if (m.userData.system === sys && !m.userData.semFoco && !m.userData.ghost && isShown(m)) { box.expandByObject(m); found = true; }
  });
  if (!found) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const dist = Math.min(Math.max(size * 2.8, 1.2), 5.5);
  const dir = camera.position.clone().sub(controls.target);
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
  dir.normalize();
  dir.y = 0.12;
  dir.normalize();
  animateCamera(center, center.clone().add(dir.multiplyScalar(dist)));
}

// Ao abrir o cartão: sobe ou desce a câmera até a altura da parte tocada, sem mudar o zoom
function centerOrgan(id) {
  const box = new THREE.Box3();
  let found = false;
  allMeshes.forEach(function (m) {
    if (m.userData.organ === id && isShown(m)) { box.expandByObject(m); found = true; }
  });
  if (!found) return;
  const y = box.getCenter(new THREE.Vector3()).y;
  const toT = new THREE.Vector3(controls.target.x, y, controls.target.z);
  const toP = camera.position.clone().add(toT.clone().sub(controls.target));
  animateCamera(toT, toP);
}

function resetView() {
  focusedOrgan = null;
  esconderBolhas();
  applyHighlight();
  animateCamera(HOME_TARGET.clone(), HOME_POS.clone());
}

// O cartão cobre a parte de baixo da tela: desloca a imagem para cima,
// para o que está em foco aparecer no espaço livre.
let insetTarget = 0, insetNow = 0;
function setBottomInset(frac) { insetTarget = Math.min(Math.max(frac || 0, 0), 0.8); }

window.setLayer = setLayer;
window.highlight = highlight;
window.resetView = resetView;
window.focusOrgan = focusOrgan;
window.centerOrgan = centerOrgan;
window.focusSystem = focusSystem;
window.setBottomInset = setBottomInset;

// ---------- Toque: distinguir "tocar" de "arrastar" ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down = null;
let popMesh = null, popStart = 0;

function isShown(o) {
  while (o) { if (!o.visible) return false; o = o.parent; }
  return true;
}

renderer.domElement.addEventListener('pointerdown', function (e) {
  down = { x: e.clientX, y: e.clientY, t: performance.now() };
});
renderer.domElement.addEventListener('pointerup', function (e) {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  const dt = performance.now() - down.t;
  down = null;
  if (moved > 10 || dt > 450) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(layers[currentLayer].children, false)
    .filter(function (h) { return isShown(h.object) && h.object.material.opacity > 0.2; });
  const solid = hits.find(function (h) { return !h.object.userData.ghost; });
  const hit = solid || hits[0];
  if (!hit) { send({ type: 'tap', organ: null }); return; }
  popMesh = hit.object; popStart = performance.now();
  send({ type: 'tap', organ: hit.object.userData.organ, system: hit.object.userData.system });
});

// ---------- Animação ----------
const baseScale = new Map();
allMeshes.forEach(function (m) { baseScale.set(m, m.scale.clone()); });
const t0 = performance.now();

function frame() {
  const t = (performance.now() - t0) / 1000;
  if (animated.heart) {
    const beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 6) * 0.1;
    animated.heart.scale.copy(baseScale.get(animated.heart)).multiplyScalar(1 + beat);
  }
  const breath = 1 + Math.sin(t * 1.7) * 0.045;
  animated.lungs.forEach(function (l) {
    const b = baseScale.get(l);
    l.scale.set(b.x * breath, b.y * (1 + (breath - 1) * 0.6), b.z * breath);
  });
  if (popMesh && popMesh !== animated.heart && animated.lungs.indexOf(popMesh) < 0) {
    const p = (performance.now() - popStart) / 350;
    const k = p < 1 ? 1 + Math.sin(p * Math.PI) * 0.12 : 1;
    popMesh.scale.copy(baseScale.get(popMesh)).multiplyScalar(k);
    if (p >= 1) popMesh = null;
  }
  if (camAnim) {
    const k = Math.min((performance.now() - camAnim.start) / camAnim.dur, 1);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    controls.target.lerpVectors(camAnim.fromT, camAnim.toT, e);
    camera.position.lerpVectors(camAnim.fromP, camAnim.toP, e);
    if (k >= 1) camAnim = null;
  }
  if (Math.abs(insetTarget - insetNow) > 0.001) {
    insetNow += (insetTarget - insetNow) * 0.15;
    const W = window.innerWidth, H = window.innerHeight;
    if (insetNow < 0.002) camera.clearViewOffset();
    else camera.setViewOffset(W, H, 0, (insetNow * H) / 2, W, H);
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  insetNow = insetTarget + 0.01; // força recalcular o deslocamento no próximo quadro
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setLayer('pele');
document.getElementById('msg').remove();
window.__ready = true;
frame();
send({ type: 'ready' });
</script>
</body>
</html>`;
