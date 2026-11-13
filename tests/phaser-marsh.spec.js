const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function native(page,state){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeMarsh;return{active:s.active,failure:s.failure,state:s.state};}),{timeout:15000}).toEqual({active:true,failure:'',state});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeMarsh);
}
async function open(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
  await page.evaluate(width=>{
    const p=LegendStorage.normalize({username:'Marsh Native QA',className:'Ranger',level:1,xp:0,hp:60,maxHp:100,gold:20,
      weapon:'hand',armor:'none',inventory:{food:width===390?0:2,camp:1},futureMarsh:{keep:72},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,greyfenDryCrossingComplete:true,futureEvidence:'kept',
        roadExpeditionV100:{active:false,stage:2,pressure:47,route:'ridge',futureRoad:'kept'}}});
    p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];
    LegendStorage.savePlayer(p);LegendAshmereV099.renderAshmere();
  },width);
  await page.locator('[data-ash-view="marsh"]').first().click();await native(page,'landing');
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`marsh survey preserves route costs, supplies, evidence, focus and native fallback at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,width);
    const initial=await saved(page),reeds=width===1440;
    const use=async id=>{const n=page.locator('#'+id);await n.scrollIntoViewIfNeeded();if(width===390)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}};
    await expect(page.locator('.gfm160-scene-copy h1')).toBeFocused();
    await use('gfm160Begin');await native(page,'fork');await expect(page.locator('.gfm160-feedback')).toContainText('Split Causeway');
    if(!reeds)await expect(page.locator('#gfm160ChooseReeds')).toBeDisabled();
    // Map remains a usable DOM modal, with no blur and complete keyboard/focus parity.
    await use('gfm160OpenMap');await expect(page.locator('#gfm160CloseMap')).toBeFocused();
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeMarsh.active)).toBe(false);
    expect(await page.locator('#gfm160MapOverlay').evaluate(n=>getComputedStyle(n).backdropFilter)).toBe('none');
    await page.keyboard.press('Shift+Tab');await expect(page.locator('#gfm160CloseMapFooter')).toBeFocused();
    await page.keyboard.press('Tab');await expect(page.locator('#gfm160CloseMap')).toBeFocused();
    await page.keyboard.press('Escape');await expect(page.locator('#gfm160OpenMap')).toBeFocused();await native(page,'fork');
    await use(reeds?'gfm160ChooseReeds':'gfm160ChooseRaised');await native(page,reeds?'reeds':'raised');
    let p=await saved(page);expect(p.inventory.food).toBe(initial.inventory.food-(reeds?1:0));
    expect(p.flags.greyfenMarshExpeditionV160.pressure).toBe(reeds?12:4);
    if(reeds){
      await use('gfm160VisitFerry');await native(page,'ferry');await use('gfm160AvoidRaider');await native(page,'ferry-cleared');
      await expect(page.locator('.gfm160-feedback')).toContainText('Pressure rises by 4');
      await use('gfm160ReturnFromFerry');await native(page,'reeds-return');
    }
    await use('gfm160Continue');await native(page,'sluice');await expect(page.locator('#gfm160ContinueShelter')).toBeDisabled();
    await use('gfm160PassSluice');await native(page,'sluice-crossed');await use('gfm160ContinueShelter');await native(page,'shelter');
    await use('gfm160VisitStorehouse');await native(page,'storehouse');
    const beforeReload=await saved(page);await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);
    await expect(page.locator('.v120-title')).toBeVisible();await page.evaluate(()=>LegendGreyfenMarshV160.start());await native(page,'storehouse');
    expect(await saved(page)).toEqual(beforeReload);
    await use('gfm160ReturnFromStorehouse');await native(page,'shelter-return');await use('gfm160Rest');await native(page,'shelter-return');
    await expect(page.locator('#gfm160Rest')).toBeDisabled();await expect(page.locator('.gfm160-feedback')).toContainText('recover 20 HP');
    await use('gfm160ContinueGauge');await native(page,'gauge');await use('gfm160InspectGauge');let ui=await native(page,'gauge-recorded');
    const beforeFallback=await saved(page);
    for(const selector of ['#gfm160Complete','.gfm160-scene-art','.gfm160-status > div > strong']){
      await page.evaluate(selector=>{const n=document.querySelector(selector);window.__missing={n,parent:n.parentNode,next:n.nextSibling};n.remove();},selector);
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeMarsh.active)).toBe(false);
      expect(await page.locator('.gfm160-scene-copy h1').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
      await page.evaluate(()=>{const{n,parent,next}=window.__missing;parent.insertBefore(n,next);});await native(page,'gauge-recorded');
    }
    await page.evaluate(()=>{const n=document.createElement('aside');n.id='future-marsh';n.textContent='Future marsh observation';document.querySelector('.gfm160-content').append(n);});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeMarsh.active)).toBe(false);
    await page.evaluate(()=>document.getElementById('future-marsh').remove());await native(page,'gauge-recorded');
    await page.setViewportSize({width:844,height:390});await page.locator('#gfm160Complete').focus();ui=await native(page,'gauge-recorded');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    for(const label of ui.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
    expect(await saved(page)).toEqual(beforeFallback);
    await page.setViewportSize({width,height:width===390?844:900});await use('gfm160Complete');ui=await native(page,'report');
    expect(ui.art).toEqual(['assets/generated/locations/greyfen-marsh-walkway.webp']);
    expect(await page.locator('.gfm160-results-art').evaluate(n=>getComputedStyle(n).backgroundColor)).toBe('rgba(0, 0, 0, 0)');await expect(page.locator('.gfm160-results-panel h1')).toBeFocused();
    const after=await saved(page),s=after.flags.greyfenMarshExpeditionV160;
    expect(after.gold).toBe(initial.gold+35);expect(after.xp).toBe(initial.xp+35);expect(after.hp).toBe(initial.hp+20);
    expect(after.inventory.camp).toBe(0);expect(after.inventory.peatBrick).toBe(reeds?1:2);expect(after.inventory.clothScrap||0).toBe(reeds?1:0);
    expect(s).toMatchObject({active:false,pressure:reeds?23:6,hoursElapsed:reeds?5:4,gaugeInspected:true,shelterRested:true});
    expect(s.lastResultV160).toMatchObject({complete:true,goldGained:35,xpGained:35,optionalSalvage:'1 Dry Peat Brick from the Silted Storehouse'});
    expect(after.futureMarsh).toEqual({keep:72});expect(after.flags.futureEvidence).toBe('kept');expect(after.flags.roadExpeditionV100).toEqual(initial.flags.roadExpeditionV100);
    // Revisiting a saved report cannot settle the outing a second time.
    await page.evaluate(()=>LegendGreyfenMarshV160.settle(true));await native(page,'report');expect(await saved(page)).toEqual(after);
    await use(reeds?'gfm160ResultReturn':'gfm160ResultAgain');await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await saved(page)).toEqual(after);expect(errors).toEqual([]);
  });
});
test('early marsh report preserves unknown fields and actual partial rewards through DOM fallback',async({page})=>{
  await open(page,390);await page.locator('#gfm160EarlyExit').click();await native(page,'report');
  const before=await saved(page);expect(before.flags.greyfenMarshExpeditionV160.lastResultV160).toMatchObject({complete:false,goldGained:0,xpGained:0,route:'Route not chosen'});
  await page.evaluate(()=>{const n=document.createElement('p');n.textContent='Future report field';document.querySelector('.gfm160-results-panel').append(n);});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeMarsh.active)).toBe(false);
  await page.locator('#gfm160ResultReturn').click();await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(before);
});

test('complete and partial marsh reports preserve settlement through level growth',async({page})=>{
  for(const complete of [true,false]){
    await open(page,390);
    await page.evaluate(complete=>{
      const p=LegendStorage.loadPlayer();p.xp=99;p.hp=60;p.maxHp=100;
      Object.assign(p.flags.greyfenMarshExpeditionV160,{active:true,stage:complete?4:3,routeChoice:'raised',gaugeInspected:complete,pressure:12,hoursElapsed:1});
      LegendStorage.savePlayer(p);LegendGreyfenMarshV160.render();
    },complete);
    const before=await saved(page);await native(page,complete?'gauge-recorded':'shelter');
    await page.locator(complete?'#gfm160Complete':'#gfm160EarlyExit').click();
    await expect(page.getByRole('dialog',{name:'Level 2'})).toBeVisible();
    await page.locator('[data-attr-add="endurance"]').click();await page.locator('[data-attr-add="endurance"]').click();
    await page.locator('#v152-growth-confirm').click();await native(page,'report');
    await expect(page.locator('.gfm160-results-panel h1')).toBeFocused();
    const after=await saved(page),report=after.flags.greyfenMarshExpeditionV160.lastResultV160;
    expect(report).toMatchObject({complete,xpGained:complete?35:10,goldGained:complete?35:0,levelsGained:1,levelBefore:1,levelAfter:2});
    expect(after.gold).toBe(before.gold+(complete?35:0));expect(after.xp).toBe(complete?34:9);
    expect(after.level).toBe(2);expect(after.hp).toBe(74);expect(after.maxHp).toBe(114);expect(after.pendingStatPointsV152).toBe(0);
    expect(after.inventory).toEqual(before.inventory);expect(after.futureMarsh).toEqual({keep:72});
    expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);
    await page.evaluate(()=>LegendGreyfenMarshV160.settle(true));await native(page,'report');expect(await saved(page)).toEqual(after);
    await page.locator('#gfm160ResultReturn').click();await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(after);
  }
});
