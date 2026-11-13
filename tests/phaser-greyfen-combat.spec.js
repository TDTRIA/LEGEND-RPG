const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function boot(page,width=390){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
}
async function seed(page,kind,outcome='retreat'){
  await page.evaluate(({kind,outcome})=>{
    const p=LegendStorage.normalize({username:'Greyfen Combat QA',className:'Ranger',level:3,xp:0,hp:outcome==='defeat'?1:80,maxHp:100,gold:17,
      weapon:['defeat','controls'].includes(outcome)?'hand':'ironSword',armor:'none',inventory:{potion:2,roadPoultice:2,food:2,camp:1,roadToken:1},futureCombat:{keep:81},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,greyfenDryCrossingComplete:true,futureClue:'kept',
        roadExpeditionV100:{stage:2,pressure:47,trips:3,routeChoice:'ridge',poiUsed:{},searchUsed:{},readUsed:{},futureRoad:'kept'},
        greyfenStorehouseV170:{active:true,room:1,inBattle:false,approach:'upper',clears:0,attempts:1,records:[],futureRun:'retained'},
        greyfenMarshExpeditionV160:{active:true,stage:kind==='wisp'?2:1,pressure:17,trips:kind==='sentinel'?2:1,routeChoice:'reeds',activeSideTrip:kind==='wisp'?null:'fallen-ferry',futureMarsh:'retained'}}});
    p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];
    LegendRoadStateV100.create({getData:()=>LEGEND_DATA,clamp:(n,a,b)=>Math.max(a,Math.min(b,n))}).ensure(p);
    LegendStorage.savePlayer(p);if(kind==='storehouse')LegendAshmereV099.route('storehouse');else LegendGreyfenMarshV160.render();
  },{kind,outcome});
  await page.locator(kind==='storehouse'?'#gss170Fight':kind==='wisp'?'#gfm160FaceWisp':'#gfm160FaceRaider').click();
}
async function battleReady(page){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot();return{active:s.nativeCombatUi,failure:s.nativeCombatUiFailure};}),{timeout:15000}).toEqual({active:true,failure:''});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot());
}
test('Storehouse combat retains Greyfen environment and Mirebound enemy art',async({page})=>{
  await boot(page);await seed(page,'storehouse');await battleReady(page);
  expect(await page.evaluate(()=>({arena:document.querySelector('.rpg-battlefield').dataset.arena,foe:document.querySelector('.rpg-foe-art').getAttribute('src')}))).toEqual({arena:'greyfen',foe:'assets/generated/enemies/mirebound-sentinel.webp'});
});
test('Marsh combat places its heading below the HUD and clips retained controls',async({page})=>{
  await boot(page);await seed(page,'wisp');await battleReady(page);
  await expect(page.locator('#root')).toHaveAttribute('data-legend-shell-clip','true');
  const b=await page.evaluate(()=>({heading:document.querySelector('.rpg-battle-topline').getBoundingClientRect().top,hud:document.querySelector('.lws-hud').getBoundingClientRect().bottom}));expect(b.heading).toBeGreaterThanOrEqual(b.hud);
});
async function reportReady(page){
  await expect(page.locator('.v152-combat-results')).toHaveAttribute('data-legend-phaser-combat-results','true',{timeout:15000});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults);
}
async function checkBattle(page,foe){
  const s=await battleReady(page);
  expect(s.nativeCombatUiArtCount).toBe(4);
  expect(s.nativeCombatUiControlIds).toEqual(expect.arrayContaining(['strike','skill','guard','item','heavy','poultice','flee','battleSound']));
  expect(s.nativeCombatUiTextValues).toContain(foe);
  await expect(page.locator('.rpg-battlefield')).toHaveAttribute('data-arena','greyfen');
  await expect(page.locator('.rpg-arena-art')).toHaveAttribute('src',/greyfen-marsh-walkway\.webp/);
  const b=await page.evaluate(()=>({hud:document.querySelector('.lws-hud').getBoundingClientRect().bottom,dock:document.querySelector('.lws-bottom-bar').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
  expect(s.nativeCombatUiClip.y).toBeGreaterThanOrEqual(b.hud-1);expect(s.nativeCombatUiClip.y+s.nativeCombatUiClip.height).toBeLessThanOrEqual(b.dock+1);expect(b.overflow).toBe(false);
  return s;
}
const act=async(page,id,touch)=>{const n=page.locator('#'+id);await n.scrollIntoViewIfNeeded();if(touch)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}};
async function win(page,touch){
  for(let turn=0;turn<12&&await page.locator('.rpg-battle').count();turn++)await act(page,await page.locator('#skill').isEnabled()?'skill':'strike',touch);
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`Storehouse native combat preserves victory, defeat and saved reports at ${width}px`,async({page})=>{
    test.setTimeout(240000);await boot(page,width);const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const outcome of ['victory','defeat']){
      await seed(page,'storehouse',outcome);const before=await saved(page);await checkBattle(page,'Mirebound Storehouse Keeper');
      await expect(page.locator('.rpg-foe-art')).toHaveAttribute('src',/mirebound-sentinel\.webp/);
      if(outcome==='victory')await win(page,width===390);else await act(page,'guard',width===390);
      await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state',outcome==='victory'?'treasure':'failed');
      await expect(page.locator('.ash099-screen')).toHaveAttribute('data-phaser-storehouse','true',{timeout:15000});
      const after=await saved(page);expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);expect(after.futureCombat).toEqual({keep:81});expect(after.flags.greyfenStorehouseV170.futureRun).toBe('retained');
      expect(after.gold).toBe(before.gold);
      if(outcome==='victory'){
        expect(after.xp).toBe(29);expect(after.inventory.peatBrick).toBe(before.inventory.peatBrick+1);expect(after.flags.greyfenStorehouseV170).toMatchObject({active:true,inBattle:false,battleWon:true,room:3});
        await act(page,'gss170Collect',width===390);const report=await saved(page);expect(report.gold).toBe(before.gold+34);expect(report.xp).toBe(after.xp);expect(report.inventory.roadHerb).toBe(before.inventory.roadHerb+1);
      }else{expect(after.hp).toBe(1);expect(after.xp).toBe(0);expect(after.inventory).toEqual(before.inventory);expect(after.flags.greyfenStorehouseV170).toMatchObject({active:false,failed:true,inBattle:false,lastRoom:2});}
      const report=await saved(page);await act(page,'gss170Return',width===390);await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(report);
    }
    expect(errors).toEqual([]);
  });
  test(`Reed Wisp native results preserve regional victory and defeat routes at ${width}px`,async({page})=>{
    test.setTimeout(240000);await boot(page,width);
    for(const outcome of ['victory','defeat']){
      await seed(page,'wisp',outcome);const before=await saved(page);await checkBattle(page,'Reed Wisp');
      if(outcome==='victory')await win(page,width===390);else await act(page,'guard',width===390);
      const ui=await reportReady(page);expect(ui.art[0]).toMatch(/greyfen-marsh-walkway\.webp$/);expect(ui.labels.map(n=>n.sourceText)).toContain('MARSH MILE');
      const after=await saved(page);expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);expect(after.futureCombat).toEqual({keep:81});expect(after.flags.greyfenMarshExpeditionV160.futureMarsh).toBe('retained');
      if(outcome==='victory'){
        expect(after.xp).toBe(29);expect(after.inventory.wispAsh).toBe(before.inventory.wispAsh+1);expect(after.flags.greyfenMarshExpeditionV160).toMatchObject({active:true,stage:3,pressure:9,sluiceCleared:true});
        await act(page,width===390?'v152CombatReturn':'v152CombatContinue',width===390);
        await expect(page.locator('.gfm160-page')).toHaveAttribute('data-marsh-state',width===390?'report':'shelter');
        if(width===390){const report=await saved(page);expect(report.xp).toBe(after.xp+10);expect(report.gold).toBe(after.gold);expect(report.flags.greyfenMarshExpeditionV160.active).toBe(false);}else expect(await saved(page)).toEqual(after);
      }else{
        expect(after.hp).toBe(1);expect(after.xp).toBe(0);expect(after.inventory).toEqual(before.inventory);expect(after.flags.greyfenMarshExpeditionV160).toMatchObject({active:false,stage:0,pressure:29,failed:true});
        await act(page,width===390?'v152CombatSecondary':'v152CombatReturn',width===390);
        if(width===390)await expect(page.locator('.gfm160-page')).toHaveAttribute('data-marsh-state','landing');else{await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(after);}
      }
    }
  });
});
for(const [kind,width] of [['raider',390],['sentinel',1440]])test.describe(kind,()=>{
  test.use({hasTouch:width===390});
  test(`Fallen Ferry ${kind} preserves native outcomes and detour return`,async({page})=>{
    test.setTimeout(300000);await boot(page,width);
    for(const outcome of ['victory','retreat','defeat']){
      await seed(page,kind,outcome);const before=await saved(page);await checkBattle(page,kind==='raider'?'Greyfen Marsh Raider':'Mirebound Sentinel');
      if(outcome==='victory')await win(page,width===390);else await act(page,outcome==='retreat'?'flee':'guard',width===390);
      const ui=await reportReady(page);expect(ui.art[0]).toMatch(/greyfen-marsh-walkway\.webp$/);expect(ui.labels.map(n=>n.sourceText)).toContain('OPTIONAL DETOUR');
      const after=await saved(page);expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);expect(after.futureCombat).toEqual({keep:81});expect(after.inventory.roadToken).toBe(1);
      const s=after.flags.greyfenMarshExpeditionV160;expect(s).toMatchObject({active:true,stage:1,futureMarsh:'retained',ferryRaiderDefeated:outcome==='victory',ferryRaiderAvoided:outcome!=='victory',pressure:17+(outcome==='retreat'?4:outcome==='defeat'?6:0)});
      if(outcome==='victory'){expect(after.xp).toBe(kind==='raider'?38:50);expect(after.gold-before.gold).toBeGreaterThanOrEqual(kind==='raider'?5:8);expect(after.gold-before.gold).toBeLessThanOrEqual(kind==='raider'?14:17);expect(after.inventory[kind==='raider'?'tornHide':'peatBrick']).toBe(before.inventory[kind==='raider'?'tornHide':'peatBrick']+1);}
      else{expect(after.xp).toBe(before.xp);expect(after.gold).toBe(before.gold);expect(after.inventory).toEqual(before.inventory);}
      await act(page,outcome==='victory'?'v152CombatContinue':'v152CombatReturn',width===390);await expect(page.locator('.gfm160-page')).toHaveAttribute('data-marsh-state','ferry-cleared');expect(await saved(page)).toEqual(after);
    }
  });
});
test('Marsh live commands retain focus, supply costs and DOM fallback through rotation',async({page})=>{
  await boot(page);await seed(page,'wisp','controls');const before=await saved(page);
  for(const id of ['guard','item','poultice']){
    await act(page,id,false);await battleReady(page);await expect(page.locator('#'+id)).toBeFocused();
  }
  await act(page,'skill',false);await battleReady(page);await expect(page.locator('#skill')).toBeDisabled();await expect(page.locator('#strike')).toBeFocused();
  const after=await saved(page);expect(after.inventory.potion).toBe(before.inventory.potion-1);expect(after.inventory.roadPoultice).toBe(before.inventory.roadPoultice-1);
  await page.setViewportSize({width:844,height:390});await page.locator('#flee').focus();const ui=await checkBattle(page,'Reed Wisp');expect(ui.nativeCombatUiTextValues).toContain('TURN 5');
  await page.evaluate(()=>{const n=document.querySelector('.rpg-arena-art');window.__missingBattleArt={n,parent:n.parentNode};n.remove();});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatUi)).toBe(false);
  expect(await page.locator('.exp100-intent').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
  expect(await saved(page)).toEqual(after);await act(page,'flee',false);await expect(page.locator('.gfm160-page')).toHaveAttribute('data-marsh-state','sluice-crossed');
  const retreat=await saved(page);expect(retreat.inventory).toEqual(after.inventory);expect(retreat.hp).toBe(after.hp);expect(retreat.flags.greyfenMarshExpeditionV160).toMatchObject({pressure:25,encounterRetreated:true,encounterAvoided:true});expect(retreat.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);
});
