const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function open(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  await page.evaluate(()=>{
    const p=LegendStorage.normalize({username:'Regional Shell QA',className:'Ranger',level:3,hp:80,maxHp:100,gold:20,weapon:'ironSword',inventory:{food:2,potion:2},futureShell:{keep:42},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,greyfenDryCrossingComplete:true,
        roadExpeditionV100:{stage:2,pressure:47,futureRoad:'keep'},roadFieldJournalV150:{visitedPlaces:['old-road'],discoveries:['old-find'],routes:['old-route'],campReports:['old-camp']},
        greyfenStorehouseV170:{active:true,room:1,approach:'upper',clears:0,attempts:1,records:[],futureStorehouse:'keep'},
        greyfenMarshFieldJournalV160:{visitedPlaces:['landing','posts','gauge'],discoveries:['waterline','ferry'],trips:[{route:'Raised Posts'},{route:'Reed Bed'}]},
        greyfenMarshExpeditionV160:{active:true,stage:2,pressure:17,trips:1,routeChoice:'reeds',futureMarsh:'keep'}}});
    p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');
  });
  await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context','storehouse');
}
async function drawer(page,side,width){
  if(width<1200&&!await page.locator('body').evaluate((n,side)=>n.classList.contains('legend-shell-'+side+'-open'),side))await page.locator(`[data-world-action="toggle-${side}"]`).click();
  await expect.poll(()=>page.evaluate(side=>LegendPhaserWorldV1.snapshot()[side==='left'?'nativeLeftDrawerUi':'nativeRightDrawerUi'],side),{timeout:15000}).toBe(true);
}
async function action(page,id,width){
  await drawer(page,'right',width);const n=page.locator(`#lws-panel-right [data-world-action="storehouse-${id}"]`);await n.scrollIntoViewIfNeeded();
  if(width===390)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`Storehouse shell preserves room actions, records and distinct return semantics at ${width}px`,async({page})=>{
    await open(page,width);const errors=[];page.on('pageerror',e=>errors.push(e.message));const before=await saved(page);
    await drawer(page,'right',width);
    await expect(page.locator('#lws-panel-right [data-world-action="prepare-road"]')).toHaveCount(0);
    await expect(page.locator('#lws-panel-right')).toContainText('Read and preserve the damp dispatch');
    await action(page,'gss170ReadDispatch',width);await action(page,'gss170Salvage',width);
    const records=await saved(page);expect(records.flags.greyfenStorehouseV170.records).toHaveLength(2);expect(records.inventory.peatBrick).toBe(before.inventory.peatBrick+1);expect(records.inventory.oil).toBe(before.inventory.oil+1);
    await page.locator('.lws-bottom-bar [data-world-action="journal"]').click();await drawer(page,'left',width);
    await expect(page.locator('#lws-storehouse-notes')).toBeFocused();await expect(page.locator('#lws-storehouse-notes')).toContainText('Damp Storehouse Dispatch');await expect(page.locator('#lws-storehouse-notes')).toContainText('Dry Peat and Lamp Oil');
    await expect(page.locator('#lws-storehouse-notes')).not.toContainText('Road notes');
    const labels=await page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeLeftDrawerLabels.map(n=>n.sourceText));expect(labels).toContain('Damp Storehouse Dispatch');
    expect(await saved(page)).toEqual(records);
    await page.keyboard.press('Escape');await page.locator('.lws-bottom-bar [data-world-action="world"]').click();await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(records);
    await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await page.evaluate(()=>LegendAshmereV099.route('storehouse'));
    await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state','records');
    await action(page,'gss170Retreat',width);await expect(page.locator('.ash100-town')).toBeVisible();const after=await saved(page);
    expect(after.flags.greyfenStorehouseV170).toMatchObject({active:false,retreats:1,futureStorehouse:'keep'});expect(after.flags.greyfenStorehouseV170.records).toEqual(records.flags.greyfenStorehouseV170.records);
    expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);expect(after.inventory).toEqual(records.inventory);expect(after.futureShell).toEqual({keep:42});expect(errors).toEqual([]);
  });
});
test('regional encounters and results retain their own journal and navigation lock',async({page})=>{
  await open(page,390);
  for(const kind of ['storehouse','wisp','ferry']){
    await page.evaluate(kind=>{
      const p=LegendStorage.loadPlayer();p.hp=80;p.flags.greyfenStorehouseV170.active=true;p.flags.greyfenStorehouseV170.room=1;
      p.flags.greyfenStorehouseV170.records=[{key:'dispatch',title:'Damp Storehouse Dispatch',note:'Saved dispatch with its authorization leaf missing.'}];
      Object.assign(p.flags.greyfenMarshExpeditionV160,{active:true,stage:kind==='wisp'?2:1,activeSideTrip:kind==='ferry'?'fallen-ferry':null});LegendStorage.savePlayer(p);
      if(kind==='storehouse')LegendAshmereV099.route('storehouse');else LegendGreyfenMarshV160.render();
    },kind);
    await page.locator(kind==='storehouse'?'#gss170Fight':kind==='wisp'?'#gfm160FaceWisp':'#gfm160FaceRaider').click();
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context','combat');await drawer(page,'left',390);const before=await saved(page);
    if(kind==='storehouse')await expect(page.locator('#lws-storehouse-notes')).toContainText('Damp Storehouse Dispatch');
    else{
      await expect(page.locator('#lws-panel-left')).toContainText('Marsh notes');
      const field=page.locator('#lws-panel-left .lws-section').filter({hasText:'Marsh notes'});
      await expect(field.locator('li strong')).toHaveText(['3','2','2','2']);await expect(field.locator('[data-world-action="journal"]')).toBeDisabled();
    }
    for(const id of ['world','journal','map'])await expect(page.locator(`.lws-bottom-bar [data-world-action="${id}"]`)).toBeDisabled();
    expect(await saved(page)).toEqual(before);await page.keyboard.press('Escape');await page.locator('#flee').click();
    if(kind==='ferry'){
      await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context','combat-results');await drawer(page,'left',390);await expect(page.locator('#lws-panel-left')).toContainText('Marsh notes');
      const after=await saved(page);expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);await page.keyboard.press('Escape');await expect(page.locator('.v152-combat-results')).toBeVisible();expect(await page.evaluate(()=>LegendPhaserWorldV1.snapshot().environment)).toBe('marsh');await page.locator('#v152CombatReturn').click();await expect(page.locator('.gfm160-page')).toHaveAttribute('data-marsh-state','ferry-cleared');expect(await saved(page)).toEqual(after);
    }
  }
});

