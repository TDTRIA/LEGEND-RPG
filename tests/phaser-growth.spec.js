const {test,expect}=require('@playwright/test');
test.setTimeout(120000);
async function native(page){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeGrowth;return{active:s?.active,failure:s?.failure};}),{timeout:15000}).toEqual({active:true,failure:''});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeGrowth);
}
async function open(page,width){
  await page.setViewportSize({width,height:width===390?844:900});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
  await page.evaluate(()=>{
    const player=LegendStorage.normalize({username:'GrowthNativeQA',className:'Ranger',level:3,xp:17,hp:20,maxHp:80,gold:12,
      pendingStatPointsV152:4,attributesV152:{might:2,endurance:1,futureAttribute:9},futureGrowth:{keep:23},
      flags:{introV094Complete:true,futureEvidence:'kept'},inventory:{futureItem:3}});
    LegendStorage.savePlayer(player);window.__growthBefore=localStorage.getItem('legend-roads-of-ashmere-v09');
    window.__growthSaveCount=0;const runtime=LegendRuntimeV120;
    window.LegendRuntimeV120={...runtime,savePlayer:player=>{window.__growthSaveCount++;return runtime.savePlayer(player);}};
    LegendLevelUpV152.open(player,{levels:2});
  });
  await native(page);
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`native growth preserves allocation, focus, saves and fallback at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,width);
    const keys=['might','agility','arcana','endurance','insight','fortune'];
    const use=async selector=>{const node=page.locator(selector);if(width===390)await node.tap();else{await node.focus();await page.keyboard.press('Enter');}};
    await expect(page.locator('[data-attr-add="might"]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');await expect(page.locator('[data-attr-add="fortune"]')).toBeFocused();
    await page.keyboard.press('Tab');await expect(page.locator('[data-attr-add="might"]')).toBeFocused();
    await page.keyboard.press('Escape');await expect(page.locator('#legendLevelUpOverlay')).toBeVisible();
    expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(true);
    expect(await page.locator('.v152-growth-backdrop').evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
    for(const key of keys){
      await expect(page.locator(`[data-attr-minus="${key}"]`)).toBeDisabled();
      await use(`[data-attr-add="${key}"]`);await expect(page.locator(`[data-allocation="${key}"]`)).toHaveText('1');
      await use(`[data-attr-minus="${key}"]`);await expect(page.locator(`[data-allocation="${key}"]`)).toHaveText('0');
      await expect(page.locator(`[data-attr-add="${key}"]`)).toBeFocused();
    }
    for(const key of ['might','arcana','endurance','endurance'])await use(`[data-attr-add="${key}"]`);
    await expect(page.locator('#v152-growth-confirm')).toBeFocused();
    for(const key of keys)await expect(page.locator(`[data-attr-add="${key}"]`)).toBeDisabled();
    await page.keyboard.press('Tab');await expect(page.locator('[data-attr-minus="might"]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');await expect(page.locator('#v152-growth-confirm')).toBeFocused();
    let state=await native(page);expect(state.controls).toHaveLength(13);expect(state.art).toHaveLength(2);
    expect(state.labels.map(n=>n.text)).toEqual(expect.arrayContaining(['1 allocated','2 allocated','4 / 4','Level 3','Might','Agility','Arcana','Endurance','Insight','Fortune','Apply Growth']));
    expect(state.clip.width).toBeGreaterThan(300);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    const footer=await page.locator('.v152-growth-footer > p').textContent();
    expect(state.labels.filter(n=>n.text===footer.trim())).toHaveLength(1);
    expect(await page.evaluate(()=>getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
    for(const label of state.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
    for(const selector of ['.v152-levelup-portrait','[data-allocation="fortune"]']){
      await page.evaluate(selector=>{const node=document.querySelector(selector);window.__missingGrowth={node,parent:node.parentNode,next:node.nextSibling};node.remove();},selector);
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeGrowth.active)).toBe(false);
      expect(await page.locator('#v152-levelup-title').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
      await expect(page.locator('#v152-growth-confirm')).toBeEnabled();
      await page.evaluate(()=>{const{node,parent,next}=window.__missingGrowth;parent.insertBefore(node,next);});await native(page);
    }
    expect(await page.evaluate(()=>localStorage.getItem('legend-roads-of-ashmere-v09')===window.__growthBefore)).toBe(true);
    expect(await page.evaluate(()=>window.__growthSaveCount)).toBe(0);
    await page.evaluate(()=>window.__growthConfirm=document.getElementById('v152-growth-confirm'));
    await use('#v152-growth-confirm');await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeGrowth.active)).toBe(false);
    await page.evaluate(()=>window.__growthConfirm.click());
    const saved=await page.evaluate(()=>LegendStorage.loadPlayer());
    expect(saved.attributesV152).toEqual({might:3,agility:0,arcana:1,endurance:3,insight:0,fortune:0,futureAttribute:9});
    expect(saved).toMatchObject({level:3,xp:17,hp:26,maxHp:86,gold:12,pendingStatPointsV152:0,futureGrowth:{keep:23}});
    expect(saved.flags.futureEvidence).toBe('kept');expect(saved.inventory.futureItem).toBe(3);
    expect(await page.evaluate(()=>window.__growthSaveCount)).toBe(1);
    expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);
    expect(errors).toEqual([]);
  });
});
test('pending growth reloads without saving draft choices and restores background on replacement',async({page})=>{
  await open(page,390);
  await page.locator('[data-attr-add="might"]').click();
  await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(1);await native(page);
  await expect(page.locator('[data-allocation="might"]')).toHaveText('0');await expect(page.locator('#v152-growth-total')).toHaveText('4');
  expect((await page.evaluate(()=>LegendStorage.loadPlayer())).attributesV152.might).toBe(2);
  await page.evaluate(()=>LegendLevelUpV152.open(LegendStorage.loadPlayer(),{levels:2}));await native(page);
  await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(1);
  await page.setViewportSize({width:844,height:390});
  await page.locator('[data-attr-add="fortune"]').focus();await native(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.evaluate(()=>document.getElementById('legendLevelUpOverlay').remove());
  await expect.poll(()=>page.locator('#root').evaluate(n=>n.inert)).toBe(false);
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeGrowth.active)).toBe(false);
  expect((await page.evaluate(()=>LegendStorage.loadPlayer())).pendingStatPointsV152).toBe(4);
});
