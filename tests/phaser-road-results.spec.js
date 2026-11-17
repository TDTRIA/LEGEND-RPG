const { test, expect } = require('@playwright/test');

test.setTimeout(120000);
async function open(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Expose the actual controller-created service for its early-return branch;
  // no settlement or rendering behavior is replaced.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'LegendRoadResultsV100', { configurable: true,
      set(api) { Object.defineProperty(window, 'LegendRoadResultsV100', { configurable: true, value: {
        ...api, create(context) { const service = api.create(context); window.__resultService = service; return service; }
      } }); }
    });
  });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
}
async function seed(page, stage = 5, xp = 0) {
  return page.evaluate(({ stage, xp }) => {
    const player = LegendStorage.normalize({ username: 'ResultQA', currentRegion: 'Ashmere', level: 1, xp,
      hp: 32, maxHp: 40, gold: 10, inventory: { food: 2, roadToken: 0 }, futureRecord: { keep: 17 },
      flags: { introV094Complete: true, customResultFlag: 'keep',
        roadExpeditionV100: { stage, trips: 1, pressure: 30, routeChoice: 'ridge', poiUsed: { 'ridge-cairn': true } },
        roadFieldJournalV150: { visitedPlaces: ['South Fork', 'High Ridge'],
          routes: [{ trip: 1, routeName: 'High Ridge', note: 'The dry route was recorded.' }],
          discoveries: [{ trip: 1, key: 'ridge-cairn', name: 'Ridgeway Cairn', place: 'High Ridge' }],
          campReports: [{ trip: 1, place: 'Wayfarer’s Camp', kind: 'craft', note: 'One healing potion was added to your pack.' }]
        }
      }
    });
    LegendStorage.savePlayer(player); LegendRoadControllerV100.renderExpedition();
    return LegendStorage.loadPlayer();
  }, { stage, xp });
}
async function native(page) {
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadResults), { timeout: 15000 })
    .toMatchObject({ active: true, failure: '' });
  return page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadResults);
}
for (const width of [1440, 390]) test.describe(`${width}px`, () => {
  test.use({ hasTouch: width === 390 });
  test(`settled road report preserves rewards, return and fallback at ${width}px`, async ({ page }) => {
  await open(page, width);
  const before = await seed(page);
  await page.locator('#finish').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const random = Math.random; Math.random = () => 0.1;
    window.__legendSceneTransitionBypass = true;
    try { document.querySelector('#finish').click(); }
    finally { Math.random = random; window.__legendSceneTransitionBypass = false; }
  });
  await native(page);
  await expect(page.locator('.exp100-hotspot')).toHaveCount(0);
  await expect(page.locator('.exp100-head h1')).toBeFocused();
  expect(await page.locator('#root').evaluate(n => n.scrollTop)).toBe(0);
  const after = await page.evaluate(() => LegendStorage.loadPlayer());
  expect(after.gold).toBe(before.gold + 86);
  expect(after.xp).toBe(before.xp + 33);
  expect(after.inventory.roadToken).toBe(before.inventory.roadToken + 1);
  expect(after.flags.roadExpeditionV100).toMatchObject({ stage: 0, pressure: 10 });
  expect(after.flags.firstRoadReturnSeen).toBe(true);
  expect(after.futureRecord).toEqual({ keep: 17 });
  expect(after.flags.customResultFlag).toBe('keep');
  const raw = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
  const sound=page.locator('#exp100-sound'), previousSound=await sound.textContent();
  await sound.scrollIntoViewIfNeeded();
  if(width===390) await sound.tap(); else {await sound.focus();await page.keyboard.press('Enter');}
  await expect(sound).not.toHaveText(previousSound);
  await expect.poll(async () => (await native(page)).labels.some(label => label.text.startsWith('Sound: ') && label.text!==previousSound)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(raw);
  await page.locator('.v152-expedition-reward-line').scrollIntoViewIfNeeded();
  let state = await native(page);
  for (const text of ['+86g', '+33 XP', '+1 Road Token', 'Ridgeway Cairn', 'One healing potion was added to your pack.']) {
    expect(state.labels.map(l => l.text)).toContain(text);
  }
  expect(state.art).toContain('assets/generated/items/road-token.webp');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('#outcomeReturn').scrollIntoViewIfNeeded();
  await page.locator('#outcomeReturn').focus();
  await expect.poll(async () => (await native(page)).focused).toBe('outcomeReturn');
  const hit = await page.locator('#outcomeReturn').evaluate(n => {
    const b=n.getBoundingClientRect(),h=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return n===h||n.contains(h);
  });
  expect(hit).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(raw);
  // All original copy/art returns if a native label cannot be painted.
  await page.evaluate(() => { const s=LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__labelFactory=s.createShellLabel;s.createShellLabel=()=>null; document.querySelector('#outcomeReportToMara').focus();s.roadResults.sync(); });
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadResults.active)).toBe(false);
  await expect(page.locator('.exp100-head h1')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await expect(page.locator('.v152-expedition-reward-art')).not.toHaveCSS('opacity','0');
  await page.evaluate(() => { const s=LegendPhaserWorldV1.engine.scene.getScene('RealmScene');s.createShellLabel=window.__labelFactory;s.roadResults.sync(); });
  await native(page);
  if(width===390){await page.setViewportSize({width:844,height:390});await native(page);await page.setViewportSize({width:390,height:844});await native(page);}
  await page.locator('#outcomeReportToMara').scrollIntoViewIfNeeded();
  if(width===390) await page.locator('#outcomeReportToMara').tap();
  else {await page.locator('#outcomeReportToMara').focus();await page.keyboard.press('Enter');}
  await expect(page.locator('.ash099-lines')).toContainText(/Ridgeway Cairn marks a dry line/i);
  const reported = await page.evaluate(() => LegendStorage.loadPlayer());
  expect(reported.flags.firstRoadReturnMaraBriefed).toBe(true);
  expect(reported.gold).toBe(after.gold); expect(reported.xp).toBe(after.xp); expect(reported.inventory.roadToken).toBe(after.inventory.roadToken);
});
});

