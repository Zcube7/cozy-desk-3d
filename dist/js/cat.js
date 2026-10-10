// The long-haired white cat from the reference: lilac-grey shading on the back,
// a taupe cap with darker forehead stripes, pink ears, fluffy cheeks and chest,
// and huge round dark eyes when it wakes up for belly rubs.
import * as THREE from 'three';
import { mat, mesh, group, ball, tube, softForm, strand, surfaceProbe, bake, shadowless } from './kit.js';

const { smoothstep } = THREE.MathUtils;
const WHITE = new THREE.Color('#fbf9f6'), LILAC = new THREE.Color('#d6c8cf');
const TAUPE = new THREE.Color('#c6b3b7'), STRIPE = new THREE.Color('#816b72');

const coat = mat('#ffffff', 0.97, { vertexColors: true });
const fur = mat('#fbf9f6', 0.97);

const bodyShade = (x, y, z) => WHITE.clone().lerp(LILAC, smoothstep(y * 0.75 - z * 0.45 + 0.1, 0, 0.95) * 0.85);

function headShade(x, y, z) {
  const cap = smoothstep(y + 0.1 * z, -0.28, 0.42);
  const muzzle = smoothstep(z, 0.55, 0.95) * (1 - smoothstep(y, -0.05, 0.3));
  const stripes = smoothstep(y, 0.3, 0.75) * smoothstep(z, 0.1, 0.5) * (1 - smoothstep(Math.abs(x), 0.12, 0.32)) * (0.5 + 0.5 * Math.cos(x * 34)) ** 2;
  const brow = smoothstep(y, 0.2, 0.62) * smoothstep(z, 0.2, 0.6) * (1 - smoothstep(Math.abs(x), 0.04, 0.26));
  return WHITE.clone().lerp(TAUPE, cap * (1 - muzzle) * 0.92).lerp(STRIPE, Math.max(stripes * 0.9, brow * 0.55));
}

const earShape = new THREE.Shape();
earShape.moveTo(-0.132, -0.10);
earShape.quadraticCurveTo(-0.135, 0.025, -0.026, 0.220);
earShape.quadraticCurveTo(0.002, 0.264, 0.045, 0.20);
earShape.quadraticCurveTo(0.135, 0.018, 0.128, -0.10);
earShape.quadraticCurveTo(0, -0.142, -0.132, -0.10);
const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.021, bevelSegments: 3, steps: 1, curveSegments: 10 });

const noseShape = new THREE.Shape();
noseShape.moveTo(-0.034, 0.005);
noseShape.quadraticCurveTo(-0.04, 0.026, 0, 0.023);
noseShape.quadraticCurveTo(0.041, 0.026, 0.033, 0.005);
noseShape.quadraticCurveTo(0.014, -0.025, 0, -0.027);
noseShape.quadraticCurveTo(-0.013, -0.025, -0.034, 0.005);

