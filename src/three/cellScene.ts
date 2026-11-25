// Cena 3D de uma célula (three.js), para o Zoom na célula.
// Mesma estrutura do bodyScene: HTML carregado numa WebView (celular) ou iframe (web).
//
// Comunicação:
//   WebView -> app: { type: 'ready' } | { type: 'tap', organ: organelaId | null } | { type: 'error', message }
//   app -> WebView: window.montarCelula(forma, 'membrana,nucleo,...'), window.destacar(organelaId | null), window.resetView()
//
// Atenção: este arquivo é uma String.raw, então o JS interno não pode usar crase nem "${".

export const CELL_HTML = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; touch-action: none;
    background: radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F1ECFF 50%, #E2DAFF 100%);
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
<div id="msg">Entrando na célula...</div>
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

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.6;
controls.maxDistance = 14;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

scene.add(new THREE.HemisphereLight(0xffffff, 0xd8ccff, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(3, 5, 4);
scene.add(sun);

const COR = {
  membrana: 0x7FC8F8, nucleo: 0x8B4FD9, nucleolo: 0x5B2DA8, mitocondria: 0xFF8C42, ribossomo: 0x3A3F75,
  reticulo: 0x4CC9F0, golgi: 0xFFC93C, lisossomo: 0x2EC4B6, centriolo: 0xE04B6A, hemoglobina: 0xE63950
};

const celula = new THREE.Group();
scene.add(celula);
let pecas = [];

// Sorteio com semente: a célula fica sempre igual
let semente = 7;
function aleatorio() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }

function peca(geo, cor, pos, id, opts) {
  opts = opts || {};
  const mat = new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.45 }, opts.mat || {}));
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (opts.scale) m.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
  if (opts.rot) m.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
  m.userData = { organ: id, baseOpacity: mat.opacity, baseTransparent: mat.transparent };
  celula.add(m);
  pecas.push(m);
  return m;
}
function esfera(r) { return new THREE.SphereGeometry(r, 28, 20); }
function tubo(pts, r, cor, id, opts) {
  const curva = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }));
  return peca(new THREE.TubeGeometry(curva, 40, r, 10, false), cor, null, id, opts);
}
function capsula(a, b, r, cor, id, opts) {
  const va = new THREE.Vector3(a[0], a[1], a[2]), vb = new THREE.Vector3(b[0], b[1], b[2]);
  const m = peca(new THREE.CapsuleGeometry(r, Math.max(va.distanceTo(vb), 0.001), 6, 14), cor, null, id, opts);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return m;
}

const ESCALA = {
  redonda: [1, 1, 1], alongada: [2.6, 0.62, 0.62], neuronio: [0.75, 0.75, 0.75], estrelada: [0.85, 0.7, 0.85],
  achatada: [1.45, 0.48, 1.2], colunar: [0.7, 1.45, 0.7], disco: [1, 1, 1]
};
const membranaMat = { transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, roughness: 0.2 };

function limpar() {
  pecas.forEach(function (m) { m.geometry.dispose(); m.material.dispose(); celula.remove(m); });
  pecas = [];
  semente = 7;
}

// Ponto dentro da célula, longe dos núcleos
function pontoLivre(S, nucleos, rMin, rMax) {
  for (let t = 0; t < 60; t++) {
    const th = aleatorio() * Math.PI * 2, ph = Math.acos(2 * aleatorio() - 1), r = rMin + aleatorio() * (rMax - rMin);
    const p = [Math.sin(ph) * Math.cos(th) * r * S[0], Math.cos(ph) * r * S[1], Math.sin(ph) * Math.sin(th) * r * S[2]];
    const longe = nucleos.every(function (n) { return Math.hypot(p[0] - n[0], p[1] - n[1], p[2] - n[2]) > 0.42; });
    if (longe) return p;
  }
  return [0, 0, 0];
}

