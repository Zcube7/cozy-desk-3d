// Browser check of the page: reactions, recovery, shortcuts, sound, layout and a
// rendering budget. Run with the local server up (npm start); see README.
import { chromium } from './.sites-runtime/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';

const URL = 'http://127.0.0.1:4177/?debug';
const fail = message => { throw new Error(message); };
await fs.mkdir('qa-output', { recursive: true });

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl'] });
const errors = [];
const watch = page => {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push(r.url() + ': ' + r.failure()?.errorText));
};

async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...options });
  await context.addInitScript(() => {
    // Count draw calls and triangles per frame drawn to the screen.
    const stats = window.__gl = { draws: 0, tris: 0, frames: 0 };
    const P = WebGL2RenderingContext.prototype, { drawElements, drawArrays, clear } = P;
    P.drawElements = function (mode, count, ...rest) { stats.draws++; stats.tris += count / 3; return drawElements.call(this, mode, count, ...rest); };
    P.drawArrays = function (mode, first, count) { stats.draws++; stats.tris += count / 3; return drawArrays.call(this, mode, first, count); };
    P.clear = function (mask) { if (this.getParameter(this.FRAMEBUFFER_BINDING) === null) stats.frames++; return clear.call(this, mask); };
  });
  const page = await context.newPage();
  watch(page);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#loading[hidden]', { state: 'attached', timeout: 20000 });
  return page;
}
const showing = (page, selector) => page.locator(selector).evaluate(el => el.classList.contains('show'));

try {
  const page = await open({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'qa-output/desktop.png' });

  const broken = await page.evaluate(() => {
    let count = 0;
    window.cozy.scene.traverse(o => { if (o.isMesh && o.geometry.attributes.position.array.some(Number.isNaN)) count++; });
    return count;
  });
  if (broken) fail(`${broken} meshes have NaN vertices`);

  for (const [target, shot] of [['head', 'head'], ['body', 'tickle'], ['cat', 'belly']]) {
    await page.locator(`.action-card[data-action="${target}"]`).click();
    if (!await showing(page, target === 'cat' ? '#cat-speech' : '#speech')) fail('Missing reaction: ' + target);
    await page.waitForTimeout(target === 'cat' ? 1100 : 550);
    await page.screenshot({ path: `qa-output/${shot}.png` });
  }
  // Bubbles stay inside the stage.
  const outside = await page.evaluate(() => {
    const stage = document.querySelector('#stage').getBoundingClientRect();
    return [...document.querySelectorAll('.speech.show')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < stage.left || r.right > stage.right || r.top < stage.top || r.bottom > stage.bottom;
    }).map(el => el.id);
  });
  if (outside.length) fail('Speech bubble outside the stage: ' + outside.join(', '));

  await page.waitForTimeout(5700);
  if (await page.locator('.speech.show').count()) fail('Animations did not return to idle');

  // Idle frames are throttled and stay within the rendering budget.
  await page.evaluate(() => Object.assign(window.__gl, { draws: 0, tris: 0, frames: 0 }));
  await page.waitForTimeout(2000);
  const idle = await page.evaluate(() => ({ fps: window.__gl.frames / 2, draws: window.__gl.draws / window.__gl.frames, tris: window.__gl.tris / window.__gl.frames }));
  if (idle.fps > 40) fail(`Idle scene renders at ${idle.fps} fps`);
  if (idle.draws > 260 || idle.tris > 300000) fail(`Over budget: ${Math.round(idle.draws)} draws, ${Math.round(idle.tris)} triangles per frame`);

  await page.locator('#sound').click();
  if (await page.locator('#sound').getAttribute('aria-pressed') !== 'true') fail('Sound toggle failed');
  await page.keyboard.press('1');
  await page.waitForTimeout(200);
  if (!await showing(page, '#speech')) fail('Keyboard shortcut failed');
  await page.locator('#reset').click();

  const phone = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await phone.screenshot({ path: 'qa-output/mobile.png' });
  if (await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth)) fail('Horizontal overflow on a phone');
  if (!await phone.locator('.for-touch').isVisible()) fail('Touch help text is not shown on a phone');
  // The whole room fits on screen.
  const cropped = await phone.evaluate(() => {
    const { camera, THREE } = window.cozy, w = innerWidth;
    return [[-3.4, -0.42, 2.58], [3.4, -0.42, 2.58], [-3.4, -0.42, -2.58], [3.4, -0.42, -2.58]]
      .map(p => (new THREE.Vector3(...p).project(camera).x + 1) / 2 * w).some(x => x < 0 || x > w);
  });
  if (cropped) fail('Room is cropped on a phone');
  await phone.locator('.action-card[data-action="cat"]').click();
  await phone.waitForTimeout(900);
  await phone.screenshot({ path: 'qa-output/mobile-cat.png' });

  console.log(JSON.stringify({
    errors,
    idle: { fps: idle.fps, drawsPerFrame: Math.round(idle.draws), trianglesPerFrame: Math.round(idle.tris) },
    verified: ['3D scene loaded without NaN geometry', 'three reactions', 'bubbles inside the stage', 'return to idle',
      'idle frame throttle and budget', 'keyboard shortcut', 'sound toggle', '390 px phone layout fits the room'],
  }, null, 1));
} finally {
  await browser.close();
}
if (errors.length) process.exitCode = 1;
