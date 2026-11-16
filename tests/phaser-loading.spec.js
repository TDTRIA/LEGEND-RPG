const {test,expect}=require('@playwright/test');
test.setTimeout(90000);
const heldAsset='**/assets/generated/enemies/blackroot-wolf.webp';
const snapshot=page=>page.evaluate(()=>LegendPhaserWorldV1.loadingSnapshot());
const raw=page=>page.evaluate(()=>[localStorage.getItem('legend-roads-of-ashmere-v09'),localStorage.getItem('legend-settings-v1'),localStorage.getItem('legend-road-sound'),sessionStorage.getItem('legend-awakening-return-to-town-v1')]);
async function hold(page){let release;const gate=new Promise(resolve=>release=resolve);await page.route(heldAsset,async route=>{await gate;await route.continue().catch(()=>{});});return release;}
async function seed(page,preferences=false){await page.addInitScript(prefs=>{
 localStorage.setItem('legend-roads-of-ashmere-v09',JSON.stringify({username:'Loading QA',futureLoading:{keep:71},flags:{introV094Complete:true,firstRoadReturnSeen:true}}));
 if(prefs)localStorage.setItem('legend-settings-v1',JSON.stringify({largeText:true,boldText:true,readableFont:true,highContrast:true,reducedMotion:true}));
},preferences);}
async function copied(page){
 await expect.poll(async()=>(await snapshot(page))?.active).toBe(true);
 const state=await snapshot(page);expect(state.failure).toBe('');expect(state.total).toBeGreaterThan(40);expect(state.loaded).toBeLessThan(state.total);expect(state.percent).toBeLessThan(100);
 await expect.poll(()=>page.evaluate(()=>{
  const state=LegendPhaserWorldV1.loadingSnapshot();
  const copy=[...document.querySelector('.legend-boot-frame').querySelectorAll('.legend-boot-kicker,.legend-boot-subtitle,.legend-boot-status-row span,.legend-boot-status-row strong,.legend-boot-checklist span,.legend-boot-checklist b,.legend-boot-footnote,.legend-boot-assets p')].map(n=>n.innerText.replace(/\s+/g,' ').trim());
  return state.active && JSON.stringify(state.labels.map(n=>n.text))===JSON.stringify(copy);
 })).toBe(true);
 await expect(page.locator('.legend-boot-wordmark-fallback')).toBeHidden();
 await expect(page.locator('#legend-boot-screen')).toBeVisible();await expect(page.locator('#engine-skip')).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
}
for(const width of [1440,390])test(`preload presents complete progress, fallback and handoff at ${width}px`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await seed(page,width===390);const release=await hold(page);
 await page.goto('/',{waitUntil:'domcontentloaded'});const before=await raw(page);await copied(page);
 // The original DOM timer must not remove loading feedback while art is still pending.
 await expect.poll(()=>page.evaluate(()=>window.__legendBootSequenceV100.revealPending),{timeout:8000}).toBe(true);await copied(page);
 if(width===390){await expect(page.locator('.legend-boot-assets p')).toHaveCSS('font-size','18px');await page.setViewportSize({width:844,height:390});await page.locator('.legend-boot-assets').scrollIntoViewIfNeeded();await copied(page);}
 await page.evaluate(()=>{const n=document.createElement('p');n.id='loading-extra';n.textContent='Additional loading detail';document.querySelector('.legend-boot-frame').append(n);});
 await expect.poll(async()=>(await snapshot(page)).active).toBe(false);await expect(page.locator('#loading-extra')).toBeVisible();await expect(page.locator('#legend-boot-phase')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
 await page.evaluate(()=>document.querySelector('#loading-extra').remove());await copied(page);release();
 await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('#legend-boot-screen')).toBeHidden();await expect(page.locator('html')).not.toHaveClass(/legend-phaser-preloading/);expect((await snapshot(page)).stopped).toBe(true);expect((await snapshot(page)).loaded).toBe((await snapshot(page)).total);expect((await snapshot(page)).labels).toEqual([]);expect(await raw(page)).toEqual(before);expect(errors).toEqual([]);
 await page.locator('#continue').click();await expect(page.locator('.ash100-town')).toBeVisible();
});
test('missing loader or required artwork keeps the readable DOM until the real handoff',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.route('**/js/engine/phaser-loading-v1.js*',route=>route.abort());const release=await hold(page);await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.legend-boot-subtitle')).toBeVisible();await expect.poll(()=>page.evaluate(()=>__legendBootSequenceV100.revealPending)).toBe(true);await expect(page.locator('#legend-boot-screen')).toBeVisible();expect(await snapshot(page)).toBeNull();release();await page.waitForFunction(()=>window.__legendPhaserWorldReady);
 await page.unroute('**/js/engine/phaser-loading-v1.js*');await page.unroute(heldAsset);const release2=await hold(page);await page.route('**/assets/generated/title/title-ashmere-road.webp',route=>route.abort());await page.reload({waitUntil:'domcontentloaded'});
 await expect.poll(async()=>(await snapshot(page))?.failed).toBeGreaterThan(0);expect((await snapshot(page)).active).toBe(false);await expect(page.locator('.legend-boot-assets')).toContainText('unavailable');await expect(page.locator('#legend-boot-phase')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');release2();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
});
test('startup watchdog releases a stalled preloader and preserves the traveler',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await seed(page);const release=await hold(page);await page.goto('/',{waitUntil:'domcontentloaded'});const before=await raw(page);await copied(page);
 await expect(page.locator('#game-container')).toHaveClass(/legend-phaser-startup-fallback/,{timeout:35000});await expect(page.locator('#legend-boot-screen')).toBeHidden();await expect(page.locator('html')).not.toHaveClass(/legend-phaser-preloading/);await expect(page.locator('.v120-title')).toBeVisible();expect(await page.evaluate(()=>LegendPhaserWorldV1.ready)).toBe(false);expect(await raw(page)).toEqual(before);release();await page.locator('#settings').click();await expect(page.locator('.settings09x')).toBeVisible();
});

test('missing Phaser library releases the original title without a stuck loading screen',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js',route=>route.abort());await seed(page);await page.goto('/');const before=await raw(page);
 await expect(page.locator('html')).not.toHaveClass(/legend-phaser-preloading|engine-intro-active/);await expect(page.locator('#legend-boot-screen')).toBeHidden();await expect(page.locator('.v120-title')).toBeVisible();await page.locator('#settings').click();await expect(page.locator('.settings09x')).toBeVisible();expect(await raw(page)).toEqual(before);expect(errors).toEqual([]);
});
