// Shared materials and geometry helpers. Every model in the scene is built from
// these primitives, so shapes stay editable as plain code.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

const materials = new Map();

/** Cached standard material: identical arguments share one material, so baking can merge them. */
export function mat(color, roughness = 0.8, extra = {}) {
  const key = `${color}|${roughness}|${JSON.stringify(extra)}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness, ...extra }));
  return materials.get(key);
}

const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 20);

// Spheres get only as many segments as their size needs; most balls are tiny details.
const spheres = new Map();
const segmentsFor = size => size >= 0.3 ? 32 : size >= 0.08 ? 24 : size >= 0.03 ? 16 : 10;
function sphereFor([x, y, z]) {
  const around = segmentsFor(Math.max(x, z)), along = Math.max(6, Math.round(segmentsFor(Math.max(x, y, z)) * 0.75));
  const key = around + 'x' + along;
  if (!spheres.has(key)) spheres.set(key, new THREE.SphereGeometry(1, around, along));
  return spheres.get(key);
}

export function mesh(geometry, material, parent, pos = [0, 0, 0], scale) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...pos);
  if (scale) m.scale.set(...scale);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function group(parent, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(...pos);
  parent.add(g);
  return g;
}

export function ball(parent, material, pos, size) {
  const m = mesh(sphereFor(size), material, parent, pos, size);
  m.castShadow = Math.max(...size) >= 0.04;
  return m;
}
export const cyl = (parent, material, pos, r, h) => mesh(cylinderGeo, material, parent, pos, [r, h, r]);

export function box(parent, material, pos, size, r = 0.08) {
  const thin = Math.min(...size);
  const m = mesh(new RoundedBoxGeometry(...size, thin < 0.05 ? 1 : thin < 0.3 ? 2 : 3, Math.min(r, thin / 2)), material, parent, pos);
  m.castShadow = thin >= 0.02;
  return m;
}

export function tube(parent, material, points, r = 0.014) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m = mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 7), r, 7, false), material, parent);
  m.castShadow = r >= 0.012;
  return m;
}

const up = new THREE.Vector3(0, 1, 0), va = new THREE.Vector3(), vb = new THREE.Vector3(), vd = new THREE.Vector3();

/** Stretch a unit-height, y-aligned mesh so it spans from a to b with radius r (limbs, sleeves). */
export function bone(o, a, b, r) {
  va.set(...a);
  vb.set(...b);
  o.position.copy(va).add(vb).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(up, vd.subVectors(vb, va).normalize());
  o.scale.set(r, va.distanceTo(vb), r);
}

/**
 * A deformed sphere. `cheeks` widens the lower half (faces), `fluff` adds soft fur
 * ripples, and `color(x, y, z)` paints vertex colours from unit-sphere coordinates.
 */
export function softForm(parent, material, pos, size, { cheeks = 0, fluff = 0, color, detail = 1 } = {}) {
  const geo = new THREE.SphereGeometry(1, Math.round(40 * detail), Math.round(28 * detail));
  const p = geo.attributes.position;
  const colors = color && new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const round = cheeks * Math.exp(-(((y + 0.30) / 0.48) ** 2));
    const fur = 1 + fluff * (Math.sin(x * 23 + y * 7) * Math.sin(z * 21 - y * 11) + 0.4 * Math.sin(y * 29 + z * 13));
    p.setXYZ(i, x * size[0] * (1 + round) * fur, y * size[1] * fur, z * size[2] * fur + Math.max(0, z) * round * 0.12);
    if (colors) color(x, y, z).toArray(colors, i * 3);
  }
  if (colors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return mesh(geo, material, parent, pos);
}

const PROFILES = {
  // Thin at both ends: hair locks.
  lens: t => 0.018 + Math.pow(Math.sin(Math.PI * t), 0.62) * (1 - 0.35 * t),
  // Full at the root, pointed tip: bang ends.
  tip: t => Math.pow(1 - t, 0.85) * Math.min(1, 0.55 + t * 5),
  // Full at the root with a soft, rounded end: fur tufts.
  tuft: t => Math.pow(1 - t, 0.4) * Math.min(1, 0.6 + t * 4),
};

/**
 * A flattened, tapered tube along a curve. `normal(p)` names the surface the strand
 * lies on (it stays flat against it); without one the strand faces the camera side.
 */
export function strand(parent, material, points, { width, depth, normal, profile = 'lens', steps = 18, sides = 10 }) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const taperAt = PROFILES[profile];
  const positions = [], indices = [];
  const across = new THREE.Vector3(), front = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, c = curve.getPoint(t), tangent = curve.getTangent(t);
    if (normal) across.crossVectors(tangent, normal(c));
    else across.set(tangent.y, -tangent.x, 0);
    across.normalize();
    front.crossVectors(across, tangent).normalize();
    const taper = taperAt(t);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      v.copy(c).addScaledVector(across, Math.cos(a) * width * taper).addScaledVector(front, Math.sin(a) * depth * taper);
      positions.push(v.x, v.y, v.z);
      if (i < steps && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(k, k + sides + 1, k + 1, k + 1, k + sides + 1, k + sides + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return mesh(geo, material, parent);
}

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Looks straight down -z onto a geometry and returns where (x, y) lands on its surface,
 * so painted-on details (eyes, blush, mouths) hug curved faces exactly.
 */
export function surfaceProbe(geometry) {
  const probe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const ray = new THREE.Raycaster(), origin = new THREE.Vector3(), dir = new THREE.Vector3(0, 0, -1);
  return (x, y, offset = 0.006) => {
    ray.set(origin.set(x, y, 10), dir);
    const hit = ray.intersectObject(probe)[0];
    if (!hit) return { point: [x, y, offset], normal: new THREE.Vector3(0, 0, 1) };
    return { point: [x, y, hit.point.z + offset], normal: hit.face.normal.clone() };
  };
}

export function shadowless(root) {
  root.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return root;
}

function mergeGeometries(geometries) {
  const names = Object.keys(geometries[0].attributes)
    .filter(name => geometries.every(g => g.attributes[name]?.itemSize === geometries[0].attributes[name].itemSize));
  const merged = new THREE.BufferGeometry();
  for (const name of names) {
    const itemSize = geometries[0].attributes[name].itemSize;
    const array = new Float32Array(geometries.reduce((n, g) => n + g.attributes[name].count, 0) * itemSize);
    let offset = 0;
    for (const g of geometries) {
      const a = g.attributes[name];
      array.set(a.array.subarray(0, a.count * itemSize), offset);
      offset += a.count * itemSize;
    }
    merged.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
  }
  if (geometries[0].index) {
    const total = geometries.reduce((n, g) => n + g.attributes.position.count, 0);
    const index = new (total > 65535 ? Uint32Array : Uint16Array)(geometries.reduce((n, g) => n + g.index.count, 0));
    let offset = 0, base = 0;
    for (const g of geometries) {
      for (let i = 0; i < g.index.count; i++) index[offset + i] = g.index.getX(i) + base;
      offset += g.index.count;
      base += g.attributes.position.count;
    }
    merged.setIndex(new THREE.BufferAttribute(index, 1));
  }
  return merged;
}

/**
 * Merge meshes that never move relative to `root` into one mesh per material, cutting
 * draw calls. `deep` merges every descendant (static furniture); otherwise only the
 * direct mesh children merge, so nested animated joints keep their own transforms.
 */
export function bake(root, { deep = false } = {}) {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const collect = node => {
    for (const child of node.children) {
      if (child.isMesh && !child.userData.keep) {
        const key = child.material.uuid + (child.geometry.index ? ':i' : ':n');
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(child);
      }
      if (deep && !child.isMesh) collect(child);
    }
  };
  collect(root);
  for (const meshes of buckets.values()) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(m => m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, m.matrixWorld)));
    const merged = new THREE.Mesh(mergeGeometries(geometries), meshes[0].material);
    merged.castShadow = meshes.some(m => m.castShadow);
    merged.receiveShadow = meshes.some(m => m.receiveShadow);
    for (const m of meshes) m.removeFromParent();
    root.add(merged);
  }
  return root;
}
