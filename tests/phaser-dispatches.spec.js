const {test,expect}=require('@playwright/test');
test.setTimeout(120000);
const textSelector='.dispatches-v140-kicker,h1,h2,h3,.dispatches-v140-header p,.dispatches-v140-feature p,.dispatches-v140-card p,.dispatches-v140-card-meta span,.dispatches-v140-card-meta small,.dispatches-v140-section-heading > small,.dispatches-v140-footer > span,button,a';
async function boot(page,width){await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('#legend-boot-screen')).toBeHidden();await page.evaluate(()=>{const p=LegendStorage.normalize({username:'Dispatch QA',futureDispatch:{keep:29},flags:{introV094Complete:true,firstRoadReturnSeen:true}});LegendStorage.savePlayer(p);});}
const raw=page=>page.evaluate(()=>({player:localStorage.getItem('legend-roads-of-ashmere-v09'),settings:localStorage.getItem('legend-settings-v1'),audio:localStorage.getItem('legend-road-sound'),pending:sessionStorage.getItem('legend-awakening-return-to-town-v1')}));
async function native(page){await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeDispatches;return{active:s.active,failure:s.failure};}),{timeout:15000}).toEqual({active:true,failure:''});await expect(page.locator('#dispatchesBack')).toHaveCSS('background-image','none');await expect(page.locator('.dispatches-v140-card').first()).toHaveCSS('background-image','none');return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeDispatches);}
for(const width of [1440,390])test.describe(`${width}px`,()=>{test.use({hasTouch:width===390});test(`News and Roadmap retain every card, native focus and real links at ${width}px`,async({page,context})=>{
  await boot(page,width);const before=await raw(page);await page.locator('#dispatches').click();let ui=await native(page);await expect(page.locator('.dispatches-v140 h1')).toBeFocused();
  const source=await page.locator('.dispatches-v140').locator(textSelector).allTextContents();expect(ui.labels.map(n=>n.sourceText)).toEqual(source.map(s=>s.replace(/\s+/g,' ').trim()));expect(ui.labels).toHaveLength(49);await expect(page.locator('.dispatches-v140-card')).toHaveCount(8);
  expect(!!ui.art).toBe(width===1440);if(ui.art)expect(ui.art.key).toBe('serviceMilestoneIcon');
  const hrefs=['updates.html','blog.html','https://github.com/TDTRIA/LEGEND-RPG'];
  for(let i=0;i<hrefs.length;i++){
    const link=page.locator('.dispatches-v140 a').nth(i);await expect(link).toHaveAttribute('href',hrefs[i]);await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener');
    await link.focus();ui=await native(page);expect(ui.controls.find(n=>n.href===hrefs[i]).focused).toBe(true);
    const url=new URL(hrefs[i],page.url()).href;await context.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:'<title>Isolated dispatch link target</title>'}));
    const popupPromise=page.waitForEvent('popup');if(width===390)await link.tap();else await page.keyboard.press('Enter');const popup=await popupPromise;await popup.waitForURL(url);expect(await popup.evaluate(()=>window.opener===null)).toBe(true);await popup.close();
  }
  await page.locator('#dispatchRoadmapTitle').scrollIntoViewIfNeeded();await native(page);await page.setViewportSize({width:844,height:390});ui=await native(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);for(const label of ui.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+20);}
  await page.locator('#dispatchesBack').focus();ui=await native(page);expect(ui.controls.find(n=>!n.href).focused).toBe(true);await page.keyboard.press('Enter');await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);
});});
test('dispatches recover complete source and missing artwork without losing return or saved state',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await boot(page,1440);await page.emulateMedia({reducedMotion:'no-preference'});const before=await raw(page);await page.locator('#dispatches').click();await native(page);
  await page.evaluate(()=>{const n=document.createElement('p');n.id='future-dispatch';n.textContent='Future dispatch detail';document.querySelector('.dispatches-v140-footer').append(n);});await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeDispatches.active)).toBe(false);await expect(page.locator('#future-dispatch')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await page.evaluate(()=>document.getElementById('future-dispatch').remove());await native(page);
  await page.evaluate(()=>{const scene=LegendPhaserWorldV1.engine.scene.getScene('RealmScene');window.__dispatchArt=scene.textures.get('serviceMilestoneIcon').getSourceImage();scene.textures.remove('serviceMilestoneIcon');});await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeDispatches.active)).toBe(false);await expect(page.locator('.dispatches-v140-feature-mark img')).toHaveCSS('opacity','1');
  await page.evaluate(()=>{const scene=LegendPhaserWorldV1.engine.scene.getScene('RealmScene');scene.textures.addImage('serviceMilestoneIcon',__dispatchArt);});await native(page);
  // Observe the settled page through a complete CSS transition interval: text
  // textures created by this painter must not repeatedly tear down its UI.
  expect(await page.evaluate(()=>new Promise(resolve=>{const source=document.querySelector('.dispatches-v140');let clears=0;const observer=new MutationObserver(()=>{if(!source.dataset.phaserDispatches)clears++;});observer.observe(source,{attributes:true,attributeFilter:['data-phaser-dispatches']});setTimeout(()=>{observer.disconnect();resolve(clears);},600);}))).toBe(0);
  await page.evaluate(()=>{const n=document.querySelector('.dispatches-v140 h1'),replacement=n.cloneNode(true);replacement.removeAttribute('data-dispatch-copy');n.replaceWith(replacement);});await expect(page.locator('.dispatches-v140 h1')).toHaveAttribute('data-dispatch-copy','true');await native(page);
  await page.keyboard.press('Escape');await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);expect(errors).toEqual([]);
});
test('dispatches remain readable with all accessibility preferences and viewport changes',async({page})=>{
  await boot(page,390);await page.evaluate(()=>LegendStorage.saveSettings({...LegendStorage.loadSettings(),largeText:true,boldText:true,highContrast:true,spacious:true,readableFont:true,reducedMotion:true}));const before=await raw(page);await page.locator('#dispatches').click();await native(page);
  for(const width of [390,1440,844]){await page.setViewportSize({width,height:width===844?390:width===390?844:900});await page.locator('#dispatchRoadmapTitle').scrollIntoViewIfNeeded();await native(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
  await page.locator('#dispatchesBack').click();await expect(page.locator('.v120-title')).toBeVisible();expect(await raw(page)).toEqual(before);
});
