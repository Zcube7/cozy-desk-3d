// The diorama: floor, walls, window, shelf, desk, computer and the cat's rug.
// Nothing here moves, so it is baked into one mesh per material afterwards.
import * as THREE from 'three';
import { mat, mesh, group, ball, box, cyl, tube, canvasTexture, bake } from './kit.js';

const wood = mat('#d6a579'), woodLight = mat('#ecc8a0'), cream = mat('#f5f1e6');
const leafDark = mat('#7fa38c'), leafLight = mat('#a4bc91');

function plant(parent, pos, size) {
  const p = group(parent, pos);
  p.scale.setScalar(size);
  cyl(p, mat('#e6c6b4'), [0, 0.16, 0], 0.21, 0.32);
  cyl(p, mat('#736a55'), [0, 0.326, 0], 0.18, 0.012);
  tube(p, leafDark, [[0, 0.31, 0], [0.02, 0.62, 0], [-0.02, 0.91, 0]], 0.018);
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4;
    const leaf = ball(p, i % 2 ? leafDark : leafLight, [Math.sin(a) * 0.15, 0.44 + i * 0.07, Math.cos(a) * 0.11], [0.09, 0.22, 0.055]);
    leaf.rotation.z = Math.sin(a) * 0.75;
    leaf.rotation.x = Math.cos(a) * 0.65;
  }
}