function montarCelula(forma, lista) {
  limpar();
  const tem = function (id) { return lista.indexOf(id) >= 0; };
  const S = ESCALA[forma] || ESCALA.redonda;

  // ----- Hemácia: disco bicôncavo, sem núcleo -----
  if (forma === 'disco') {
    const anel = new THREE.TorusGeometry(0.72, 0.32, 24, 60);
    anel.rotateX(Math.PI / 2);
    peca(anel, 0xF28B9B, [0, 0, 0], 'membrana', { mat: { transparent: true, opacity: 0.55, depthWrite: false } });
    peca(new THREE.CylinderGeometry(0.75, 0.75, 0.18, 48), 0xF28B9B, [0, 0, 0], 'membrana', { mat: { transparent: true, opacity: 0.45, depthWrite: false } });
    if (tem('hemoglobina')) {
      for (let k = 0; k < 90; k++) {
        const a = aleatorio() * Math.PI * 2, rr = 0.15 + aleatorio() * 0.85;
        const y = (aleatorio() - 0.5) * (rr > 0.55 ? 0.45 : 0.12);
        peca(esfera(0.035), COR.hemoglobina, [Math.cos(a) * rr, y, Math.sin(a) * rr], 'hemoglobina');
      }
    }
    return enquadrar();
  }

  // ----- Membrana (e prolongamentos) -----
  peca(esfera(1), COR.membrana, [0, 0, 0], 'membrana', { scale: S, mat: membranaMat });
  if (forma === 'neuronio') {
    // Dendritos ramificados
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * 0.55 + (k / 6) * Math.PI * 0.9, b = (aleatorio() - 0.5) * 0.9;
      const p0 = [Math.cos(a) * 0.7, Math.sin(a) * 0.7 * Math.cos(b), Math.sin(b) * 0.6];
      const p1 = [Math.cos(a) * 1.5, Math.sin(a) * 1.4 * Math.cos(b), Math.sin(b) * 1.1];
      tubo([p0, [(p0[0] + p1[0]) / 2 + 0.1, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], p1], 0.06, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.55 } });
      tubo([p1, [p1[0] * 1.25 + 0.15, p1[1] * 1.3, p1[2]]], 0.03, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.55 } });
      tubo([p1, [p1[0] * 1.3, p1[1] * 1.05 - 0.2, p1[2] + 0.2]], 0.03, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.55 } });
    }
    // Axônio com bainha de mielina e terminais
    tubo([[0.7, -0.1, 0], [1.6, -0.25, 0], [2.8, -0.2, 0], [3.8, -0.35, 0]], 0.07, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.6 } });
    for (let k = 0; k < 4; k++) capsula([1.2 + k * 0.62, -0.22 - k * 0.02, 0], [1.6 + k * 0.62, -0.24 - k * 0.02, 0], 0.13, 0xF2E9FF, 'membrana');
    [[4.3, 0.1, 0.2], [4.4, -0.4, -0.1], [4.2, -0.8, 0.15]].forEach(function (p) {
      tubo([[3.8, -0.35, 0], p], 0.03, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.6 } });
      peca(esfera(0.1), 0xD7C2FF, p, 'membrana');
    });
  }
  if (forma === 'estrelada') {
    for (let k = 0; k < 12; k++) {
      const th = aleatorio() * Math.PI * 2, ph = 0.4 + aleatorio() * 2.3;
      const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
      tubo([[d[0] * 0.75, d[1] * 0.62, d[2] * 0.75], [d[0] * 1.5, d[1] * 1.2, d[2] * 1.5], [d[0] * 2.1 + 0.2, d[1] * 1.6, d[2] * 2.0]], 0.035, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.5 } });
    }
  }
  if (forma === 'colunar') {
    // Microvilosidades no topo
    for (let x = -0.5; x <= 0.5; x += 0.14) {
      for (let z = -0.5; z <= 0.5; z += 0.14) {
        if (x * x + z * z > 0.3) continue;
        const topo = 1.45 * Math.sqrt(1 - (x * x + z * z) / 0.49);
        capsula([x, topo - 0.05, z], [x, topo + 0.2, z], 0.035, COR.membrana, 'membrana', { mat: { transparent: true, opacity: 0.6 } });
      }
    }
  }

  // ----- Núcleo(s) -----
  const nucleos = forma === 'alongada' ? [[-1.5, 0, 0], [0, 0.05, 0], [1.5, -0.05, 0]] : forma === 'colunar' ? [[0, -0.45, 0]] : [[-0.12, 0, 0]];
  const rNucleo = forma === 'neuronio' ? 0.26 : forma === 'achatada' || forma === 'alongada' ? 0.24 : 0.32;
  if (tem('nucleo')) {
    nucleos.forEach(function (n) {
      peca(esfera(rNucleo), COR.nucleo, n, 'nucleo', { scale: forma === 'alongada' ? [1.5, 0.8, 0.9] : [1, 1, 1] });
      peca(esfera(rNucleo * 0.35), COR.nucleolo, [n[0] + rNucleo * 0.3, n[1] + rNucleo * 0.45, n[2] + rNucleo * 0.5], 'nucleo');
    });
  }

  // ----- Retículo: arcos em volta do primeiro núcleo -----
  if (tem('reticulo')) {
    const n = nucleos[0];
    for (let k = 0; k < 4; k++) {
      const arco = new THREE.TorusGeometry(rNucleo + 0.09 + k * 0.07, 0.022, 8, 40, Math.PI * (0.9 + k * 0.15));
      peca(arco, COR.reticulo, n, 'reticulo', { rot: [0.3 + k * 0.5, k * 0.9, 0.4 - k * 0.3] });
    }
  }

  // ----- Complexo golgiense: pilha de bolsas achatadas e vesículas -----
  if (tem('golgi')) {
    const base = forma === 'colunar' ? [0.1, 0.55, 0.1] : forma === 'alongada' ? [0.75, 0.2, 0.1] : [0.42 * S[0], 0.28 * S[1], 0.12];
    for (let k = 0; k < 4; k++) {
      const disco = new THREE.SphereGeometry(0.2 - k * 0.015, 24, 8, 0, Math.PI * 2, 0, Math.PI / 3.5);
      peca(disco, COR.golgi, [base[0] + k * 0.05, base[1] - k * 0.045, base[2]], 'golgi', { scale: [1, 0.35, 1], rot: [0, 0, 0.7], mat: { side: THREE.DoubleSide } });
    }
    for (let k = 0; k < 4; k++) peca(esfera(0.035), COR.golgi, [base[0] + 0.25 + aleatorio() * 0.1, base[1] - 0.05 + aleatorio() * 0.2, base[2] + (aleatorio() - 0.5) * 0.2], 'golgi');
  }

  // ----- Mitocôndrias -----
  if (tem('mitocondria')) {
    const qtd = forma === 'alongada' ? 14 : forma === 'colunar' ? 8 : 6;
    for (let k = 0; k < qtd; k++) {
      const p = pontoLivre(S, nucleos, 0.45, 0.82);
      const d = [aleatorio() - 0.5, aleatorio() - 0.5, aleatorio() - 0.5];
      capsula([p[0] - d[0] * 0.18, p[1] - d[1] * 0.18, p[2] - d[2] * 0.18], [p[0] + d[0] * 0.18, p[1] + d[1] * 0.18, p[2] + d[2] * 0.18], 0.065, COR.mitocondria, 'mitocondria');
    }
  }

  // ----- Lisossomos -----
  if (tem('lisossomo')) {
    for (let k = 0; k < 4; k++) peca(esfera(0.065), COR.lisossomo, pontoLivre(S, nucleos, 0.4, 0.78), 'lisossomo');
  }

  // ----- Centríolos: dois cilindros em cruz -----
  if (tem('centriolo')) {
    const c = pontoLivre(S, nucleos, 0.45, 0.6);
    peca(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 12), COR.centriolo, c, 'centriolo');
    peca(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 12), COR.centriolo, [c[0] + 0.05, c[1], c[2] + 0.05], 'centriolo', { rot: [Math.PI / 2, 0, 0] });
  }

  // ----- Ribossomos: pontinhos soltos -----
  if (tem('ribossomo')) {
    for (let k = 0; k < 55; k++) peca(esfera(0.022), COR.ribossomo, pontoLivre(S, nucleos, 0.35, 0.9), 'ribossomo');
  }

  enquadrar();
}

