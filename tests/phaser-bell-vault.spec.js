const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const saved=page=>page.evaluate(()=>LegendStorage.loadPlayer());
async function native(page,state){
  await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeBellVault;return{active:s.active,failure:s.failure,state:s.state};}),{timeout:15000}).toEqual({active:true,failure:'',state});
  return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeBellVault);
}
async function open(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
  await page.evaluate(width=>{
    LegendStorage.savePlayer(LegendStorage.normalize({username:'Cellar Native QA',className:'Ranger',currentRegion:'Ashmere',
      level:width===390?4:1,xp:0,hp:35,maxHp:40,gold:17,weapon:'hand',armor:'none',inventory:{food:2},
      futureCellar:{keep:72},flags:{introV094Complete:true,firstRoadReturnSeen:true,futureEvidence:'kept'}}));
    LegendAshmereV099.route('dungeon');
  },width);await native(page,'entry');
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`cellar rooms preserve choices, exact rewards, focus and fallback at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,width);
    const use=async id=>{const node=page.locator('#'+id);await node.scrollIntoViewIfNeeded();if(width===390)await node.tap();else{await node.focus();await page.keyboard.press('Enter');}};
    const initial=await saved(page);
    await expect(page.locator('.bell-vault-banner h1')).toBeFocused();
    expect(await page.locator('.ash099-screen').evaluate(n=>getComputedStyle(n).backgroundImage)).toBe('none');
    expect(await page.locator('#ashBack').evaluate(n=>getComputedStyle(n).backgroundImage)).toBe('none');
    await use('vaultBegin');await native(page,'steps');await use('vaultDescend');await native(page,'gate');
    await expect(page.locator('.bell-vault-banner h1')).toBeFocused();
    expect(await page.locator('#root').evaluate(n=>n.scrollTop)).toBe(0);
    await use(width===390?'vaultReadGlyphs':'vaultForceGate');await native(page,'reliquary');
    let player=await saved(page);
    expect(player.flags.bellVaultV100).toMatchObject({room:2,gatePassed:true,gateApproach:width===390?'read':'force',enemyWeakened:width===390});
    expect(player.hp).toBe(initial.hp-(width===390?0:5));
    await use(width===390?'vaultCopyRunes':'vaultTakeFragment');
    let state=await native(page,'keeper');expect(state.art).toHaveLength(3);
    player=await saved(page);expect(player.flags.bellVaultV100.tookFragment).toBe(width!==390);
    const prior=JSON.stringify(player);
    // Required actions/art/copy loss and future unknown copy restore the full DOM.
    for(const selector of ['#vaultFight','.bell-vault-scene','.bell-vault-footer > div > strong']){
      await page.evaluate(selector=>{const n=document.querySelector(selector);window.__cellarMissing={n,parent:n.parentNode,next:n.nextSibling};n.remove();},selector);
      await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeBellVault.active)).toBe(false);
      expect(await page.locator('.bell-vault-banner h1').evaluate(n=>getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
      await page.evaluate(()=>{const{n,parent,next}=window.__cellarMissing;parent.insertBefore(n,next);});await native(page,'keeper');
    }
    await page.evaluate(()=>{const n=document.createElement('aside');n.id='cellar-future';n.textContent='Future dungeon evidence';document.querySelector('.bell-vault-body').append(n);});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeBellVault.active)).toBe(false);
    await page.evaluate(()=>document.getElementById('cellar-future').remove());await native(page,'keeper');
    await page.setViewportSize({width:844,height:390});await page.locator('#vaultFight').focus();state=await native(page,'keeper');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    for(const label of state.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+4);}
    await page.setViewportSize({width,height:width===390?844:900});await native(page,'keeper');
    expect(JSON.stringify(await saved(page))).toBe(prior);
    await use('vaultRetreat');await expect(page.locator('.ash100-town')).toBeVisible();
    expect((await saved(page)).flags.bellVaultV100).toMatchObject({active:false,retreats:1,inBattle:false,lastRoom:2});
    // Exercise real reward callbacks from an isolated, won-room fixture.
    await page.evaluate(()=>{const p=LegendStorage.loadPlayer();p.flags.bellVaultV100={...p.flags.bellVaultV100,active:true,room:3,battleWon:true,clears:0,rewardClaimed:false};LegendStorage.savePlayer(p);LegendAshmereV099.route('dungeon');});
    await native(page,'treasure');const before=await saved(page);
    await page.evaluate(()=>window.__oldCollect=document.getElementById('vaultCollect'));
    await use('vaultCollect');await native(page,'complete');await page.evaluate(()=>window.__oldCollect.click());
    const reward=await saved(page);expect(reward.gold).toBe(before.gold+35+before.level*7+(before.flags.bellVaultV100.tookFragment?20:0));
    expect(reward.xp).toBe(before.xp+25+before.level*5);expect(reward.inventory.reinforcedBuckle).toBe(1);
    expect(reward.flags.bellVaultV100).toMatchObject({clears:1,completed:true,rewardClaimed:true,reinforcedBuckleEquipped:true,active:false});
    expect(reward.futureCellar).toEqual({keep:72});expect(reward.flags.futureEvidence).toBe('kept');
    await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('.v120-title')).toBeVisible();
    await page.evaluate(()=>LegendAshmereV099.route('dungeon'));await native(page,'complete');expect(await saved(page)).toEqual(reward);
    await use('vaultRetry');await native(page,'steps');expect((await saved(page)).flags.bellVaultV100.reinforcedBuckleEquipped).toBe(true);
    await use('ashBack');await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeBellVault.active)).toBe(false);
    expect(errors).toEqual([]);
  });
});
test('locked, failed and repeated cellar rewards retain their production state',async({page})=>{
  await open(page,390);
  for(const state of ['locked','failed']){
    await page.evaluate(state=>{const p=LegendStorage.loadPlayer();p.flags.firstRoadReturnSeen=state!=='locked';p.flags.bellVaultV100={active:false,failed:state==='failed',clears:1,attempts:2};LegendStorage.savePlayer(p);LegendAshmereV099.route('dungeon');},state);
    const prior=await saved(page);const ui=await native(page,state);expect(ui.controls).toEqual(state==='locked'?['vaultReturn','ashBack']:['vaultRetry','vaultReturn','ashBack']);
    await page.locator('#vaultReturn').click();await expect(page.locator('.ash100-town')).toBeVisible();expect(await saved(page)).toEqual(prior);
  }
  await page.evaluate(()=>{const p=LegendStorage.loadPlayer();p.flags.bellVaultV100={active:true,room:3,battleWon:true,clears:1,rewardClaimed:false,tookFragment:false};LegendStorage.savePlayer(p);LegendAshmereV099.route('dungeon');});
  const before=await saved(page);await native(page,'treasure');await page.locator('#vaultCollect').click();await native(page,'complete');
  const after=await saved(page);expect(after.gold).toBe(before.gold+35+before.level*7);expect(after.xp).toBe(before.xp+25+before.level*5);
  expect(after.inventory.roadHerb).toBe(Number(before.inventory.roadHerb||0)+1);expect(after.inventory.reinforcedBuckle||0).toBe(before.inventory.reinforcedBuckle||0);
  expect(after.flags.bellVaultV100.clears).toBe(2);
});

test('cellar treasure growth refreshes health without settling rewards again',async({page})=>{
  await open(page,390);
  await page.evaluate(()=>{const p=LegendStorage.loadPlayer();p.level=1;p.xp=99;p.hp=30;p.maxHp=40;
    p.flags.bellVaultV100={active:true,room:3,battleWon:true,clears:0,rewardClaimed:false,tookFragment:false};
    LegendStorage.savePlayer(p);LegendAshmereV099.route('dungeon');});
  const before=await saved(page);await page.locator('#vaultCollect').click();
  await expect(page.getByRole('dialog',{name:'Level 2'})).toBeVisible();
  await page.locator('[data-attr-add="endurance"]').click();await page.locator('[data-attr-add="endurance"]').click();
  await page.locator('#v152-growth-confirm').click();await native(page,'complete');
  await expect(page.locator('.bell-vault-banner h1')).toBeFocused();
  await expect(page.locator('.bell-vault-footer > div').nth(1)).toContainText('44 / 54');
  const after=await saved(page);expect(after.hp).toBe(44);expect(after.maxHp).toBe(54);expect(after.level).toBe(2);expect(after.xp).toBe(29);
  expect(after.gold).toBe(before.gold+42);expect(after.inventory.reinforcedBuckle).toBe(1);expect(after.flags.bellVaultV100.clears).toBe(1);
  expect(after.futureCellar).toEqual({keep:72});await page.locator('#ashBack').click();await expect(page.locator('.ash100-town')).toBeVisible();
  expect(await saved(page)).toEqual(after);
});