function screenTexture() {
  return canvasTexture(512, 320, g => {
    g.fillStyle = '#263c59';
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = '#344c6c';
    g.fillRect(0, 0, 512, 34);
    ['#efa99d', '#f0cb86', '#a0cdb4'].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(19 + i * 19, 17, 5, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = '#a7c5df';
    g.font = '20px monospace';
    g.fillText('a little happy place', 26, 76);
    [180, 238, 100, 185, 270, 170, 140].forEach((w, i) => {
      g.fillStyle = ['#92b9dd', '#e5c693', '#a9ceb2'][i % 3];
      g.fillRect(28 + (i % 3) * 18, 105 + i * 22, w, 7);
    });
    g.fillStyle = '#f3d6bd';
    g.fillRect(369, 88, 83, 92);
    g.fillStyle = '#d1e5ed';
    g.fillRect(350, 180, 120, 20);
    g.fillStyle = '#e8ae9f';
    g.beginPath();
    g.arc(409, 129, 18, 0, Math.PI * 2);
    g.fill();
  });
}

export function buildRoom(world) {
  const room = group(world);

  // An open diorama keeps all three touch targets in view.
  box(room, mat('#bfd0e5'), [0, -0.22, 0], [6.8, 0.4, 5.15], 0.23);
  box(room, mat('#e8dac7'), [0, -0.005, 0], [6.65, 0.12, 5.02], 0.16);
  const seam = mat('#d8c6af');
  for (let i = -3; i <= 3; i++) box(room, seam, [i * 0.83, 0.059, 0], [0.015, 0.006, 4.86], 0.002);
  for (let i = -2; i <= 2; i++) box(room, seam, [i * 0.83 + 0.415, 0.06, i % 2 ? 0.8 : -0.8], [0.8, 0.005, 0.013], 0.002);
  box(room, mat('#bfd3e7'), [0, 1.30, -2.42], [6.55, 2.6, 0.16], 0.09);
  box(room, mat('#d8e5ed'), [-3.24, 1.30, -0.80], [0.16, 2.6, 3.3], 0.09);
  const skirting = mat('#e4edf3');
  box(room, skirting, [0, 0.16, -2.3], [6.3, 0.25, 0.065], 0.02);
  box(room, skirting, [-3.13, 0.16, -0.8], [0.065, 0.25, 3.12], 0.02);

  // Sunlit window and curtains.
  box(room, cream, [-1.5, 1.68, -2.29], [1.65, 1.52, 0.14], 0.06);
  box(room, mat('#cae7f3', 0.6, { emissive: '#9ecbe3', emissiveIntensity: 0.23 }), [-1.5, 1.68, -2.205], [1.41, 1.28, 0.025], 0.015);
  ball(room, mat('#fff1bd', 1, { emissive: '#ffe5ac', emissiveIntensity: 0.35 }), [-1.81, 2.02, -2.182], [0.19, 0.19, 0.012]);
  box(room, cream, [-1.5, 1.68, -2.15], [0.065, 1.3, 0.07], 0.015);
  box(room, cream, [-1.5, 1.68, -2.15], [1.43, 0.06, 0.07], 0.015);
  box(room, cream, [-1.5, 0.94, -2.15], [1.9, 0.11, 0.34], 0.04);
  const curtain = mat('#f2ede5');
  for (let i = 0; i < 4; i++) {
    ball(room, curtain, [-2.45 + i * 0.1, 1.8, -2.07], [0.087, 0.78, 0.07]);
    ball(room, curtain, [-0.86 + i * 0.1, 1.8, -2.07], [0.087, 0.78, 0.07]);
  }
  tube(room, wood, [[-2.55, 2.57, -2.09], [-0.40, 2.57, -2.09]], 0.033);

  // Wall shelf, books, plants and a framed picture.
  box(room, woodLight, [1.05, 2.06, -2.16], [1.92, 0.11, 0.43], 0.04);
  box(room, wood, [0.43, 1.95, -2.19], [0.07, 0.22, 0.27], 0.025);
  box(room, wood, [1.7, 1.95, -2.19], [0.07, 0.22, 0.27], 0.025);
  ['#dfb0a8', '#eacb83', '#9bbcd4', '#97aea4'].forEach((color, i) => {
    const book = box(room, mat(color), [0.5 + i * 0.14, 2.34, -2.19], [0.115, 0.44 + (i % 2) * 0.07, 0.23], 0.015);
    if (i === 3) book.rotation.z = -0.13;
  });
  plant(room, [1.49, 2.11, -2.16], 0.61);
  plant(room, [-2.62, 0.06, -1.49], 1.55);
  const picture = group(room, [2.35, 1.71, -2.30]);
  box(picture, woodLight, [0, 0, 0], [0.57, 0.68, 0.10], 0.045);
  box(picture, cream, [0, 0, 0.058], [0.45, 0.55, 0.01], 0.01);
  ball(picture, mat('#eac776'), [0.06, 0.08, 0.072], [0.095, 0.095, 0.008]);
  box(picture, mat('#acc5d0'), [0, -0.15, 0.073], [0.39, 0.13, 0.01], 0.02);

  // Desk with drawers, monitor, keyboard, mouse, mug and notebook.
  const desk = group(room, [-1.50, 0, 0.42]);
  box(desk, woodLight, [0, 1.28, 0], [2.85, 0.17, 1.32], 0.09);
  box(desk, wood, [-0.97, 0.67, 0], [0.55, 1.15, 1.03], 0.04);
  for (let i = 0; i < 3; i++) {
    box(desk, mat('#e5bb91'), [-0.97, 0.35 + i * 0.33, 0.536], [0.48, 0.29, 0.03], 0.018);
    box(desk, cream, [-0.97, 0.38 + i * 0.33, 0.56], [0.14, 0.035, 0.035], 0.012);
  }
  for (const z of [-0.46, 0.46]) box(desk, cream, [1.13, 0.65, z], [0.13, 1.2, 0.13], 0.03).rotation.z = -0.07;

  const monitor = group(desk, [-0.22, 1.37, -0.22]);
  monitor.rotation.y = 1.05;
  const shell = mat('#c4ced9');
  box(monitor, shell, [0, 0.04, 0], [0.62, 0.07, 0.37], 0.035);
  box(monitor, shell, [0, 0.3, 0], [0.10, 0.48, 0.10], 0.035);
  box(monitor, mat('#cbd9e4'), [0, 0.7, 0], [1.32, 0.88, 0.13], 0.055);
  mesh(new THREE.PlaneGeometry(1.19, 0.72), new THREE.MeshBasicMaterial({ map: screenTexture() }), monitor, [0, 0.72, 0.073]);
  ball(monitor, mat('#749abe'), [0, 0.308, 0.083], [0.023, 0.008, 0.003]);

  const keyboard = group(desk, [0.95, 1.4, 0.37]);
  keyboard.rotation.y = 0.95;
  box(keyboard, mat('#c3cfdc'), [0, 0, 0], [0.94, 0.07, 0.34], 0.03);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 11; c++) {
      box(keyboard, mat((c + r) % 5 === 0 ? '#a0b4cb' : '#f7f5ef'), [-0.405 + c * 0.081, 0.045, -0.11 + r * 0.072], [0.063, 0.022, 0.052], 0.008);
    }
  }
  box(keyboard, cream, [0, 0.047, 0.107], [0.33, 0.025, 0.04], 0.008);
  ball(desk, cream, [0.60, 1.4, 0.49], [0.085, 0.045, 0.13]);

  const cup = group(desk, [-1.12, 1.39, 0.28]);
  const ceramic = mat('#eac4b6');
  cyl(cup, ceramic, [0, 0.13, 0], 0.115, 0.25);
  cyl(cup, mat('#5e4436'), [0, 0.263, 0], 0.097, 0.005);
  mesh(new THREE.TorusGeometry(0.085, 0.023, 8, 24), ceramic, cup, [0.115, 0.13, 0]);
  box(desk, mat('#8bacc5'), [-0.94, 1.4, -0.34], [0.49, 0.075, 0.39], 0.025);
  box(desk, cream, [-0.93, 1.445, -0.34], [0.43, 0.03, 0.35], 0.012);

  // The cat's rug.
  const rug = group(room, [1.69, 0.10, 1.04]);
  cyl(rug, mat('#c7bbd2'), [0, 0, 0], 1, 0.04).scale.set(1.05, 0.04, 0.77);
  cyl(rug, mat('#e0d8e6'), [0, 0.025, 0], 1, 0.024).scale.set(0.94, 0.024, 0.67);

  return bake(room, { deep: true });
}
