const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
test.use({hasTouch:true});
const save=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function battleReady(page){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot();return{active:s.nativeCombatUi,failure:s.nativeCombatUiFailure};}),{timeout:15000}).toEqual({active:true,failure:''});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot());
}
async function resultsReady(page){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeCombatResults;return{active:s.active,failure:s.failure};}),{timeout:15000}).toEqual({active:true,failure:''});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults);
}
async function seed(page,outcome){
  await page.evaluate(outcome=>{
    const player=LegendStorage.normalize({username:'Cellar Combat QA',className:'Ranger',currentRegion:'Ashmere',level:3,xp:0,
      hp:outcome==='defeat'?1:25,maxHp:100,gold:17,weapon:'hand',armor:'none',inventory:{potion:2,roadPoultice:2,roadToken:1},futureCellarCombat:{keep:81},
      flags:{introV094Complete:true,firstRoadReturnSeen:true,futureClue:'kept',
        roadExpeditionV100:{stage:2,pressure:47,trips:3,routeChoice:'ridge',poiUsed:{},searchUsed:{},readUsed:{}},
        bellVaultV100:{active:true,room:2,inBattle:true,battleWon:false,failed:false,tookChoice:true,tookFragment:false,clears:0,attempts:1,records:[],futureRun:'retained'}}});
    LegendRoadStateV100.create({getData:()=>LEGEND_DATA,clamp:(n,a,b)=>Math.max(a,Math.min(b,n))}).ensure(player);
    LegendStorage.savePlayer(player);
    LegendRoadControllerV100.startDungeonEncounter({id:'cellar-native-sentinel',name:'Mirebound Sentinel',behavior:'flicker',
      hp:outcome==='victory'?1:999,maxHp:outcome==='victory'?1:999,damage:outcome==='defeat'?[100,100]:[3,3],
      reward:'roadHerb',goldDrop:[2,2],locationLabel:'THE BELL CELLAR'},'The keeper rises from its cradle. Read its intent.');
  },outcome);await battleReady(page);
}
async function boot(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`cellar native battle and results preserve outcomes and all return paths at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));await boot(page,width);
    const use=async id=>{const n=page.locator('#'+id);await n.scrollIntoViewIfNeeded();if(width===390)await n.tap();else{await n.focus();await page.keyboard.press('Enter');}};
    for(const outcome of ['victory','defeat']){
      await seed(page,outcome);const before=await save(page),battle=await battleReady(page);
      expect(battle.nativeCombatUiArtCount).toBe(4);
      expect(battle.nativeCombatUiControlIds).toEqual(expect.arrayContaining(['strike','skill','guard','item','heavy','poultice','flee','battleSound']));
      expect(battle.nativeCombatUiTextValues).toEqual(expect.arrayContaining(['THE BELL CELLAR','Mirebound Sentinel','HEAVY WIND-UP','TURN 1']));
      await expect(page.locator('.rpg-battlefield')).toHaveAttribute('data-arena','cellar');
      await expect(page.locator('.rpg-arena-art')).toHaveAttribute('src',/bell-cellar-undercroft\.webp/);
      await use(outcome==='victory'?'strike':'guard');let report=await resultsReady(page);
      await expect(page.locator('.v152-results-heading h1')).toBeFocused();
      expect(report.art[0]).toMatch(/bell-cellar-undercroft\.webp$/);
      expect(report.labels.map(n=>n.text)).toEqual(expect.arrayContaining([outcome==='victory'?'ENCOUNTER RESOLVED · THE BELL CELLAR':'ENCOUNTER INTERRUPTED · THE BELL CELLAR','CELLAR DEPTH',outcome==='victory'?'4 / 4':'3 / 4']));
      const after=await save(page);expect(after.futureCellarCombat).toEqual({keep:81});expect(after.flags.futureClue).toBe('kept');expect(after.flags.bellVaultV100.futureRun).toBe('retained');
      expect(after.flags.roadExpeditionV100).toEqual(before.flags.roadExpeditionV100);
      if(outcome==='victory'){
        expect(after.gold).toBe(before.gold+2);expect(after.xp).toBe(29);expect(after.level).toBe(3);expect(after.hp).toBe(before.hp);
        expect(after.inventory.roadHerb).toBe(Number(before.inventory.roadHerb||0)+1);expect(after.inventory.roadToken).toBe(1);
        expect(after.flags.bellVaultV100).toMatchObject({active:true,inBattle:false,battleWon:true,room:3});
        expect(after.stats.dungeonVictories).toBe(1);expect(after.stats.bellVaultVictories).toBe(1);
      }else{
        expect(after.gold).toBe(before.gold);expect(after.xp).toBe(before.xp);expect(after.inventory).toEqual(before.inventory);expect(after.hp).toBe(1);
        expect(after.flags.bellVaultV100).toMatchObject({active:false,inBattle:false,battleWon:false,failed:true,lastRoom:2});expect(after.stats.bellVaultWithdrawals).toBe(1);
      }
      await page.locator('#v152CombatReturn').focus();await page.locator('#v152CombatReturn').scrollIntoViewIfNeeded();report=await resultsReady(page);
      const bounds=await page.evaluate(()=>({hud:document.querySelector('.lws-hud').getBoundingClientRect().bottom,dock:document.querySelector('.lws-bottom-bar').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
      expect(report.clip.y).toBeGreaterThanOrEqual(bounds.hud-1);expect(report.clip.y+report.clip.height).toBeLessThanOrEqual(bounds.dock+1);expect(bounds.overflow).toBe(false);
      for(const label of report.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
      // A missing regional backdrop restores DOM without settling or dropping saved rewards.
      await page.evaluate(()=>{const n=document.querySelector('.v152-results-backdrop img');window.__cellarResultArt={n,parent:n.parentNode};n.remove();});
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCombatResults.active)).toBe(false);
      expect(await page.locator('.v152-results-heading h1').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
      await page.evaluate(()=>{const{n,parent}=window.__cellarResultArt;parent.prepend(n);});await resultsReady(page);expect(await save(page)).toEqual(after);
      const destination=width===390?'v152CombatReturn':outcome==='victory'?'v152CombatContinue':'v152CombatSecondary';
      await use(destination);
      if(width===390)await expect(page.locator('.ash100-town')).toBeVisible();
      else{
        await expect(page.locator('.bell-vault-v100')).toHaveAttribute('data-vault-state',outcome==='victory'?'treasure':'failed');
        await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeBellVault.active)).toBe(true);
        await use('ashBack');await expect(page.locator('.ash100-town')).toBeVisible();
      }
      // The production direct-return facade also records the current town.
      expect(await save(page)).toEqual(width===390?{...after,town:'Ashmere'}:after);
    }
    expect(errors).toEqual([]);
  });
});
test('cellar touch commands retain intent, supplies and safe retreat through rotation',async({page})=>{
  await boot(page,390);await seed(page,'retreat');const before=await save(page);
  for(const id of ['guard','item','skill','poultice','heavy']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id).tap();await battleReady(page);
  }
  await expect(page.locator('.rpg-battle-log')).toContainText('Heavy Strike');
  const combat=await save(page);expect(combat.inventory.potion).toBe(1);expect(combat.inventory.roadPoultice).toBe(1);
  await page.setViewportSize({width:844,height:390});await page.locator('#flee').focus();const s=await battleReady(page);
  expect(s.nativeCombatUiTextValues).toContain('TURN 6');expect(s.nativeCombatUiFocusedControlIds).toContain('flee');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.locator('#flee').tap();await expect(page.locator('.ash100-town')).toBeVisible();const after=await save(page);
  expect(after.hp).toBe(combat.hp);expect(after.gold).toBe(before.gold);expect(after.xp).toBe(before.xp);expect(after.inventory).toEqual(combat.inventory);
  expect(after.flags.roadExpeditionV100).toEqual(combat.flags.roadExpeditionV100);
  expect(after.flags.bellVaultV100).toMatchObject({active:false,inBattle:false,failed:false,retreats:1,lastRoom:2,futureRun:'retained'});
  expect(after.stats.dungeonRetreats).toBe(1);expect(after.futureCellarCombat).toEqual({keep:81});
});
