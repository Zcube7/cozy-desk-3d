// Scene setup, interaction state and the render loop.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { buildRoom } from './room.js';
import { createPerson } from './person.js';
import { createCat } from './cat.js';
import { createFraming } from './framing.js';
import { createUI } from './ui.js';

const canvas = document.querySelector('#scene'), stage = document.querySelector('#stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const controls = new OrbitControls(camera, canvas);
Object.assign(controls, {
  enableDamping: true, dampingFactor: 0.08, enablePan: false,
  minPolarAngle: 0.55, maxPolarAngle: 1.38, minAzimuthAngle: -0.85, maxAzimuthAngle: 1.1,
});

scene.add(new THREE.HemisphereLight(0xeaf3ff, 0xc6af9a, 2.0));
const key = new THREE.DirectionalLight(0xfff0d9, 3.0);
key.position.set(-3.5, 8, 5);
key.castShadow = true;
key.shadow.mapSize.setScalar(stage.clientWidth < 700 ? 1024 : 2048);
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 20 });
key.shadow.normalBias = 0.035;
key.shadow.bias = -0.0002;
scene.add(key);
const fill = new THREE.DirectionalLight(0xcadfff, 1.5);
fill.position.set(5, 4, -4);
scene.add(fill);

const world = new THREE.Group();
scene.add(world);
buildRoom(world);
const person = createPerson(world, { reducedMotion });
const cat = createCat(world, { reducedMotion });

// ---- Render scheduling ---------------------------------------------------------
// Interactions and camera moves render every frame; a calm scene only breathes,
// so it drops to 30 fps, and nothing renders while the stage is off screen.

let lastTime = performance.now(), lastDrawn = 0, awakeUntil = 0, dragging = false, onScreen = true;
function wake(ms = 600) {
  awakeUntil = Math.max(awakeUntil, performance.now() + ms);
}

// ---- Interaction state -------------------------------------------------------

const DURATION = { head: 3.15, body: 3.6, cat: 5.2 };
const RISE = 0.38, FALL = 0.55; // seconds to ease into and out of a reaction
const state = { person: 'idle', personStart: -100, personTotal: 0, cat: 'sleep', catStart: -100, catTotal: 0 };
let elapsed = 0;

const ui = createUI({ stage, camera, reducedMotion, onAction: activate });
const headPos = new THREE.Vector3(), catPos = new THREE.Vector3();

function activate(type) {
  if (!['head', 'body', 'cat'].includes(type)) throw new TypeError('Unknown interaction');
  if (type === 'cat') {
    pet();
  } else {
    state.person = type;
    state.personStart = elapsed;
    state.personTotal = DURATION[type];
  }
  ui.sync(state);
  ui.burst(type, (type === 'cat' ? cat.root : person.head).getWorldPosition(new THREE.Vector3()));
  ui.playSound(type);
  wake();
  return { interaction: type, person: state.person, cat: state.cat };
}

