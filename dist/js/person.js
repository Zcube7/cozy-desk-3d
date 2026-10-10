// The boy from the reference drawing: a thick black bowl cut with pointed bangs,
// a content closed-eye smile, pale blue LI-NING tee, pink shorts with striped
// cuffs and grey sandals. Joints are separate groups, posed every frame.
import * as THREE from 'three';
import { mat, mesh, group, ball, box, cyl, tube, bone, softForm, strand, canvasTexture, surfaceProbe, bake, shadowless } from './kit.js';

const P = {
  skin: mat('#f8d5bf', 0.72),
  skinLine: mat('#e6b39c', 0.8),
  earInner: mat('#efb2ad', 0.8),
  hair: mat('#1b1c20', 0.5),
  hairShine: mat('#41444c', 0.45),
  ink: mat('#3a2e33', 0.6),
  shirt: mat('#86bdea', 0.85),
  shirtDark: mat('#6fa6d6', 0.85),
  shorts: mat('#f1dcdc', 0.88),
  sole: mat('#e4ddd3', 0.9),
  strap: mat('#9196a0', 0.7),
  sleeve: mat('#86bdea', 0.85, { side: THREE.DoubleSide }),
  chair: mat('#7499be'),
  chairDark: mat('#4c6989'),
  wheel: mat('#434e63'),
};
const deg = Math.PI / 180;
const { smoothstep } = THREE.MathUtils;

