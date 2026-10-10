// Fits the diorama into the part of the stage that the header, caption and
// help text leave free, so it fills phones and wide screens alike.
import * as THREE from 'three';

const TARGET = new THREE.Vector3(0, 1.07, 0);
// Base and wall-top corners of the room, then a point above the boy's hair:
// his hint and speech bubble need about 64px of headroom over it.
const POINTS = [
  [-3.4, -0.42, -2.58], [3.4, -0.42, -2.58], [-3.4, -0.42, 2.58], [3.4, -0.42, 2.58],
  [-3.32, 2.6, -2.5], [3.28, 2.6, -2.5], [-3.32, 2.6, 0.85], [0.67, 3.2, 0.29],
].map(p => new THREE.Vector3(...p));
const HEADROOM = { index: POINTS.length - 1, px: 64 };

export function createFraming({ camera, controls, stage }) {
  const v = new THREE.Vector3(), dir = new THREE.Vector3();
  const $ = s => document.querySelector(s);

  function safeArea(w, h, narrow) {
    const s = stage.getBoundingClientRect(), pad = narrow ? 10 : 28;
    let top = $('.topbar').getBoundingClientRect().bottom - s.top;
    // Landscape screens keep the caption beside the room; portrait ones stack it above.
    const caption = $('.scene-caption').getBoundingClientRect(), beside = w > h && !narrow;
    if (!beside) top = Math.max(top, caption.bottom - s.top + 6);
    const left = beside ? Math.max(pad, caption.right - s.left + 12) : pad;
    const bottom = $('.view-note').getBoundingClientRect().top - s.top - 4;
    return { left, right: w - pad, top, bottom };
  }

  function bounds(w, h) {
    camera.updateMatrixWorld();
    const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    POINTS.forEach((p, i) => {
      v.copy(p).project(camera);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h - (i === HEADROOM.index ? HEADROOM.px : 0);
      b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x);
      b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y);
    });
    return b;
  }

  function place(distance) {
    camera.position.copy(TARGET).addScaledVector(dir, distance);
    camera.lookAt(TARGET);
  }

  /** Default view: portrait screens look a little more from above and more head-on. */
  function reset() {
    const w = stage.clientWidth, h = stage.clientHeight, narrow = w < 700;
    const safe = safeArea(w, h, narrow), safeW = safe.right - safe.left, safeH = safe.bottom - safe.top;
    const portrait = THREE.MathUtils.clamp((1.15 - w / h) / 0.6, 0, 1);
    const azimuth = THREE.MathUtils.lerp(0.62, 0.36, portrait), elevation = THREE.MathUtils.lerp(0.4, 0.55, portrait);
    dir.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
    camera.clearViewOffset();
    camera.zoom = 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    let near = 3, far = 80;
    for (let i = 0; i < 28; i++) {
      const d = (near + far) / 2;
      place(d);
      const b = bounds(w, h);
      if (b.maxX - b.minX <= safeW && b.maxY - b.minY <= safeH) far = d; else near = d;
    }
    place(far);
    // Slide the picture (not the orbit centre) so the room sits centred in the free area.
    const b = bounds(w, h);
    const dx = (safe.left + safe.right) / 2 - (b.minX + b.maxX) / 2, dy = (safe.top + safe.bottom) / 2 - (b.minY + b.maxY) / 2;
    camera.setViewOffset(w, h, -dx, -dy, w, h);
    controls.target.copy(TARGET);
    controls.minDistance = far * 0.55;
    controls.maxDistance = far * 1.25;
    controls.update();
  }

  return { reset };
}