// ----- Câmera -----
let casa = { alvo: new THREE.Vector3(), pos: new THREE.Vector3(0, 0.6, 4) };
let anim = null;
function animar(alvo, pos) { anim = { a0: controls.target.clone(), a1: alvo, p0: camera.position.clone(), p1: pos, t: performance.now() }; }

function enquadrar() {
  const caixa = new THREE.Box3().setFromObject(celula);
  const centro = caixa.getCenter(new THREE.Vector3());
  const tam = caixa.getSize(new THREE.Vector3()).length();
  // Cabe na menor abertura da câmera (no celular em pé, é a largura)
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const dist = Math.max((tam / 2) / Math.sin(Math.min(vf, hf) / 2) * 0.9, 2.2);
  casa = { alvo: centro, pos: centro.clone().add(new THREE.Vector3(0, 0.35, 1).normalize().multiplyScalar(dist)) };
  controls.target.copy(casa.alvo);
  camera.position.copy(casa.pos);
  aplicarDestaque();
}

let destaque = null;
function aplicarDestaque() {
  pecas.forEach(function (m) {
    const u = m.userData, mat = m.material, on = !destaque || u.organ === destaque;
    if (on) {
      mat.transparent = u.baseTransparent;
      mat.opacity = u.baseOpacity;
      mat.emissive.setHex(destaque ? mat.color.getHex() : 0x000000);
      mat.emissiveIntensity = destaque ? 0.35 : 0;
    } else {
      mat.transparent = true;
      mat.opacity = Math.min(u.baseOpacity, u.organ === 'membrana' ? 0.08 : 0.15);
      mat.emissive.setHex(0x000000);
    }
    mat.needsUpdate = true;
  });
}

