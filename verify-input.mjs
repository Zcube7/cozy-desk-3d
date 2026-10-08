import {chromium} from './.sites-runtime/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'});await page.waitForSelector('#loading[hidden]',{state:'attached'});
for(const [target,x,y] of [['head',724,314],['body',727,377],['cat',812,529]]){await page.mouse.click(x,y);if(!await page.locator('.action-card[data-action="'+target+'"]').evaluate(e=>e.classList.contains('active')))throw new Error('Direct mesh hit failed: '+target);}
await page.waitForTimeout(5600);
await page.mouse.move(722,314);await page.mouse.down();await page.mouse.move(832,335,{steps:10});await page.mouse.up();if(await page.locator('.action-card.active').count())throw new Error('Dragging triggered interaction');
await page.locator('#reset').click();await page.waitForTimeout(300);
await page.mouse.click(1110,690);if(await page.locator('.action-card.active').count())throw new Error('Empty space triggered interaction');
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await context.newPage();await mobile.goto('http://127.0.0.1:4177/',{waitUntil:'networkidle'});await mobile.waitForSelector('#loading[hidden]',{state:'attached'});await mobile.touchscreen.tap(200,280);if(!await mobile.locator('.action-card[data-action="head"]').evaluate(e=>e.classList.contains('active')))throw new Error('Touch head hit failed');await mobile.touchscreen.tap(265,399);if(!await mobile.locator('.action-card[data-action="cat"]').evaluate(e=>e.classList.contains('active')))throw new Error('Touch cat hit failed');
console.log(JSON.stringify({verified:['direct head raycast','direct body raycast','direct cat raycast','drag does not trigger click','empty space does not trigger click','mobile touch on head and cat']}));
}finally{await browser.close();}