const ease = t => {
  t = THREE.MathUtils.clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
const envelope = (t, total) => ease(t / RISE) * (1 - ease((t - total + FALL) / FALL));

/**
 * Petting a cat that already lies on its back keeps it there longer; otherwise it rolls
 * over from wherever it is (even halfway back to sleep), so repeated petting never jumps.
 */
function pet() {
  const t = elapsed - state.catStart, lying = state.cat === 'belly';
  if (lying && t >= RISE && t <= state.catTotal - FALL) {
    state.catTotal = t + DURATION.cat - RISE;
    return;
  }
  const amount = lying ? envelope(t, state.catTotal) : 0;
  // Inverse of the smoothstep in ease(): how far into the rise that amount sits.
  state.catStart = elapsed - RISE * (0.5 - Math.sin(Math.asin(1 - 2 * amount) / 3));
  state.catTotal = DURATION.cat;
  state.cat = 'belly';
}

/** How far into its reaction a character is (0..1), returning to rest when time is up. */
function amountFor(who, rest) {
  if (state[who] === rest) return 0;
  const t = elapsed - state[who + 'Start'], total = state[who + 'Total'];
  if (t < total) return envelope(t, total);
  state[who] = rest;
  ui.sync(state);
  return 0;
}

// ---- Pointer: tap a character to interact, drag to orbit ------------------------

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let pointerStart = null, hoverAt = null;

function hitTest(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  pointer.set((clientX - r.left) / r.width * 2 - 1, -(clientY - r.top) / r.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  // The frontmost surface wins, so furniture blocks clicks behind it.
  for (let o = raycaster.intersectObjects(world.children, true)[0]?.object; o; o = o.parent) {
    if (o.userData.target) return o.userData.target;
  }
  return null;
}

canvas.addEventListener('pointerdown', e => {
  pointerStart = e.isPrimary ? { x: e.clientX, y: e.clientY, id: e.pointerId, t: performance.now() } : null;
});
canvas.addEventListener('pointerup', e => {
  if (!pointerStart || e.pointerId !== pointerStart.id) return;
  const p = pointerStart;
  pointerStart = null;
  if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8 || performance.now() - p.t > 700) return;
  const target = hitTest(e.clientX, e.clientY);
  if (target) activate(target);
});
canvas.addEventListener('pointercancel', () => { pointerStart = null; });
canvas.addEventListener('pointermove', e => {
  if (e.pointerType !== 'touch') hoverAt = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerleave', () => { hoverAt = null; pointerStart = null; });

// ---- Layout -------------------------------------------------------------------

const framing = createFraming({ camera, controls, stage });
document.querySelector('#reset').addEventListener('click', () => {
  framing.reset();
  wake();
});
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  ui.resize(w, h);
  framing.reset();
  wake();
}
new ResizeObserver(resize).observe(stage);
resize();

canvas.addEventListener('webglcontextlost', e => {
  e.preventDefault();
  document.querySelector('#error').hidden = false;
  document.querySelector('#error-message').textContent = '3D 显示暂停了，请重新打开小房间。';
});

// ---- Render loop -----------------------------------------------------------------

controls.addEventListener('start', () => { dragging = true; });
controls.addEventListener('end', () => { dragging = false; wake(); });
controls.addEventListener('change', () => wake(300));
new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(stage);
document.addEventListener('visibilitychange', () => { lastTime = performance.now(); });

function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden || !onScreen) {
    lastTime = now;
    return;
  }
  const busy = dragging || now < awakeUntil || state.person !== 'idle' || state.cat !== 'sleep';
  if (!busy && now - lastDrawn < 1000 / 30 - 4) return;
  lastDrawn = now;
  elapsed += Math.min((now - lastTime) / 1000, 0.25);
  lastTime = now;
  draw();
}

function draw() {
  const personAmount = amountFor('person', 'idle');
  person.update(elapsed, state.person, elapsed - state.personStart, personAmount);
  const catAmount = amountFor('cat', 'sleep');
  cat.update(elapsed, elapsed - state.catStart, catAmount);
  controls.update();
  scene.updateMatrixWorld();
  ui.place(person.head.getWorldPosition(headPos), cat.root.getWorldPosition(catPos));
  ui.napping(catAmount);
  if (hoverAt && !dragging) {
    canvas.style.cursor = hitTest(hoverAt.x, hoverAt.y) ? 'pointer' : 'grab';
    hoverAt = null;
  }
  renderer.render(scene, camera);
}

ui.sync(state);
draw();
document.querySelector('#loading').hidden = true;
requestAnimationFrame(frame);

if (new URLSearchParams(location.search).has('debug')) {
  window.cozy = { THREE, scene, camera, controls, renderer, framing, person, cat, state, activate, draw };
}

// Browser agent tools reuse exactly the actions offered by the visible controls.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  try {
    void Promise.resolve(document.modelContext.registerTool({
      name: 'interact_with_companions',
      title: '和人物或猫咪互动',
      description: '锤下人物脑袋、挠人物身体，或摸猫咪，播放对应的动作。',
      inputSchema: { type: 'object', properties: { target: { type: 'string', enum: ['head', 'body', 'cat'] } }, required: ['target'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async input => {
        if (!input || Object.keys(input).some(k => k !== 'target') || !['head', 'body', 'cat'].includes(input.target)) {
          throw new TypeError('target must be head, body, or cat');
        }
        const result = activate(input.target);
        await new Promise(requestAnimationFrame);
        return result;
      },
    }, { signal: lifecycle.signal })).catch(() => {});
  } catch {}
}