const shirtPrint = () => canvasTexture(512, 256, g => {
  g.fillStyle = '#7b5a54';
  g.beginPath();
  g.arc(112, 74, 30, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#3b2a28';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(112, 44); g.lineTo(112, 104);
  g.moveTo(82, 74); g.lineTo(142, 74);
  g.moveTo(92, 52); g.quadraticCurveTo(108, 74, 92, 96);
  g.moveTo(132, 52); g.quadraticCurveTo(116, 74, 132, 96);
  g.stroke();
  g.fillStyle = '#243041';
  g.font = 'italic 900 88px "Arial Black", "Segoe UI Black", Arial, sans-serif';
  g.fillText('LI-NING', 48, 196);
});

const basketball = () => canvasTexture(128, 128, g => {
  g.fillStyle = '#7d5a52';
  g.beginPath();
  g.arc(64, 64, 60, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#33221f';
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(64, 6); g.lineTo(64, 122);
  g.moveTo(6, 64); g.lineTo(122, 64);
  g.moveTo(24, 20); g.quadraticCurveTo(58, 64, 24, 108);
  g.moveTo(104, 20); g.quadraticCurveTo(70, 64, 104, 108);
  g.stroke();
});

// Diagonal red and black stripes that tile around a cuff.
const cuffStripes = () => {
  const texture = canvasTexture(512, 64, g => {
    g.fillStyle = '#2a2226';
    g.fillRect(0, 0, 512, 64);
    g.fillStyle = '#a8343d';
    for (let x = -32; x < 544; x += 512 / 18) {
      g.beginPath();
      g.moveTo(x, 64); g.lineTo(x + 13, 64); g.lineTo(x + 27, 0); g.lineTo(x + 14, 0);
      g.fill();
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
};

// ---- Hair: one thick cap whose rim rolls under onto the scalp ----------------

// Polar angle (degrees from the crown) where the hair ends, by azimuth (0 = nose).
const HAIRLINE = [[0, 90], [28, 91], [52, 97], [70, 93], [88, 80], [106, 88], [128, 106], [152, 124], [180, 133]];

function hairline(phi) {
  const a = Math.abs(phi) / deg;
  let i = 1;
  while (i < HAIRLINE.length - 1 && HAIRLINE[i][0] < a) i++;
  const [a0, t0] = HAIRLINE[i - 1], [a1, t1] = HAIRLINE[i];
  let theta = t0 + (t1 - t0) * THREE.MathUtils.smootherstep(a, a0, a1);
  // Pointed fringe clumps across the forehead, uneven and slightly swept like real bangs.
  const u = (phi / deg + 7) / 15, clump = Math.floor(u), f = u - clump;
  const tri = f < 0.62 ? f / 0.62 : (1 - f) / 0.38;
  const length = 8 + 6 * Math.abs(Math.sin(clump * 12.9898) * 43758.5453 % 1);
  theta += length * Math.pow(tri, 2.2) * (1 - smoothstep(a, 50, 80));
  return theta * deg;
}

const ellipsoidRadius = (d, rx, ry, rz) => 1 / Math.hypot(d.x / rx, d.y / ry, d.z / rz);

function hairCap(head) {
  const rows = 32, cols = 216, positions = [], indices = [];
  const d = new THREE.Vector3();
  for (let r = 0; r <= rows; r++) {
    const s = r / rows;
    for (let c = 0; c < cols; c++) {
      const phi = (c / cols) * Math.PI * 2 - Math.PI;
      const theta = s * hairline(phi);
      d.set(Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi));
      const outer = ellipsoidRadius(d, 0.615, 0.665, d.z > 0 ? 0.552 : 0.6) * (1 + 0.012 * Math.sin(phi * 26 + s * 5) * s);
      const inner = ellipsoidRadius(d, 0.485, 0.455, 0.43);
      const roll = THREE.MathUtils.clamp((s - 0.86) / 0.14, 0, 1);
      const radius = inner + (outer - inner) * Math.sqrt(1 - roll * roll);
      positions.push(d.x * radius, d.y * radius + 0.012, d.z * radius - 0.008);
      if (r < rows) {
        const a = r * cols + c, b = r * cols + (c + 1) % cols;
        indices.push(a, a + cols, b, b, a + cols, b + cols);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  mesh(geo, P.hair, head);

  // A point on the cap's outer surface, for laying strands on it.
  const onCap = (thetaDeg, phiDeg, lift = 0) => {
    const t = thetaDeg * deg, p = phiDeg * deg;
    d.set(Math.sin(t) * Math.sin(p), Math.cos(t), Math.sin(t) * Math.cos(p));
    const r = ellipsoidRadius(d, 0.615, 0.665, d.z > 0 ? 0.552 : 0.6) + lift;
    return [d.x * r, d.y * r + 0.012, d.z * r - 0.008];
  };
  const normal = p => new THREE.Vector3(p.x / 0.6, (p.y - 0.012) / 0.66, p.z / 0.57).normalize();

  // Soft clumps sweeping from the crown give the mop its texture.
  for (const [phi, sweep] of [[-62, -6], [-40, -4], [-18, -2], [4, 3], [26, 5], [48, 7], [-100, -8], [100, 8], [-135, -6], [135, 6], [180, 0]]) {
    const end = hairline(phi * deg) / deg - 13;
    strand(head, P.hair, [onCap(12, phi - sweep * 2, 0.0), onCap(end * 0.5, phi - sweep, 0.022), onCap(end, phi, 0.006)],
      { width: 0.11, depth: 0.035, normal, profile: 'tip' });
  }
  // A few lighter strokes, like the grey highlights in the drawing.
  for (const phi of [-48, -22, 8, 36]) {
    tube(head, P.hairShine, [onCap(30, phi + 6, 0.01), onCap(48, phi + 2, 0.014), onCap(66, phi - 3, 0.01)], 0.0042);
  }
  // The little curl on the crown.
  const curlBase = onCap(16, 150, -0.01);
  strand(head, P.hair, [curlBase, [curlBase[0] + 0.01, curlBase[1] + 0.09, curlBase[2] + 0.02],
    [curlBase[0] + 0.07, curlBase[1] + 0.14, curlBase[2] + 0.06], [curlBase[0] + 0.12, curlBase[1] + 0.1, curlBase[2] + 0.09]],
  { width: 0.04, depth: 0.022, profile: 'tip' });
}

// ---- Face ------------------------------------------------------------------

function buildHead(person) {
  const head = group(person, [0, 2.48, 0.06]);
  head.userData.target = 'head';
  const face = softForm(head, P.skin, [0, 0, 0], [0.5, 0.47, 0.45], { cheeks: 0.09 });
  const on = surfaceProbe(face.geometry);
  const at = (x, y, offset) => on(x, y, offset).point;

  for (const side of [-1, 1]) {
    const ear = group(head, [side * 0.535, -0.075, -0.03]);
    ear.rotation.set(0, side * 1.05, side * -0.08);
    ball(ear, P.skin, [0, 0, 0], [0.07, 0.1, 0.058]);
    ball(ear, P.earInner, [0, -0.004, 0.036], [0.038, 0.062, 0.02]);
  }
  hairCap(head);

  // Blush with little hatching strokes, shared by every expression.
  const blush = mat('#f19aa3', 0.95, { transparent: true, opacity: 0.5, depthWrite: false });
  for (const side of [-1, 1]) {
    const { point, normal } = on(side * 0.3, -0.2, 0.008);
    const patch = ball(head, blush, point, [0.085, 0.048, 0.01]);
    patch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    for (let i = 0; i < 3; i++) {
      const x = side * 0.3 + (i - 1) * 0.03;
      tube(head, mat('#e2848e'), [at(x - 0.008, -0.226, 0.014), at(x + 0.008, -0.178, 0.014)], 0.0035);
    }
  }
  ball(head, mat('#e9a68f'), at(0, -0.165, 0.004), [0.016, 0.011, 0.01]);

  const faces = { idle: group(head), hurt: group(head), laugh: group(head) };
  for (const side of [-1, 1]) {
    const x = side * 0.235, y = -0.1;
    // Idle: the content, closed-eye arcs from the drawing, with a tiny lash.
    tube(faces.idle, P.ink, [at(x - 0.068, y - 0.012), at(x - 0.02, y + 0.022), at(x + 0.02, y + 0.022), at(x + 0.068, y - 0.012)], 0.0105);
    tube(faces.idle, P.ink, [at(x + side * 0.064, y - 0.008), at(x + side * 0.088, y - 0.03)], 0.006);
    // Hurt: squeezed > < eyes.
    tube(faces.hurt, P.ink, [at(x - side * 0.05, y + 0.04), at(x + side * 0.035, y), at(x - side * 0.05, y - 0.04)], 0.012);
    // Laugh: tall, happy arcs.
    tube(faces.laugh, P.ink, [at(x - 0.07, y - 0.025), at(x - 0.03, y + 0.03), at(x + 0.03, y + 0.03), at(x + 0.07, y - 0.025)], 0.015);
  }
  tube(faces.idle, mat('#6e4648'), [at(-0.09, -0.262), at(-0.075, -0.278), at(-0.03, -0.296), at(0.025, -0.294), at(0.07, -0.276), at(0.088, -0.258)], 0.0095);
  tube(faces.hurt, P.ink, [at(-0.07, -0.29), at(-0.035, -0.268), at(0, -0.29), at(0.035, -0.268), at(0.07, -0.29)], 0.009);
  const tear = ball(faces.hurt, mat('#92cfe9', 0.22, { transparent: true, opacity: 0.85 }), at(0.31, -0.13, 0.02), [0.024, 0.05, 0.015]);
  tear.rotation.z = -0.13;
  const mouth = on(0, -0.27, 0.008);
  const open = mesh(new THREE.CircleGeometry(0.075, 24, Math.PI, Math.PI), mat('#7a3646', 0.7), faces.laugh, mouth.point, [1.15, 0.95, 1]);
  open.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), mouth.normal);
  const tongue = mesh(new THREE.CircleGeometry(0.042, 20, Math.PI, Math.PI), mat('#ef9aa4', 0.8), faces.laugh, at(0, -0.318, 0.011), [1.1, 0.6, 1]);
  tongue.quaternion.copy(open.quaternion);
  faces.hurt.visible = faces.laugh.visible = false;

  for (const g of Object.values(faces)) bake(shadowless(g));
  return { head, faces };
}

// ---- Body ------------------------------------------------------------------

function buildTorso(person) {
  const torso = group(person, [0, 1.56, 0.02]);
  const shirt = box(torso, P.shirt, [0, 0, 0], [0.9, 0.82, 0.58], 0.22);
  // A slightly A-line tee with soft, sloped shoulders.
  const p = shirt.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 0.41, hem = Math.max(0, -y) ** 2, top = Math.max(0, y) ** 3;
    p.setXYZ(i, p.getX(i) * (1 + 0.07 * hem - 0.05 * top), p.getY(i), p.getZ(i) * (1 + 0.04 * hem));
  }
  const collar = mesh(new THREE.TorusGeometry(0.15, 0.022, 10, 32), P.shirtDark, torso, [0, 0.4, 0.035]);
  collar.rotation.x = Math.PI / 2 + 0.3;
  cyl(torso, P.skin, [0, 0.47, 0.02], 0.115, 0.22);
  const print = mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshStandardMaterial({
    map: shirtPrint(), transparent: true, roughness: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
  }), torso, [0.01, 0.1, 0.293]);
  print.castShadow = false;
  for (const side of [-1, 1]) ball(torso, P.shirt, [side * 0.405, 0.27, 0.01], [0.16, 0.15, 0.17]);
  return bake(torso);
}

function buildLegs(person) {
  box(person, P.shorts, [0, 1.25, 0.0], [0.86, 0.28, 0.56], 0.13);
  const stripes = new THREE.MeshStandardMaterial({ map: cuffStripes(), roughness: 0.85 });
  const lining = mat('#c7aeb1', 0.95, { side: THREE.BackSide });
  const shins = [];
  for (const side of [-1, 1]) {
    // Open shorts legs with a darker lining, so the thigh shows through the hem.
    const legAt = [side * 0.215, 1.29, 0.27], tilt = Math.PI / 2 + 0.04;
    mesh(new THREE.CylinderGeometry(0.215, 0.2, 0.56, 28, 1, true), P.shorts, person, legAt).rotation.x = tilt;
    mesh(new THREE.CylinderGeometry(0.206, 0.191, 0.56, 28, 1, true), lining, person, legAt).rotation.x = tilt;
    mesh(new THREE.CylinderGeometry(0.219, 0.219, 0.05, 40, 1, true), stripes, person, [side * 0.215, 1.279, 0.524]).rotation.x = tilt;
    const thigh = mesh(new THREE.CapsuleGeometry(0.125, 0.5, 4, 14), P.skin, person, [side * 0.215, 1.27, 0.33]);
    thigh.rotation.x = tilt;
    if (side > 0) {
      const n = new THREE.Vector3(0.42, 0.9, 0.05).normalize();
      const patch = mesh(new THREE.CircleGeometry(0.068, 24), new THREE.MeshStandardMaterial({
        map: basketball(), roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2,
      }), person, [side * 0.215 + n.x * 0.215, 1.29 + n.y * 0.215, 0.24]);
      patch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      patch.castShadow = false;
    }
    ball(person, P.skin, [side * 0.215, 1.25, 0.62], [0.092, 0.094, 0.092]);

    // Shins swing from the knee; sandals ride along.
    const shin = group(person, [side * 0.215, 1.25, 0.62]);
    mesh(new THREE.CapsuleGeometry(0.078, 0.62, 6, 14), P.skin, shin, [0, -0.38, 0.03]).rotation.x = -0.05;
    ball(shin, P.skin, [0, -0.8, 0.1], [0.072, 0.055, 0.13]);
    box(shin, P.sole, [0, -0.86, 0.1], [0.18, 0.045, 0.33], 0.02);
    for (const z of [0.03, 0.15]) {
      const strap = mesh(new THREE.TorusGeometry(0.082, 0.018, 8, 18, Math.PI), P.strap, shin, [0, -0.835, z]);
      strap.scale.set(1, 1.12, 1.3);
    }
    shins.push(bake(shin));
  }
  return shins;
}

function makeArm(person, side) {
  const g = group(person);
  const sleeve = mesh(new THREE.CylinderGeometry(1.08, 1, 1, 22, 1, true), P.sleeve, g);
  const limb = new THREE.CapsuleGeometry(1, 3, 6, 14).scale(1, 0.2, 1);
  const upper = mesh(limb, P.skin, g), lower = mesh(limb, P.skin, g);
  const elbow = ball(g, P.skin, [0, 0, 0], [0.07, 0.07, 0.07]);
  const hand = group(g);
  ball(hand, P.skin, [0, 0, 0], [0.088, 0.1, 0.066]);
  for (let i = 0; i < 3; i++) ball(hand, P.skin, [(i - 1) * 0.038, 0.06, 0], [0.028, 0.056, 0.056]);
  ball(hand, P.skin, [side * 0.072, -0.02, 0.024], [0.04, 0.066, 0.045]).rotation.z = side * -0.4;
  for (const x of [-0.019, 0.019]) tube(hand, P.skinLine, [[x, 0.05, 0.056], [x, 0.088, 0.052]], 0.0026);
  bake(hand);
  return { side, sleeve, upper, lower, elbow, hand };
}

const shoulderOf = side => [side * 0.43, 1.84, 0.03];
const up = new THREE.Vector3(0, 1, 0), ve = new THREE.Vector3(), vh = new THREE.Vector3();

function poseArm(arm, elbow, hand) {
  const shoulder = shoulderOf(arm.side);
  const toElbow = [0, 1, 2].map(i => elbow[i] - shoulder[i]);
  const len = Math.hypot(...toElbow);
  bone(arm.sleeve, shoulder.map((v, i) => v - toElbow[i] / len * 0.06), shoulder.map((v, i) => v + toElbow[i] * 0.5), 0.155);
  bone(arm.upper, shoulder, elbow, 0.072);
  bone(arm.lower, elbow, hand, 0.066);
  arm.elbow.position.set(...elbow);
  arm.hand.position.set(...hand);
  arm.hand.quaternion.setFromUnitVectors(up, vh.set(...hand).sub(ve.set(...elbow)).normalize());
}

function buildChair(character) {
  const chair = group(character, [0, 0, -0.12]);
  box(chair, P.chair, [0, 1.07, -0.12], [1.0, 0.2, 0.85], 0.16);
  box(chair, P.chair, [0, 1.48, -0.47], [0.94, 1.0, 0.17], 0.14);
  box(chair, P.chairDark, [0, 0.7, -0.08], [0.14, 0.61, 0.14], 0.04);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    tube(chair, P.chairDark, [[0, 0.34, -0.08], [Math.sin(a) * 0.57, 0.22, Math.cos(a) * 0.57 - 0.08]], 0.055);
    ball(chair, P.wheel, [Math.sin(a) * 0.56, 0.15, Math.cos(a) * 0.56 - 0.08], [0.1, 0.09, 0.09]);
  }
  bake(chair, { deep: true });
}

// ---- Rig ------------------------------------------------------------------

const POSE = {
  idle: { left: [[-0.62, 1.5, 0.46], [-0.6, 1.44, 0.92]], right: [[0.6, 1.47, 0.24], [0.3, 1.55, 0.48]] },
  head: { left: [[-0.8, 2.32, 0.18], [-0.42, 2.86, 0.24]], right: [[0.8, 2.32, 0.18], [0.42, 2.86, 0.24]] },
  body: { left: [[-0.62, 1.42, 0.32], [-0.2, 1.58, 0.4]], right: [[0.62, 1.42, 0.32], [0.22, 1.52, 0.42]] },
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

export function createPerson(world, { reducedMotion }) {
  const character = group(world, [0.7, 0, 0.24]);
  character.rotation.y = -0.58;
  buildChair(character);
  const person = group(character);
  person.userData.target = 'body';
  const torso = buildTorso(person);
  const shins = buildLegs(person);
  const { head, faces } = buildHead(person);
  const arms = [makeArm(person, -1), makeArm(person, 1)];
  bake(person);
  bake(head);

  const setFace = name => { for (const [key, g] of Object.entries(faces)) g.visible = key === name; };

  function update(time, kind, t, amount) {
    const breathe = reducedMotion ? 0 : Math.sin(time * 2) * 0.012;
    person.position.y = breathe;
    person.rotation.set(0, 0, 0);
    head.rotation.set(0, 0.4 + Math.sin(time * 0.5) * 0.025, 0);
    torso.scale.set(1, 1, 1);
    let [leftElbow, leftHand] = POSE.idle.left, [rightElbow, rightHand] = POSE.idle.right;
    let face = 'idle';
    if (kind === 'head' && amount > 0) {
      head.rotation.x = -0.12 * amount;
      head.rotation.z = Math.sin(t * 6) * 0.06 * amount;
      person.position.y -= 0.055 * amount;
      if (amount > 0.28) face = 'hurt';
    } else if (kind === 'body' && amount > 0) {
      const shake = reducedMotion ? 0 : Math.sin(t * 24) * 0.038 * amount;
      person.rotation.z = shake;
      person.position.y += Math.abs(Math.sin(t * 16)) * 0.035 * amount;
      head.rotation.x = -0.13 * amount;
      head.rotation.z = -shake;
      torso.scale.y = 1 - 0.05 * amount;
      if (amount > 0.22) face = 'laugh';
    }
    if (kind !== 'idle' && amount > 0) {
      leftElbow = mix(leftElbow, POSE[kind].left[0], amount);
      leftHand = mix(leftHand, POSE[kind].left[1], amount);
      rightElbow = mix(rightElbow, POSE[kind].right[0], amount);
      rightHand = mix(rightHand, POSE[kind].right[1], amount);
    } else if (!reducedMotion) {
      leftHand = [leftHand[0], leftHand[1] + Math.sin(time * 7) * 0.008, leftHand[2]];
    }
    setFace(face);
    shins.forEach((shin, i) => {
      shin.rotation.x = kind === 'body' ? Math.sin(t * 13 + i) * 0.22 * amount : (reducedMotion ? 0 : Math.sin(time * 1.8 + i * 1.3) * 0.06);
    });
    poseArm(arms[0], leftElbow, leftHand);
    poseArm(arms[1], rightElbow, rightHand);
  }

  return { root: character, head, update };
}
