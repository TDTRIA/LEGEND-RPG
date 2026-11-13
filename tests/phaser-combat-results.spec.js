const { test, expect } = require('@playwright/test');
test.setTimeout(120000);
async function native(page) {
  await expect.poll(() => page.evaluate(() => {
    const s=LegendPhaserWorldV1.snapshot().nativeCombatResults; return {active:s?.active,failure:s?.failure};
  }), {timeout:15000}).toEqual({active:true,failure:''});
  return page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatResults);
}
async function battle(page, width, defeat=false) {
  await page.setViewportSize({width,height:width===390?844:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(defeat => {
    const player=LegendStorage.normalize({username:'ResultBattleQA',className:'Ranger',currentRegion:'Ashmere',
      level:1,xp:defeat?0:99,hp:defeat?1:40,maxHp:100,gold:10,weapon:'hand',armor:'none',
      inventory:{potion:1,roadToken:0},futureCombatResult:{keep:31},flags:{introV094Complete:true,
        roadExpeditionV100:{stage:0,pressure:53,trips:1,routeChoice:null,poiUsed:{},searchUsed:{},readUsed:{}}}});
    LegendStorage.savePlayer(player);
    LegendRoadsV100.oldRoad.enemies=LegendRoadsV100.oldRoad.enemies.filter(e=>e.id==='goblin').map(e=>({...e,
      hp:defeat?[999,999]:[1,1],damage:defeat?[100,100]:[3,3],goldDrop:[2,2],bonusDrop:{item:'tornHide',chance:100,amount:[2,2]}}));
    LegendRoadControllerV100.renderExpedition();
  },defeat);
  await page.locator('#push').click();
  await expect(page.locator('.rpg-battle')).toBeVisible();
  const before=await page.evaluate(()=>LegendStorage.loadPlayer());
  await page.locator('#strike').click();
  await expect(page.locator('.v152-combat-results')).toBeVisible();
  return before;
}
for(const width of [1440,390]) test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`combat victory report preserves exact rewards, growth and handoff at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const before=await battle(page,width);
    expect(before.flags.roadExpeditionV100.stage).toBe(0);
    await expect(page.getByRole('dialog',{name:'Level 2'})).toBeVisible();
    await expect(page.locator('[data-attr-add="might"]')).toBeFocused();
    await page.locator('[data-attr-add="endurance"]').click();
    await page.locator('[data-attr-add="endurance"]').click();
    await page.locator('#v152-growth-confirm').click();
    await expect(page.locator('.v152-results-heading h1')).toBeFocused();
    await expect(page.locator('.v152-result-level-note')).toContainText('choices are recorded');
    const saved=await page.evaluate(()=>LegendStorage.loadPlayer());
    expect(saved.gold).toBe(before.gold+2);
    expect(saved.inventory.gmail).toBe(Number(before.inventory.gmail||0)+1);
    expect(saved.inventory.tornHide).toBe(Number(before.inventory.tornHide||0)+2);
    expect(saved.level).toBe(2);expect(saved.xp).toBe(15);
    expect(saved.hp).toBe(54);expect(saved.maxHp).toBe(114);
    expect(saved.attributesV152.endurance).toBe(2);expect(saved.pendingStatPointsV152).toBe(0);
    expect(saved.flags.roadExpeditionV100.stage).toBe(before.flags.roadExpeditionV100.stage+1);
    expect(saved.flags.roadExpeditionV100.pressure).toBe(before.flags.roadExpeditionV100.pressure-8);
    expect(saved.futureCombatResult).toEqual({keep:31});
    expect(saved.inventory.roadToken).toBe(0);
    const raw=await page.evaluate(()=>localStorage.getItem('legend-roads-of-ashmere-v09'));
    let state=await native(page);
    expect(state.art).toHaveLength(3);
    expect(state.labels.map(n=>n.text)).toEqual(expect.arrayContaining(['Victory','+16','+2g','Goblin Mail · Torn Hide ×2']));
    await expect(page.locator('.v152-result-reward > b')).toHaveCount(0);
    await page.locator('#v152CombatReturn').scrollIntoViewIfNeeded();
    await page.locator('#v152CombatReturn').focus();
    await expect.poll(async()=>(await native(page)).focused).toBe('v152CombatReturn');
    state=await native(page);
    const shell=await page.evaluate(()=>({hud:document.querySelector('.lws-hud').getBoundingClientRect().bottom,dock:document.querySelector('.lws-bottom-bar').getBoundingClientRect().top}));
    expect(state.clip.y).toBeGreaterThanOrEqual(shell.hud-1);
    expect(state.clip.y+state.clip.height).toBeLessThanOrEqual(shell.dock+1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    for(const label of state.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
    await page.evaluate(()=>{const button=document.getElementById('v152CombatReturn');window.__resultReturn={button,parent:button.parentNode};button.remove();});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults.active)).toBe(false);
    await page.evaluate(()=>{const {button,parent}=window.__resultReturn;parent.append(button);});await native(page);
    // Missing image and an unknown field must reveal complete DOM, then recover.
    await page.evaluate(()=>{const image=document.querySelector('.v152-results-foe img');window.__resultImage={image,parent:image.parentNode};image.remove();});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults.active)).toBe(false);
    expect(await page.locator('.v152-results-heading h1').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
    await page.evaluate(()=>{const {image,parent}=window.__resultImage;parent.prepend(image);});
    await native(page);
    await page.evaluate(()=>{const n=document.createElement('div');n.id='future-result-field';n.textContent='Future result evidence';document.querySelector('.v152-results-rewards').append(n);});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults.active)).toBe(false);
    await page.evaluate(()=>document.getElementById('future-result-field').remove());await native(page);
    expect(await page.evaluate(()=>localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(raw);
    if(width===390){await page.locator('#v152CombatReturn').tap();await expect(page.locator('.ash100-town')).toBeVisible();}
    else {await page.locator('#v152CombatContinue').focus();await page.keyboard.press('Enter');await expect(page.locator('.exp150-world-page')).toBeVisible();}
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults.active)).toBe(false);
    const after=await page.evaluate(()=>LegendStorage.loadPlayer());
    expect(after.gold).toBe(saved.gold);expect(after.xp).toBe(saved.xp);expect(after.inventory.gmail).toBe(saved.inventory.gmail);
    expect(after.futureCombatResult).toEqual({keep:31});expect(errors).toEqual([]);
  });
});
test('combat defeat report preserves saved loss state and the real town return',async({page})=>{
  const before=await battle(page,390,true);
  await expect(page.locator('.v152-results-heading h1')).toBeFocused();
  const state=await native(page);
  expect(state.controls).toEqual(['v152CombatReturn']);
  expect(state.labels.map(n=>n.text)).toEqual(expect.arrayContaining(['Driven Back','Nothing recovered','Reset','+0']));
  const saved=await page.evaluate(()=>LegendStorage.loadPlayer());
  expect(saved.hp).toBe(1);expect(saved.gold).toBe(before.gold);expect(saved.xp).toBe(before.xp);
  expect(saved.inventory).toEqual(before.inventory);
  expect(saved.flags.roadExpeditionV100.stage).toBe(0);
  expect(saved.flags.roadExpeditionV100.pressure).toBe(before.flags.roadExpeditionV100.pressure+12);
  expect(saved.futureCombatResult).toEqual({keep:31});
  await page.locator('#v152CombatReturn').click();await expect(page.locator('.ash100-town')).toBeVisible();
});