function buildHead(roll) {
  const head = group(roll, [-0.48, 0.105, 0.145]);
  head.rotation.y = 0.24;
  const skull = softForm(head, coat, [0, 0, 0], [0.4, 0.335, 0.32], { cheeks: 0.07, fluff: 0.008, color: headShade });
  const on = surfaceProbe(skull.geometry);
  const at = (x, y, offset) => on(x, y, offset).point;
  const facing = (o, normal) => o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  for (const side of [-1, 1]) {
    const ear = group(head, [side * 0.242, 0.257, -0.024]);
    ear.rotation.z = -side * 0.23;
    mesh(earGeo, mat('#cbb9bd', 0.95), ear);
    mesh(earGeo, mat('#f2c1c8', 0.95), ear, [0, 0.012, 0.104], [0.64, 0.68, 0.13]);
    for (let i = 0; i < 2; i++) {
      strand(ear, fur, [[side * 0.02 * i, -0.06, 0.11], [side * (0.025 + 0.015 * i), 0.0, 0.125], [side * (0.035 + 0.015 * i), 0.06, 0.12]],
        { width: 0.013, depth: 0.009, profile: 'tip' });
    }
    bake(ear);
    // Fluffy cheeks: soft puffs along the jaw and a few short tufts flaring out.
    for (const [x, y, z, s] of [[0.33, -0.1, 0.1, 1], [0.3, -0.19, 0.12, 0.95], [0.21, -0.25, 0.15, 0.9]]) {
      softForm(head, fur, [side * x, y, z], [0.1 * s, 0.085 * s, 0.075 * s], { fluff: 0.03, detail: 0.6 });
    }
    for (let i = 0; i < 3; i++) {
      strand(head, fur, [[side * 0.33, -0.06 - i * 0.06, 0.08], [side * 0.43, -0.09 - i * 0.065, 0.08], [side * (0.5 - i * 0.03), -0.13 - i * 0.07, 0.06]],
        { width: 0.045, depth: 0.03, profile: 'tuft' });
    }
  }
  // Chest ruff under the chin.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.1;
    softForm(head, fur, [x, -0.28 + Math.abs(x) * 0.25, 0.14 - Math.abs(x) * 0.2], [0.1, 0.085, 0.08], { fluff: 0.03, detail: 0.6 });
  }

  // Muzzle: whisker pads, nose, mouth and whiskers.
  for (const side of [-1, 1]) {
    ball(head, fur, at(side * 0.075, -0.115, -0.03), [0.105, 0.07, 0.06]);
    for (let i = 0; i < 3; i++) {
      tube(head, mat('#8f8a92'), [at(side * 0.17, -0.11 + i * 0.026, 0.01), [side * 0.33, -0.1 + i * 0.04, 0.33], [side * (0.5 - i * 0.03), -0.14 + i * 0.065, 0.27]], 0.0032);
    }
  }
  const nose = mesh(new THREE.ExtrudeGeometry(noseShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, steps: 1 }),
    mat('#e9a0aa', 0.6), head, at(0, -0.072, 0.006));
  facing(nose, on(0, -0.072).normal);
  const mouthInk = mat('#80656d');
  tube(head, mouthInk, [at(0, -0.095, 0.012), at(0, -0.13, 0.012), at(-0.045, -0.148, 0.01)], 0.006);
  tube(head, mouthInk, [at(0, -0.13, 0.012), at(0.045, -0.148, 0.01)], 0.006);

  const faces = { sleep: group(head), love: group(head) };
  for (const side of [-1, 1]) {
    const x = side * 0.155, y = 0.03;
    tube(faces.sleep, mat('#6f6870'), [at(x - 0.075, y + 0.022), at(x - 0.03, y - 0.012), at(x + 0.03, y - 0.012), at(x + 0.075, y + 0.022)], 0.011);
    // Awake: big glossy eyes — dark rim, thin white ring, near-black iris, two highlights.
    const { point, normal } = on(x, y, 0.002);
    const eye = group(faces.love, point);
    facing(eye, normal);
    ball(eye, mat('#2b2627', 0.5), [0, 0, 0], [0.104, 0.106, 0.018]);
    ball(eye, mat('#fdfcf8', 0.4), [0, 0, 0.004], [0.094, 0.096, 0.02]);
    ball(eye, mat('#24282c', 0.16), [0, 0, 0.008], [0.083, 0.085, 0.022]);
    ball(eye, mat('#4c545a', 0.3), [0.004, -0.036, 0.022], [0.056, 0.03, 0.01]);
    ball(eye, mat('#ffffff', 0.3), [-0.028, 0.034, 0.03], [0.028, 0.03, 0.007]);
    ball(eye, mat('#ffffff', 0.3), [0.03, -0.03, 0.03], [0.012, 0.012, 0.005]);
    const blush = ball(faces.love, mat('#efb6be', 0.95), at(side * 0.27, -0.075, 0.012), [0.045, 0.024, 0.009]);
    blush.rotation.y = side * 0.6;
  }
  faces.love.visible = false;
  for (const g of Object.values(faces)) bake(shadowless(g));
  return { head, faces };
}

