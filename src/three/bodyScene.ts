// Cena 3D do corpo humano (three.js), carregada dentro de uma WebView.
// Modelo estilizado feito com formas simples: protótipo para validar
// interação e desempenho antes de trocar pelo modelo anatômico do Z-Anatomy.
//
// Comunicação:
//   WebView -> app: { type: 'ready' } | { type: 'tap', organ, system } | { type: 'tap', organ: null } | { type: 'error', message }
//   app -> WebView: window.setLayer('pele' | 'musculos' | 'ossos'), window.highlight(system | null), window.resetView()
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
controls.enablePan = false;
controls.minDistance = 0.7;
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
  m.userData = { organ: info[0], system: info[1], ghost: !!opts.ghost, baseOpacity: m.material.opacity, baseTransparent: m.material.transparent };
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
  limb(g, [0, 1.56, -0.062], [0, 0.97, -0.065], 0.0075, COR.nervoso, ['medula', 'nervoso']);
  both(function (s) {
    limb(g, [0.03 * s, 1.40, -0.05], sx(SH, s), 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [SH[0] * s, SH[1], 0.025], [EL[0] * s, EL[1], 0.025], 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [EL[0] * s, EL[1], 0.025], [WR[0] * s, WR[1], 0.03], 0.0035, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [0.03 * s, 0.97, -0.05], [HP[0] * s, 0.88, -0.03], 0.004, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [HP[0] * s, 0.88, -0.03], [0.1 * s, 0.52, -0.03], 0.0045, COR.nervoso, ['nervos', 'nervoso']);
    limb(g, [0.1 * s, 0.52, -0.03], [0.11 * s, 0.1, -0.03], 0.004, COR.nervoso, ['nervos', 'nervoso']);
  });
  // Respiratório
  limb(g, [0, 1.52, 0.03], [0, 1.39, 0.03], 0.011, COR.respiratorio, ['traqueia', 'respiratorio']);
  both(function (s) {
    limb(g, [0, 1.385, 0.03], [0.045 * s, 1.35, 0.02], 0.008, COR.respiratorio, ['traqueia', 'respiratorio']);
    const lung = place(g, sphere(0.07), COR.respiratorio, [0.075 * s, 1.29, 0.005], ['pulmoes', 'respiratorio'], { scale: [0.85, 1.45, 0.95] });
    animated.lungs.push(lung);
  });
  // Circulatório
  animated.heart = place(g, sphere(0.042), COR.circulatorio, [0.025, 1.255, 0.05], ['coracao', 'circulatorio'],
    { scale: [1, 1.18, 0.9], rot: [0, 0, -0.45] });
  limb(g, [0.02, 1.29, 0.04], [0.0, 1.37, 0.0], 0.0095, COR.circulatorio, ['aorta', 'circulatorio']);
  limb(g, [0.0, 1.37, -0.02], [-0.012, 0.96, -0.035], 0.009, COR.circulatorio, ['aorta', 'circulatorio']);
  both(function (s) {
    limb(g, [0.02 * s, 1.37, 0.0], [SH[0] * s, SH[1] - 0.02, -0.02], 0.005, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [SH[0] * s, SH[1] - 0.02, -0.02], [WR[0] * s + 0.01 * s, WR[1], -0.01], 0.0045, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [-0.012, 0.96, -0.035], [HP[0] * s, 0.88, 0.02], 0.0055, COR.circulatorio, ['arterias', 'circulatorio']);
    limb(g, [HP[0] * s, 0.88, 0.02], [0.095 * s, 0.1, 0.02], 0.005, COR.circulatorio, ['arterias', 'circulatorio']);
  });
  // Digestório
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
    limb(g, [0.07 * s, 1.04, -0.04], [0.02 * s, 0.91, 0.03], 0.004, COR.urinario, ['rins', 'urinario']);
  });
  place(g, sphere(0.03), COR.urinario, [0, 0.9, 0.04], ['bexiga', 'urinario'], { scale: [1.1, 0.9, 1] });
})();

// ---------- Camada visível e destaque ----------
let currentLayer = 'pele';
let currentHighlight = null;

function setLayer(name) {
  if (!layers[name]) return;
  currentLayer = name;
  Object.keys(layers).forEach(function (k) { layers[k].visible = (k === name); });
  applyHighlight();
}

function applyHighlight() {
  allMeshes.forEach(function (m) {
    const mat = m.material, u = m.userData;
    const on = !currentHighlight || u.system === currentHighlight;
    if (on) {
      mat.transparent = u.baseTransparent;
      mat.opacity = u.baseOpacity;
      mat.depthWrite = !u.baseTransparent;
      mat.emissive.setHex(currentHighlight ? mat.color.getHex() : 0x000000);
      mat.emissiveIntensity = currentHighlight ? 0.28 : 0;
    } else {
      mat.transparent = true;
      mat.opacity = Math.min(u.baseOpacity, 0.14);
      mat.depthWrite = false;
      mat.emissive.setHex(0x000000);
    }
    mat.needsUpdate = true;
  });
}

function highlight(system) { currentHighlight = system || null; applyHighlight(); }

function resetView() {
  controls.target.copy(HOME_TARGET);
  camera.position.copy(HOME_POS);
  controls.update();
}

window.setLayer = setLayer;
window.highlight = highlight;
window.resetView = resetView;

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
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
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