test('normal-motion forwarded Storehouse actions execute once and reveal the destination',async({page})=>{
  await open(page,1440);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{const p=LegendStorage.loadPlayer();p.flags.greyfenStorehouseV170.room=0;p.flags.greyfenStorehouseV170.approach='';LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');});
  const before=await saved(page);await action(page,'gss170Sump',1440);
  await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state','records',{timeout:5000});
  const after=await saved(page);expect(after.hp).toBe(before.hp-6);expect(after.inventory.roadHerb).toBe(before.inventory.roadHerb+1);
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/,{timeout:5000});
  expect(await saved(page)).toEqual(after);
});

test('inactive Storehouse shell describes saved reports without promising a resumable attempt',async({page})=>{
  await open(page,390);
  for(const state of ['locked','entry','failed','complete']){
    await page.evaluate(state=>{const p=LegendStorage.loadPlayer();p.flags.greyfenDryCrossingComplete=state!=='locked';p.flags.greyfenStorehouseV170={active:false,failed:state==='failed',completed:state==='complete',clears:state==='complete'?1:0,attempts:1,records:[],lastReport:state==='complete'?'Prior cleared report.':'',futureStorehouse:'keep'};LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');},state);
    await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state',state);const before=await saved(page);await drawer(page,'right',390);
    await expect(page.locator('#lws-panel-right')).not.toContainText('resumable');await expect(page.locator('#lws-panel-right [data-world-action="world"]')).toContainText('Return to the town streets');
    const ids=await page.locator('.gss170-page button[id]').evaluateAll(nodes=>nodes.map(n=>'storehouse-'+n.id));
    expect(await page.locator('#lws-panel-right button').evaluateAll(nodes=>nodes.map(n=>n.dataset.worldAction))).toEqual([...ids,'world']);
    if(state==='complete'){await page.locator('.lws-bottom-bar [data-world-action="journal"]').click();await expect(page.locator('#lws-storehouse-notes')).toContainText('Prior cleared report.');}
    expect(await saved(page)).toEqual(before);
  }
});
test.describe('normal-motion touch',()=>{
  test.use({hasTouch:true});
  test('normal-motion touch preserves the Storehouse route cost and clears the curtain',async({page})=>{
    await open(page,390);await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{const p=LegendStorage.loadPlayer();p.flags.greyfenStorehouseV170.room=0;p.flags.greyfenStorehouseV170.approach='';LegendStorage.savePlayer(p);LegendAshmereV099.route('storehouse');});
    const before=await saved(page);await action(page,'gss170Sump',390);await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state','records');
    const after=await saved(page);expect(after.hp).toBe(before.hp-6);expect(after.inventory.roadHerb).toBe(before.inventory.roadHerb+1);expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);
    await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/,{timeout:5000});expect(await saved(page)).toEqual(after);
  });
});
