const {test,expect}=require('@playwright/test');
const {installAccountFixture}=require('./helpers/account-provider-fixture');
test.setTimeout(120000);
const raw=page=>page.evaluate(()=>({player:localStorage.getItem('legend-roads-of-ashmere-v09'),settings:localStorage.getItem('legend-settings-v1'),audio:localStorage.getItem('legend-road-sound'),pending:sessionStorage.getItem('legend-awakening-return-to-town-v1')}));
async function boot(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  await page.evaluate(()=>{LegendStorage.savePlayer(LegendStorage.normalize({username:'Recovery QA',className:'Ranger',currentRegion:'Ashmere',town:'Ashmere',futureRecovery:{keep:72},flags:{introV094Complete:true,firstRoadReturnSeen:true}}));});
}
async function native(page){await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot()?.nativeRecovery?.active)).toBe(true);const s=await page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeRecovery);expect(s.failure).toBe('');await expect(page.locator('[data-recovery-screen]')).toHaveCSS('background-image','none');await expect(page.locator('.legend-recovery-panel button')).toHaveCSS('background-image','none');expect(s.labels.length).toBeGreaterThanOrEqual(3);const decoration=await page.locator('[data-recovery-screen]').evaluate(el=>[...el.querySelectorAll('.account09x-hero,.settings09x-hero')].every(n=>getComputedStyle(n,'::before').display==='none'&&getComputedStyle(n,'::after').display==='none'));expect(decoration).toBe(true);const expected=await page.locator('.legend-recovery-panel').evaluate(el=>[...el.querySelectorAll('h1,h2,p,.account09x-kicker,button')].map(n=>n.innerText.replace(/\s+/g,' ').trim()));expect(s.labels.map(n=>n.text)).toEqual(expected);return s;}
for(const width of [1440,390])test.describe(`${width}px recovery`,()=>{
 test.use({hasTouch:width===390});
 test(`production recovery actions retain saved extensions, focus and fallback at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,width);const before=await raw(page);
  const scenarios=[
   {method:'dispatches',disable:['LegendTitleDispatchesV140'],heading:'News & Roadmap unavailable'},
   {method:'account',disable:['LegendAccountV09x'],heading:'Traveler Profile'},
   {method:'settings',disable:['LegendSettingsScreenV090'],heading:'Settings'},
   {method:'newTraveler',disable:['LegendOpeningPrologueV220','LegendBeginningV094'],heading:'Traveler creation unavailable'},
   {method:'continueGame',disable:['LegendRoadOpeningV140','LegendAshmereV099'],heading:'Town unavailable'}
  ];
  for(const scenario of scenarios){
   await page.evaluate(s=>{window.__recoveryModules={};for(const key of s.disable){__recoveryModules[key]=window[key];window[key]=null;}LegendGameBootstrap[s.method]();},scenario);
   await native(page);await expect(page.getByRole('heading',{name:scenario.heading,exact:true})).toBeFocused();
   await expect(page.locator('body')).not.toHaveClass(/legend-world-shell-active/);
   const button=page.locator('#backTitle');await button.focus();await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeRecovery.focused)).toBe(true);
   if(width===390)await button.tap();else await page.keyboard.press('Enter');
   await expect(page.locator('.v120-title')).toBeVisible();await page.evaluate(()=>Object.assign(window,__recoveryModules));expect(await raw(page)).toEqual(before);
  }
  await page.evaluate(()=>{window.__recoveryView=LegendTitleScreenViewV120;window.LegendTitleScreenViewV120=null;LegendGameBootstrap.title();});await native(page);await expect(page.getByRole('heading',{name:'Title screen unavailable'})).toBeFocused();
  await page.setViewportSize({width:844,height:390});await page.locator('#retryTitle').scrollIntoViewIfNeeded();await native(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.evaluate(()=>{const n=document.createElement('p');n.id='recovery-extra';n.textContent='Additional recovery detail';document.querySelector('.legend-recovery-panel').append(n);});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeRecovery.active)).toBe(false);await expect(page.locator('#retryTitle')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await page.evaluate(()=>document.querySelector('#recovery-extra').remove());await native(page);
  await Promise.all([page.waitForEvent('load'),page.locator('#retryTitle').click()]);await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);expect(errors).toEqual([]);
 });
});
test('missing profile view provides an accessible return and preserves the local traveler',async({page})=>{
 await page.route('**/js/systems/account/account-profile-view-v09x.js*',route=>route.abort());await page.route('**/*.supabase.co/**',route=>route.fulfill({status:503,body:'Synthetic offline provider'}));await boot(page,390);await page.evaluate(installAccountFixture);const before=await raw(page);
 await page.locator('#account').click();await native(page);await expect(page.getByRole('heading',{name:'Profile is unavailable'})).toBeFocused();await page.locator('#backTitle').click();await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);
});
test('missing storage startup retains the recovery action and reloads when its module returns',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{if(!localStorage.getItem('legend-roads-of-ashmere-v09'))localStorage.setItem('legend-roads-of-ashmere-v09',JSON.stringify({username:'Stored Recovery',futureRecovery:{keep:19}}));});
 await page.route('**/js/storage.js*',route=>route.abort());await page.goto('/');await expect(page.getByRole('heading',{name:'Traveler storage unavailable'})).toBeVisible();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await native(page);const before=await raw(page);await expect(page.locator('#reloadGame')).toBeVisible();
 await page.unroute('**/js/storage.js*');await Promise.all([page.waitForEvent('load'),page.locator('#reloadGame').click()]);await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);
});
test('recovery stays usable with combined preferences and missing Phaser',async({page})=>{
 await boot(page,390);await page.evaluate(()=>{LegendStorage.saveSettings({...LegendStorage.loadSettings(),largeText:true,boldText:true,highContrast:true,readableFont:true,spacious:true,reducedMotion:true});window.LegendTitleDispatchesV140=null;LegendGameBootstrap.dispatches();});const before=await raw(page);await native(page);expect(await page.locator('.legend-recovery-panel p').evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThan(16);
 await page.setViewportSize({width:844,height:390});await page.locator('#backTitle').scrollIntoViewIfNeeded();await native(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.locator('#backTitle').click();
 await page.route('**/js/engine/phaser-world-v1.js*',route=>route.abort());await page.reload();await page.evaluate(()=>{window.LegendTitleScreenViewV120=null;LegendGameBootstrap.title();});await expect(page.locator('#retryTitle')).toBeVisible();await expect(page.locator('#retryTitle')).toBeEnabled();expect(await raw(page)).toEqual(before);
});