function buildTail(roll) {
  const tail = group(roll, [0.52, 0.045, -0.14]);
  const curve = new THREE.CatmullRomCurve3([[0, 0, 0], [0.31, 0.015, -0.05], [0.44, -0.06, 0.2], [0.27, -0.12, 0.48], [-0.05, -0.115, 0.5], [-0.31, -0.07, 0.4]].map(p => new THREE.Vector3(...p)));
  const rings = 48, sides = 14;
  const geo = new THREE.TubeGeometry(curve, rings, 0.16, sides, false), p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3), v = new THREE.Vector3();
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, center = curve.getPointAt(t), taper = 0.99 - 0.7 * t ** 1.8;
    for (let j = 0; j <= sides; j++) {
      const index = i * (sides + 1) + j;
      const puff = 1 + 0.07 * Math.sin(j * 2.3 + i * 1.1) * Math.sin(i * 0.8 + j);
      v.fromBufferAttribute(p, index).sub(center).multiplyScalar(taper * puff).add(center);
      p.setXYZ(index, v.x, v.y, v.z);
      WHITE.clone().lerp(LILAC, 0.35 + 0.55 * t).toArray(colors, index * 3);
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  mesh(geo, coat, tail);
  ball(tail, mat('#d2c3ca', 0.97), [-0.31, -0.07, 0.4], [0.05, 0.048, 0.05]);
  return tail;
}

export function createCat(world, { reducedMotion }) {
  const cat = group(world, [1.69, 0.47, 1.04]);
  cat.rotation.y = -0.10;
  cat.userData.target = 'cat';
  const roll = group(cat);

  const body = softForm(roll, coat, [0.14, 0, 0], [0.64, 0.315, 0.365], { fluff: 0.014, color: bodyShade });
  body.userData.keep = true;
  softForm(roll, coat, [-0.23, 0.045, 0.015], [0.385, 0.33, 0.355], { fluff: 0.02, color: bodyShade });
  softForm(roll, mat('#f7efeb', 1), [0.13, -0.294, 0.025], [0.387, 0.043, 0.232], { fluff: 0.025 });

  const { head, faces } = buildHead(roll);
  const paws = [];
  for (let i = 0; i < 4; i++) {
    const paw = group(roll, [i < 2 ? -0.28 : 0.43, -0.14, i % 2 ? -0.19 : 0.24]);
    softForm(paw, fur, [0, -0.031, 0], [0.133, 0.119, 0.13], { fluff: 0.016, detail: 0.6 });
    const pad = mat('#e8a2b0', 0.9);
    ball(paw, pad, [0, -0.145, 0], [0.061, 0.012, 0.055]);
    for (let j = 0; j < 4; j++) {
      const a = (j - 1.5) * 0.48;
      ball(paw, pad, [Math.sin(a) * 0.088, -0.126, Math.cos(a) * 0.096], [0.022, 0.011, 0.023]);
    }
    paws.push(bake(paw));
  }
  const tail = buildTail(roll);
  bake(roll);
  bake(head);

  function update(time, t, amount) {
    const idle = reducedMotion ? 0 : 1;
    roll.rotation.x = -Math.PI * 0.77 * amount;
    cat.position.y = 0.47 + Math.sin(Math.PI * amount) * 0.095 + 0.06 * amount;
    roll.position.y = idle * Math.sin(time * 2.1) * 0.008 * (1 - amount);
    // Turn the head toward the visitor as the body rolls; keep the muzzle off the rug.
    head.rotation.x = Math.PI * 0.67 * amount;
    head.rotation.z = idle * Math.sin(t * 4) * 0.055 * amount;
    head.position.y = 0.105 - 0.065 * amount;
    head.position.z = 0.145 - 0.235 * amount;
    faces.sleep.visible = amount < 0.38;
    faces.love.visible = amount >= 0.38;
    paws.forEach((paw, i) => {
      const front = i < 2, near = i % 2 === 0;
      paw.position.set((front ? -0.28 : 0.43) + (front ? 0.32 : 0) * amount, -0.14 - 0.145 * amount, (near ? 0.24 : -0.19) + (near ? 0.04 : -0.025) * amount);
      paw.rotation.z = (front ? -1 : 1) * 0.24 * amount + idle * Math.sin(t * 5.5 + i) * 0.17 * amount;
      paw.rotation.x = (near ? 0.12 : -0.12) * amount;
    });
    tail.rotation.x = idle * Math.sin(time * 1.5) * 0.018 + Math.sin(t * 5) * 0.12 * amount;
    body.scale.y = 1 + idle * Math.sin(time * 2.1) * 0.017;
  }

  return { root: cat, head, update };
}
