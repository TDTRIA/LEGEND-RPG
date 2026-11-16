const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function open(page,width=390){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
  await page.evaluate(()=>{
    const p=LegendStorage.normalize({username:'Storehouse Native QA',className:'Ranger',level:2,xp:0,hp:60,maxHp:100,gold:20,inventory:{food:2,camp:1},futureDelve:{keep:72},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,greyfenDryCrossingComplete:true,futureEvidence:'kept',roadExpeditionV100:{active:false,stage:2,pressure:47,futureRoad:'kept'}}});
    p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');
  });
}
test('Storehouse begin, retry and repeat preserve save extensions and reset only known attempt fields',async({page})=>{
  await open(page);
  for(const [state,id] of [['entry','gss170Begin'],['failed','gss170Retry'],['complete','gss170Again']]){
    await page.evaluate(state=>{
      const p=LegendStorage.loadPlayer();p.flags.greyfenStorehouseSalvageCollected=true;
      p.flags.greyfenStorehouseV170={active:false,failed:state==='failed',completed:state==='complete',room:3,clears:2,attempts:4,retreats:1,
        inBattle:false,battleWon:true,rewardClaimed:true,approach:'sump',dispatchRead:true,salvageCollected:true,startedDay:0,
        lastRoom:2,lastReport:'Prior completed report',combatXp:18,futureNested:{choice:'preserved',values:[1,3]},futureFlag:true,
        records:[{key:'dispatch',title:'Saved note',note:'Preserve this record',day:1,futureRecord:{keep:true}}]};
      LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');
    },state);
    const before=await saved(page);await page.locator('#'+id).click();const after=await saved(page);
    const expected=structuredClone(before),run=expected.flags.greyfenStorehouseV170;
    Object.assign(run,{active:true,room:0,attempts:5,failed:false,completed:false,inBattle:false,battleWon:false,rewardClaimed:false,
      approach:'',dispatchRead:false,salvageCollected:true,startedDay:before.day||1});
    delete run.lastRoom;delete run.lastReport;delete run.combatXp;
    expect(after).toEqual(expected);
  }
});
async function native(page,state){
  await expect(page.locator('.ash099-screen')).toHaveAttribute('data-phaser-storehouse','true',{timeout:15000});
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeStorehouse;return{active:s.active,failure:s.failure,state:s.state};}),{timeout:15000}).toEqual({active:true,failure:'',state});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeStorehouse);
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`Storehouse native rooms preserve discoveries, reload, rewards and return at ${width}px`,async({page})=>{
    test.setTimeout(240000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,width);await native(page,'entry');
    const use=async id=>{const n=page.locator('#'+id);await n.scrollIntoViewIfNeeded();if(width===390)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}};
    const initial=await saved(page);await expect(page.locator('.gss170-scene-copy h1')).toBeFocused();
    await use('gss170Begin');await native(page,'loading');await use(width===390?'gss170Sump':'gss170Upper');await native(page,'records');
    const route=await saved(page);expect(route.hp).toBe(initial.hp-(width===390?6:0));expect(route.inventory.roadHerb).toBe((initial.inventory.roadHerb||0)+(width===390?1:0));
    expect(route.flags.greyfenStorehouseV170.approach).toBe(width===390?'sump':'upper');
    await use('gss170ReadDispatch');await expect.poll(async()=>(await native(page,'records')).labels.some(n=>n.sourceText.includes('Dispatch preserved.'))).toBe(true);
    await use('gss170Salvage');await expect.poll(async()=>(await native(page,'records')).labels.some(n=>n.sourceText==='Recovered one Dry Peat Brick and one flask of Lamp Oil.')).toBe(true);
    const records=await saved(page);expect(records.inventory.peatBrick).toBe((initial.inventory.peatBrick||0)+1);expect(records.inventory.oil).toBe((initial.inventory.oil||0)+1);
    expect(records.flags.greyfenStorehouseV170.records.map(n=>n.key)).toEqual(['dispatch','salvage']);
    expect(records.flags.greyfenStorehouseDispatchFound).toBe(true);expect(records.flags.greyfenStorehouseSalvageCollected).toBe(true);
    await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();await page.evaluate(()=>LegendAshmereV099.route('storehouse'));await native(page,'records');expect(await saved(page)).toEqual(records);
    await expect(page.locator('#gss170ReadDispatch,#gss170Salvage')).toHaveCount(0);
    // The existing Back action leaves an active saved delve resumable.
    await use('ashBack');await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(records);
    await page.evaluate(()=>{const p=LegendStorage.loadPlayer();Object.assign(p.flags.greyfenStorehouseV170,{room:2,inBattle:true,futureRun:{kept:72}});LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');});
    await native(page,'keeper');let p=await saved(page);expect(p.flags.greyfenStorehouseV170.inBattle).toBe(false);expect(p.flags.greyfenStorehouseV170.futureRun).toEqual({kept:72});
    await use('gss170Retreat');await expect(page.locator('.ash100-town')).toBeVisible();p=await saved(page);expect(p.flags.greyfenStorehouseV170).toMatchObject({active:false,retreats:1,lastRoom:2});
    // Real report callbacks, seeded only at the already-won boundary. Combat is covered independently.
    await page.evaluate(()=>{const p=LegendStorage.loadPlayer();Object.assign(p.flags.greyfenStorehouseV170,{active:true,room:3,battleWon:true,rewardClaimed:false});LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');});
    await native(page,'treasure');
    if(width===390){
      await page.evaluate(()=>{const n=document.querySelector('.gss170-card-evidence');window.__missingEvidence={n,parent:n.parentNode};n.remove();});
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeStorehouse.active)).toBe(false);
      await page.evaluate(()=>__missingEvidence.parent.append(__missingEvidence.n));await native(page,'treasure');
    }
    const before=await saved(page);await page.evaluate(()=>window.__oldCollect=document.getElementById('gss170Collect'));
    await use('gss170Collect');await native(page,'complete');const reward=await saved(page);await page.evaluate(()=>__oldCollect.click());await native(page,'complete');expect(await saved(page)).toEqual(reward);
    expect(reward.gold).toBe(before.gold+30);expect(reward.xp).toBe(before.xp);expect(reward.inventory.roadHerb).toBe(before.inventory.roadHerb+1);
    expect(reward.flags.greyfenStorehouseV170).toMatchObject({active:false,completed:true,clears:1,rewardClaimed:true,futureRun:{kept:72}});
    expect(reward.flags.roadExpeditionV100).toEqual(initial.flags.roadExpeditionV100);expect(reward.futureDelve).toEqual({keep:72});expect(reward.flags.futureEvidence).toBe('kept');
    await use('gss170Again');await native(page,'loading');expect((await saved(page)).flags.greyfenStorehouseV170.futureRun).toEqual({kept:72});
    await use('gss170Retreat');await expect(page.locator('.ash100-town')).toBeVisible();expect(errors).toEqual([]);
  });
});
test('Storehouse locked, failed, repeated reward and incomplete-source fallback remain usable',async({page})=>{
  await open(page);await native(page,'entry');
  for(const state of ['locked','failed','complete']){
    await page.evaluate(state=>{const p=LegendStorage.loadPlayer();p.flags.greyfenDryCrossingComplete=state!=='locked';p.flags.greyfenStorehouseV170={active:false,failed:state==='failed',completed:state==='complete',clears:1,attempts:2};LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');},state);
    await native(page,state);
    if(state==='complete'){
      await page.evaluate(()=>{const n=document.querySelector('.gss170-card > p');window.__reportLine={n,parent:n.parentNode,next:n.nextSibling};n.remove();});
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeStorehouse.active)).toBe(false);
      await page.evaluate(()=>{const{n,parent,next}=__reportLine;parent.insertBefore(n,next);});await native(page,state);
    }
    const prior=await saved(page);await page.locator('#gss170Return').click();await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(prior);
  }
  await page.evaluate(()=>{const p=LegendStorage.loadPlayer();Object.assign(p.flags.greyfenStorehouseV170,{active:true,room:3,battleWon:true,rewardClaimed:false});LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');});
  await native(page,'treasure');const prior=await saved(page);
  for(const selector of ['#gss170Collect','.gss170-scene-art','.gss170-stat-grid > div > strong']){
    await page.evaluate(selector=>{const n=document.querySelector(selector);window.__missing={n,parent:n.parentNode,next:n.nextSibling};n.remove();},selector);
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeStorehouse.active)).toBe(false);
    expect(await page.locator('.gss170-scene-copy h1').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
    await page.evaluate(()=>{const{n,parent,next}=__missing;parent.insertBefore(n,next);});await native(page,'treasure');
  }
  await page.setViewportSize({width:844,height:390});await page.locator('#gss170Collect').focus();const ui=await native(page,'treasure');
  await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#gss170Collect')).toBeFocused();
  expect(await page.locator('#gss170Collect').evaluate(n=>n.matches(':focus-visible'))).toBe(true);
  await expect(page.locator('#gss170Collect')).toHaveCSS('outline-style','none');
  for(const label of ui.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(await saved(page)).toEqual(prior);
  await page.evaluate(()=>{const n=document.createElement('aside');n.textContent='Future Storehouse record';document.querySelector('.gss170-content').append(n);});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeStorehouse.active)).toBe(false);
  await expect(page.locator('#gss170Collect')).not.toHaveCSS('outline-style','none');
  await page.locator('#gss170Collect').click();await native(page,'complete');const after=await saved(page);
  expect(after.gold).toBe(prior.gold+30);expect(after.inventory.peatBrick).toBe(prior.inventory.peatBrick+1);expect(after.inventory.roadHerb).toBe(prior.inventory.roadHerb);expect(after.xp).toBe(prior.xp);expect(after.flags.greyfenStorehouseV170.clears).toBe(2);
});
