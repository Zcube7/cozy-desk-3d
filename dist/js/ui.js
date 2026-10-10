// Everything around the canvas: speech bubbles, hints, particles, buttons,
// keyboard shortcuts and the optional synthesized sound.
import * as THREE from 'three';

const LINES = { head: '别打别打！', body: '俺不中嘞', cat: '呼噜呼噜' };
const CALM = '他在忙，猫在做梦。';
const HINT_DOT = 19; // px from a hint's anchor down to the dot on its leader line

export function createUI({ stage, camera, reducedMotion, onAction }) {
  const $ = s => document.querySelector(s);
  const el = {
    mood: $('#mood'), speech: $('#speech'), catSpeech: $('#cat-speech'), headHint: $('#head-hint'), catHint: $('#cat-hint'),
    sleep: $('#sleep'), particles: $('#particles'), sound: $('#sound'),
  };
  const buttons = [...document.querySelectorAll('[data-action]')];
  buttons.forEach(b => b.addEventListener('click', () => onAction(b.dataset.action)));
  window.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const action = { 1: 'head', 2: 'body', 3: 'cat' }[e.key];
    if (action) {
      e.preventDefault();
      onAction(action);
    }
  });

  // ---- Sound: soft synthesized tones, off until the visitor turns them on.
  let soundOn = false, audio, lastSound = -1e4;
  function tone(freq, start, length, volume = 0.045, type = 'sine', end) {
    const t0 = audio.currentTime + start, o = audio.createOscillator(), g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (end) o.frequency.exponentialRampToValueAtTime(end, t0 + length);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volume, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + length);
    o.connect(g).connect(audio.destination);
    o.start(t0);
    o.stop(t0 + length + 0.02);
  }
  function playSound(type) {
    if (!soundOn || performance.now() - lastSound < 200) return;
    lastSound = performance.now();
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      void audio.resume();
      if (type === 'head') {
        tone(560, 0, 0.16, 0.04, 'sine', 350);
        tone(360, 0.16, 0.22, 0.035, 'sine', 260);
      } else if (type === 'body') {
        for (let i = 0; i < 4; i++) tone(480 + (i % 2) * 160, i * 0.13, 0.105, 0.045, 'sine', 420);
      } else {
        tone(610, 0, 0.26, 0.035, 'sine', 830);
        tone(830, 0.26, 0.38, 0.025, 'sine', 510);
        tone(80, 0.65, 0.5, 0.022, 'triangle', 62);
      }
    } catch {
      soundOn = false;
      syncSound();
    }
  }
  function syncSound() {
    const label = soundOn ? '关闭互动音效' : '开启互动音效';
    el.sound.setAttribute('aria-pressed', String(soundOn));
    el.sound.setAttribute('aria-label', label);
    el.sound.title = label;
    el.sound.querySelector('span').textContent = soundOn ? '音效开' : '音效关';
    $('#sound-path').setAttribute('d', soundOn ? 'M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14' : 'm16 9 5 6m0-6-5 6');
  }
  el.sound.addEventListener('click', () => {
    soundOn = !soundOn;
    syncSound();
    if (soundOn) playSound('cat');
  });

  // ---- Screen positions.
  let width = stage.clientWidth, height = stage.clientHeight;
  const v = new THREE.Vector3();
  function project(p) {
    v.copy(p).project(camera);
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height };
  }
  const last = new Map();
  function put(node, x, y) {
    const prev = last.get(node);
    if (prev && Math.abs(prev.x - x) < 0.25 && Math.abs(prev.y - y) < 0.25) return;
    last.set(node, { x, y });
    node.style.left = x.toFixed(1) + 'px';
    node.style.top = y.toFixed(1) + 'px';
  }
  const clampX = (x, half) => THREE.MathUtils.clamp(x, half + 8, width - half - 8);
  const size = { speech: { w: 0, h: 0 }, cat: { w: 0, h: 0 } };

  const hairTop = new THREE.Vector3(), catBack = new THREE.Vector3(), catSide = new THREE.Vector3(), catNap = new THREE.Vector3();
  const OFFSETS = { hair: new THREE.Vector3(0, 0.74, 0), back: new THREE.Vector3(0.55, 0.34, -0.1), side: new THREE.Vector3(0.72, 0.42, 0.1), nap: new THREE.Vector3(-0.5, 0.44, 0) };

  /** Keeps hints and bubbles beside the characters: above the hair, and to the cat's right. */
  function place(headWorld, catWorld) {
    const hair = project(hairTop.copy(headWorld).add(OFFSETS.hair));
    put(el.headHint, hair.x, hair.y - HINT_DOT);
    put(el.speech, clampX(hair.x, size.speech.w / 2), Math.max(size.speech.h + 8, hair.y - 8));
    const back = project(catBack.copy(catWorld).add(OFFSETS.back));
    put(el.catHint, back.x, back.y - HINT_DOT);
    const side = project(catSide.copy(catWorld).add(OFFSETS.side));
    put(el.catSpeech, Math.min(side.x, width - size.cat.w - 8), Math.max(size.cat.h + 8, side.y));
    const nap = project(catNap.copy(catWorld).add(OFFSETS.nap));
    put(el.sleep, nap.x, nap.y - 30);
  }

  // ---- Reactions.
  function burst(type, point) {
    if (reducedMotion) return;
    const p = project(point);
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      s.className = 'particle';
      s.textContent = type === 'head' ? '✧' : type === 'body' ? '♪' : '♥';
      s.style.left = p.x + (i - 3) * 15 + 'px';
      s.style.top = p.y - 35 + Math.sin(i) * 13 + 'px';
      s.style.setProperty('--drift', (i - 3) * 19 + 'px');
      s.style.setProperty('--turn', (i - 3) * 10 + 'deg');
      s.style.animationDelay = i * 0.05 + 's';
      if (type === 'head') s.style.color = '#89a9d3';
      el.particles.append(s);
      setTimeout(() => s.remove(), 1900);
    }
  }

  /** Reflect the current state: bubbles, pressed buttons, hints and the caption. */
  function sync(state) {
    const talking = state.person !== 'idle', purring = state.cat === 'belly';
    if (talking) el.speech.textContent = LINES[state.person];
    el.speech.classList.toggle('show', talking);
    el.catSpeech.textContent = LINES.cat;
    el.catSpeech.classList.toggle('show', purring);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.action === 'cat' ? purring : b.dataset.action === state.person));
    for (const [hint, visible] of [[el.headHint, !talking], [el.catHint, !purring]]) {
      hint.style.opacity = visible ? '1' : '0';
      hint.style.pointerEvents = visible ? 'auto' : 'none';
    }
    el.mood.textContent = talking ? LINES[state.person] : purring ? LINES.cat : CALM;
    size.speech = { w: el.speech.offsetWidth, h: el.speech.offsetHeight };
    size.cat = { w: el.catSpeech.offsetWidth, h: el.catSpeech.offsetHeight };
  }

  let nap = -1;
  function napping(amount) {
    const opacity = Math.round((1 - amount) * 100) / 100;
    if (opacity !== nap) el.sleep.style.opacity = String(nap = opacity);
  }

  function resize(w, h) {
    width = w;
    height = h;
    last.clear();
  }

  return { sync, place, burst, napping, playSound, resize };
}