function destacar(id) {
  destaque = id || null;
  aplicarDestaque();
  if (!destaque) { controls.autoRotate = true; return animar(casa.alvo.clone(), casa.pos.clone()); }
  controls.autoRotate = false;
  const caixa = new THREE.Box3();
  let achou = false;
  pecas.forEach(function (m) { if (m.userData.organ === destaque) { caixa.expandByObject(m); achou = true; } });
  if (!achou) return;
  const centro = caixa.getCenter(new THREE.Vector3());
  const tam = caixa.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  animar(centro, centro.clone().add(dir.multiplyScalar(Math.min(Math.max(tam * 1.6, 1.1), 7))));
}

function resetView() { destacar(null); }

window.montarCelula = function (forma, csv) { montarCelula(forma, String(csv || '').split(',')); };
window.destacar = destacar;
window.resetView = resetView;

// ----- Toque -----
const raycaster = new THREE.Raycaster();
const ponteiro = new THREE.Vector2();
let baixo = null;
renderer.domElement.addEventListener('pointerdown', function (e) { baixo = { x: e.clientX, y: e.clientY, t: performance.now() }; controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerup', function (e) {
  if (!baixo) return;
  const moveu = Math.hypot(e.clientX - baixo.x, e.clientY - baixo.y), dt = performance.now() - baixo.t;
  baixo = null;
  if (moveu > 10 || dt > 450) return;
  ponteiro.x = (e.clientX / window.innerWidth) * 2 - 1;
  ponteiro.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ponteiro, camera);
  const hits = raycaster.intersectObjects(pecas, false).filter(function (h) { return h.object.material.opacity > 0.12; });
  // A membrana envolve tudo: só conta se não houver nada dentro na direção do toque
  const dentro = hits.find(function (h) { return h.object.userData.organ !== 'membrana'; });
  const hit = dentro || hits[0];
  send({ type: 'tap', organ: hit ? hit.object.userData.organ : null });
});

// ----- Animação -----
function quadro() {
  if (anim) {
    const k = Math.min((performance.now() - anim.t) / 700, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    controls.target.lerpVectors(anim.a0, anim.a1, e);
    camera.position.lerpVectors(anim.p0, anim.p1, e);
    if (k >= 1) anim = null;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(quadro);
}
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

montarCelula('redonda', ['membrana', 'nucleo', 'mitocondria', 'ribossomo', 'reticulo', 'golgi', 'lisossomo', 'centriolo']);
document.getElementById('msg').remove();
window.__ready = true;
quadro();
send({ type: 'ready' });
</script>
</body>
</html>`;