test('early report and level-up retain exact settlement and empty-report fallback', async ({ page }) => {
  await open(page, 390);
  const before=await seed(page,2,90);
  await page.evaluate(() => { const p=LegendStorage.loadPlayer();p.flags.roadFieldJournalV150={visitedPlaces:[],routes:[],discoveries:[],campReports:[]};LegendStorage.savePlayer(p);window.__resultService.finish(); });
  await native(page);
  await expect(page.locator('.exp100-head h1')).toHaveText('Field Report Secured');
  await expect(page.locator('#outcomeReportToMara')).toHaveCount(0);
  await expect(page.locator('#legendLevelUpOverlay')).toBeVisible();
  await expect(page.locator('.exp100-head h1')).not.toBeFocused();
  await page.locator('[data-attr-add="endurance"]').click();
  await page.locator('[data-attr-add="endurance"]').click();
  await page.locator('#v152-growth-confirm').click();
  await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
  const after=await page.evaluate(()=>LegendStorage.loadPlayer());
  expect(after.attributesV152.endurance).toBe(2);expect(after.pendingStatPointsV152).toBe(0);
  expect(after.gold).toBe(before.gold+50);expect(after.level).toBe(2);expect(after.xp).toBe(8);
  expect(after.inventory.roadToken).toBe(0);expect(after.maxHp).toBe(54);expect(after.hp).toBe(46);
  const state=await native(page);
  await expect(page.locator('.exp100-bars > div').filter({hasText:'Health'})).toContainText('46/54');
  expect(state.labels.map(l=>l.text)).toContain('46/54');
  expect(state.labels.some(l=>l.text.includes('Your attribute choices are recorded.'))).toBe(true);
  for(const text of ['No token recovered','No landmark recorded','No camp report','+18 XP'])expect(state.labels.map(l=>l.text)).toContain(text);
  // Failed artwork must keep the complete report in its DOM form.
  await page.evaluate(()=>{const img=document.querySelector('.v152-expedition-reward-art');window.__resultArt=img.src;img.src='data:image/png;base64,broken';});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeRoadResults.active)).toBe(false);
  await page.evaluate(()=>{document.querySelector('.v152-expedition-reward-art').src=window.__resultArt;});
  await native(page);
  await page.locator('#outcomeReturn').click();
  await expect(page.locator('.ash100-town')).toBeVisible();
  const returned=await page.evaluate(()=>LegendStorage.loadPlayer());
  expect(returned.gold).toBe(after.gold);expect(returned.xp).toBe(after.xp);expect(returned.futureRecord).toEqual({keep:17});
});


test('non-settlement outcome keeps its report, real return and complete DOM fallback', async ({ page }) => {
  await open(page, 1440);
  await seed(page, 3);
  const raw = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
  await page.evaluate(() => window.__resultService.outcome('Driven Back', 'The expedition is cut short.', 'Defeat'));
  await native(page);
  await expect(page.locator('.v152-expedition-summary')).toHaveCount(0);
  await expect(page.locator('.exp100-hotspot')).toHaveCount(0);
  await expect(page.locator('#outcomeReportToMara')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(raw);
  await page.evaluate(() => { const p=document.createElement('p');p.id='futureResultField';p.textContent='Additional recorded result';document.querySelector('.exp100-outcome').append(p); });
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadResults.active)).toBe(false);
  await expect(page.locator('.exp100-head h1')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await page.evaluate(() => document.querySelector('#futureResultField').remove());
  await native(page);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => { const bar=document.querySelector('.exp100-bars i');window.__resultMeter=bar.innerHTML;bar.replaceChildren(); });
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadResults.active)).toBe(false);
  await expect(page.locator('.exp100-head h1')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  expect(errors).toEqual([]);
  await page.evaluate(() => {document.querySelector('.exp100-bars i').innerHTML=window.__resultMeter;});
  await native(page);
  await page.locator('#outcomeReturn').click();
  await expect(page.locator('.ash100-town')).toBeVisible();
  const after=await page.evaluate(()=>LegendStorage.loadPlayer());
  expect(after.gold).toBe(10);expect(after.xp).toBe(0);expect(after.inventory.roadToken).toBe(0);
});
