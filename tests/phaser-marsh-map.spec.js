const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
const snapshot=page=>page.evaluate(()=>LegendPhaserWorldV1.snapshot());
async function nativeMap(page,view){
  await expect.poll(async()=>{const s=(await snapshot(page)).nativeMarshMap;return{active:s.active,failure:s.failure,view:s.view};},{timeout:15000}).toEqual({active:true,failure:'',view});
  return (await snapshot(page)).nativeMarshMap;
}
async function open(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
  await page.evaluate(()=>{
    const p=LegendStorage.normalize({username:'Greyfen Map QA',className:'Ranger',level:1,hp:60,maxHp:100,gold:20,inventory:{food:2,camp:1},futureMap:{keep:81},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,greyfenDryCrossingComplete:true,roadExpeditionV100:{active:false,stage:2,pressure:47,futureRoad:'kept'}}});
    p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];LegendStorage.savePlayer(p);LegendGreyfenMarshV160.start();
  });
  await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context','marsh');
  await expect.poll(async()=>(await snapshot(page)).nativeMarsh.active).toBe(true);
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`regional map and shell preserve modal lifecycle and saved return at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,width);
    const use=async selector=>{const n=page.locator(selector);await n.scrollIntoViewIfNeeded();if(width===390)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}};
    const initial=await saved(page);
    await expect(page.locator('#lws-current-location')).toHaveText('Greyfen Marsh Path');
    await expect(page.locator('#root')).toHaveAttribute('data-legend-shell-clip','true');
    const invoker=page.locator('.lws-bottom-bar [data-world-action="map"]');await use('.lws-bottom-bar [data-world-action="map"]');
    let ui=await nativeMap(page,'map');expect(ui.controls).toEqual(['gfm160CloseMap','gfm160MapPlaces','gfm160MapNotes','gfm160CloseMapFooter']);
    await expect(page.locator('body > #gfm160MapOverlay')).toBeVisible();
    expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(true);
    expect(await page.locator('#legend-world-shell-root').evaluate(n=>n.inert)).toBe(true);
    expect(await page.locator('#gfm160MapOverlay').evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
    await expect(page.locator('#gfm160CloseMap')).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.locator('#gfm160CloseMapFooter')).toBeFocused();
    await page.keyboard.press('Tab');await expect(page.locator('#gfm160CloseMap')).toBeFocused();
    await use('#gfm160MapNotes');await nativeMap(page,'journal');await expect(page.locator('.gfm160-journal-empty')).toBeVisible();
    await page.keyboard.press('Escape');await expect(invoker).toBeFocused();expect(await saved(page)).toEqual(initial);
    expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);
    await use('#gfm160Begin');await use('#gfm160ChooseReeds');await use('#gfm160VisitFerry');await use('#gfm160AvoidRaider');
    const before=await saved(page);await use('.lws-bottom-bar [data-world-action="journal"]');ui=await nativeMap(page,'journal');
    expect(ui.labels.some(n=>n.sourceText.includes('One usable cloth bundle'))).toBe(true);
    await expect(page.locator('.gfm160-map-notes')).toContainText('Cloth recovered at the Fallen Ferry');
    await page.locator('.gfm160-map-dialog').evaluate(n=>{n.scrollTop=n.scrollHeight;});await nativeMap(page,'journal');
    await expect(page.locator('#gfm160CloseMapFooter')).toBeInViewport();
    await use('#gfm160MapPlaces');await nativeMap(page,'map');
    await expect(page.locator('[data-marsh-stop="fallen-ferry"]')).toContainText('You are here');
    await expect(page.locator('[data-marsh-stop="raised-posts"]')).toContainText('Route not taken');
    const dialog=page.locator('.gfm160-map-dialog');await dialog.evaluate(n=>{n.scrollTop=n.scrollHeight;});
    ui=await nativeMap(page,'map');expect(ui.clip.height).toBeGreaterThan(100);
    await expect(page.locator('#gfm160CloseMapFooter')).toBeInViewport();
    for(const label of ui.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
    await page.setViewportSize({width:844,height:390});await nativeMap(page,'map');expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    // Missing catalog node, missing status and unknown copy each restore complete DOM.
    for(const selector of ['[data-marsh-stop="landing"]','[data-marsh-stop="fork"] > em']){
      await page.evaluate(selector=>{const n=document.querySelector(selector);window.__missing={n,parent:n.parentNode,next:n.nextSibling};n.remove();},selector);
      await expect.poll(async()=>(await snapshot(page)).nativeMarshMap.active).toBe(false);
      expect(await page.locator('.gfm160-map-dialog h2').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
      await page.evaluate(()=>{const{n,parent,next}=window.__missing;parent.insertBefore(n,next);});await nativeMap(page,'map');
    }
    await page.evaluate(()=>{const n=document.createElement('aside');n.id='map-future';n.textContent='Future observation';document.querySelector('.gfm160-map-dialog').append(n);});
    await expect.poll(async()=>(await snapshot(page)).nativeMarshMap.active).toBe(false);
    await page.keyboard.press('Escape');expect(await saved(page)).toEqual(before);expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);
    await page.evaluate(()=>document.getElementById('map-future').remove());await page.setViewportSize({width,height:width===390?844:900});
    await use('.lws-bottom-bar [data-world-action="inventory"]');await expect(page.locator('[data-world-action="traveler-sheet"]')).toBeDisabled();
    await expect(page.locator('[data-world-action="traveler-sheet"]')).toContainText('Available after returning to Greyfen');await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>LegendWorldShellV170.routeTo('smith'))).toBe(false);expect(await saved(page)).toEqual(before);
    await use('.lws-bottom-bar [data-world-action="world"]');await expect(page.locator('.gfm160-results')).toBeVisible();
    await expect.poll(async()=>(await snapshot(page)).nativeMarsh.active).toBe(true);
    const settled=await saved(page);expect(settled.gold).toBe(before.gold);expect(settled.xp).toBe(before.xp);
    expect(settled.flags.greyfenMarshExpeditionV160.lastResultV160).toMatchObject({complete:false,route:'Reed Bed',goldGained:0,xpGained:0,pressure:21});
    expect(settled.flags.roadExpeditionV100).toEqual(initial.flags.roadExpeditionV100);expect(settled.futureMap).toEqual({keep:81});
    await use('.lws-bottom-bar [data-world-action="map"]');await nativeMap(page,'map');await expect(page.locator('#gfm160CloseMapFooter')).toHaveText('Return to the report');
    await expect(page.locator('[data-marsh-stop="greyfen-landing"]')).toContainText('You are here');
    await page.keyboard.press('Escape');await use('.lws-bottom-bar [data-world-action="world"]');await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(settled);
    expect(errors).toEqual([]);
  });
});
test('leaving a Marsh record releases inert state and removes the detached modal',async({page})=>{
  await open(page,390);await page.locator('#gfm160OpenMap').click();await nativeMap(page,'map');
  const before=await saved(page);await page.evaluate(()=>LegendGreyfenMarshV160.render());
  await expect(page.locator('body > #gfm160MapOverlay')).toHaveCount(0);
  await expect.poll(async()=>(await snapshot(page)).nativeMarshMap.active).toBe(false);
  expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);expect(await saved(page)).toEqual(before);
});

test.describe('mobile dock',()=>{
  test.use({hasTouch:true});
  test('mobile dock labels and regional drawer record openers remain usable',async({page})=>{
    await open(page,390);const before=await saved(page);
    const bar=page.locator('.lws-bottom-bar');
    for(const icon of await bar.locator('.lws-btn-icon').all())await expect(icon).toHaveCSS('display','none');
    await expect.poll(async()=>(await snapshot(page)).nativeBottomBarUi).toBe(true);
    const labels=await page.evaluate(()=>LegendPhaserWorldV1.engine.scene.getScene('RealmScene').nativeBottomBarUiObjects.filter(n=>n.type==='Text').map(n=>({text:n.text,width:n.style.fixedWidth,needed:n.context.measureText(n.text).width})));
    expect(labels.map(n=>n.text)).toEqual(['Report','Inventory','Journal','Map','Combat','Settings']);
    for(const label of labels)expect(label.width).toBeGreaterThanOrEqual(label.needed-.5);
    await bar.locator('[data-world-action="inventory"]').tap();await expect(page.locator('[data-world-action="traveler-sheet"]')).toBeDisabled();await page.keyboard.press('Escape');
    for(const [side,action,view] of [['right','map','map'],['left','journal','journal']]){
      await page.locator(`[data-world-action="toggle-${side}"]`).tap();
      const opener=page.locator(`#lws-panel-${side} [data-world-action="${action}"]`);
      await opener.scrollIntoViewIfNeeded();await opener.tap();await nativeMap(page,view);
      await page.keyboard.press('Escape');await expect(opener).toBeFocused();await expect(opener).toBeInViewport();
      await page.locator(`[data-world-action="toggle-${side}"]`).tap();
    }
    expect(await saved(page)).toEqual(before);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  });
});
