// Browser check of direct input: clicking or tapping the models themselves, dragging
// to orbit, and clicking empty floor. Targets are projected from the live scene, so
// the check follows any change in layout or framing.
import { chromium } from './.sites-runtime/node_modules/playwright/index.mjs';

const URL = 'http://127.0.0.1:4177/?debug';
const fail = message => { throw new Error(message); };

// Screen positions of a point on each character, and of empty floor.
const targetsIn = page => page.evaluate(() => {
  const { camera, person, cat, THREE } = window.cozy;
  const r = document.querySelector('#scene').getBoundingClientRect();
  const screen = (object, local) => {
    const p = object.localToWorld(new THREE.Vector3(...local)).project(camera);
    return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height];
  };
  return {
    head: screen(person.head, [0, -0.1, 0.4]),
    body: screen(person.root, [0, 1.62, 0.3]),
    cat: screen(cat.root, [0.2, 0.2, 0.25]),
    floor: screen(cat.root.parent, [2.6, 0.06, -1.6]),
  };
});
const active = (page, action) => page.locator(`.action-card[data-action="${action}"]`).evaluate(e => e.classList.contains('active'));

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#loading[hidden]', { state: 'attached' });
  let at = await targetsIn(page);
  for (const target of ['head', 'body', 'cat']) {
    await page.mouse.click(...at[target]);
    if (!await active(page, target)) fail('Direct click missed: ' + target);
  }
  await page.waitForTimeout(5600);

  await page.mouse.move(...at.head);
  await page.mouse.down();
  await page.mouse.move(at.head[0] + 110, at.head[1] + 21, { steps: 10 });
  await page.mouse.up();
  if (await page.locator('.action-card.active').count()) fail('Dragging triggered an interaction');

  await page.locator('#reset').click();
  await page.waitForTimeout(300);
  at = await targetsIn(page);
  await page.mouse.click(...at.floor);
  if (await page.locator('.action-card.active').count()) fail('Empty floor triggered an interaction');

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await context.newPage();
  await phone.goto(URL, { waitUntil: 'networkidle' });
  await phone.waitForSelector('#loading[hidden]', { state: 'attached' });
  at = await targetsIn(phone);
  await phone.touchscreen.tap(...at.head);
  if (!await active(phone, 'head')) fail('Touch on the head missed');
  await phone.touchscreen.tap(...at.cat);
  if (!await active(phone, 'cat')) fail('Touch on the cat missed');

  console.log(JSON.stringify({ verified: ['direct head click', 'direct body click', 'direct cat click', 'drag does not trigger', 'empty floor does not trigger', 'phone taps on head and cat'] }));
} finally {
  await browser.close();
}
