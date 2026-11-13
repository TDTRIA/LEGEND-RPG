const { test, expect } = require('@playwright/test');
test.setTimeout(90000);
const unchanged = page => page.evaluate(() => ({ player: localStorage.getItem('legend-roads-of-ashmere-v09'), settings: localStorage.getItem('legend-settings-v1'), pending: sessionStorage.getItem('legend-awakening-return-to-town-v1') }));
async function ready(page) {
  await expect.poll(() => page.evaluate(() => window.__legendPhaserWorldReady && window.LegendPhaserWorldV1?.snapshot()?.nativeTitleUi), { timeout: 20000 }).toBe(true);
}
async function begin(page) {
  await page.addInitScript(() => {
    if(!sessionStorage.getItem('titleAudioFixture')) {
      localStorage.setItem('legend-road-sound','off');
      sessionStorage.setItem('titleAudioFixture','1');
    }
  });
  await page.goto('/');
}
for(const width of [1440,390]) test.describe(`${width}px title audio`,()=>{
  test.use({viewport:{width,height:width===390?844:900},hasTouch:width===390,reducedMotion:'reduce'});
  test(`title sound supports keyboard, touch, returning saves and reload at ${width}px`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await begin(page);await ready(page);const before=await unchanged(page);
    const sound=page.getByRole('button',{name:'Game sound',exact:true});
    await expect(sound).toHaveAttribute('aria-pressed','false');await expect(sound).toContainText('Sound: Off');
    const activate=async()=>{await sound.scrollIntoViewIfNeeded();await sound.focus();if(width===390)await sound.tap();else await page.keyboard.press('Space');};
    await activate();await expect(sound).toHaveAttribute('aria-pressed','true');
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeTitleUiLabels.find(n=>n.id==='titleSound')?.title)).toBe('Sound: On');
    if(width===390)await page.locator('.portal100-brand').tap();
    await page.locator('#credits').focus();await page.mouse.move(0,0);
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeTitleUiControlBounds.find(n=>n.id==='titleSound')?.texture)).toBe('menuButtonSelected');
    expect(await page.evaluate(()=>LegendRoadAudioV100.snapshot())).toMatchObject({enabled:true,unlocked:true,musicPlaying:true,ambiencePlaying:true});
    await activate();await expect(sound).toHaveAttribute('aria-pressed','false');await expect(sound).toBeFocused();
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeTitleUiControlBounds.find(n=>n.id==='titleSound')?.focused)).toBe(true);
    if(width===390)await page.locator('.portal100-brand').tap();
    await page.locator('#credits').focus();await page.mouse.move(0,0);
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeTitleUiControlBounds.find(n=>n.id==='titleSound')?.texture)).toBe('menuButtonNormal');
    expect(await unchanged(page)).toEqual(before);
    await page.reload();await ready(page);await expect(sound).toHaveAttribute('aria-pressed','false');
    expect(await unchanged(page)).toEqual(before);
    await page.evaluate(()=>{const p=LegendStorage.normalize({username:'Audio Return',className:'Ranger',futureAudioRecord:{keep:11},flags:{introV094Complete:true}});p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];LegendStorage.savePlayer(p);LegendGameBootstrap.title();});
    await ready(page);const returning=await unchanged(page);await expect(page.locator('#continue')).toContainText('Return to Greyfen');
    await activate();expect(await unchanged(page)).toEqual(returning);
    await page.setViewportSize({width:844,height:390});await sound.scrollIntoViewIfNeeded();await ready(page);
    expect(await sound.evaluate(n=>n.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await page.evaluate(()=>{document.querySelector('#titleSound small').textContent='';LegendPhaserWorldV1.refresh();});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(false);
    await expect(sound.locator('strong')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await activate();await expect(sound).toHaveAttribute('aria-pressed','false');expect(await unchanged(page)).toEqual(returning);
    expect(errors).toEqual([]);
  });
});
test('title sound remains usable with accessibility preferences and rejected storage writes',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await begin(page);await ready(page);
  await page.evaluate(()=>{LegendStorage.saveSettings({...LegendStorage.loadSettings(),largeText:true,boldText:true,highContrast:true,readableFont:true,spacious:true,reducedMotion:true});LegendGameBootstrap.title();});
  await ready(page);const before=await unchanged(page);
  await page.evaluate(()=>{window.__audioWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='legend-road-sound')throw new DOMException('Synthetic denial','QuotaExceededError');return __audioWrite.call(this,key,value);};});
  const sound=page.getByRole('button',{name:'Game sound',exact:true});await sound.focus();await page.keyboard.press('Enter');await ready(page);await expect(sound).toHaveAttribute('aria-pressed','true');await expect(sound).toContainText('Sound: On');
  await page.keyboard.press('Enter');await ready(page);await expect(sound).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(()=>LegendRoadAudioV100.snapshot())).toMatchObject({enabled:false,musicPlaying:false,ambiencePlaying:false});
  expect(await unchanged(page)).toEqual(before);expect(await page.evaluate(()=>localStorage.getItem('legend-road-sound'))).toBe('off');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
test('title DOM sound fallback works without Phaser and unavailable audio is explicit',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/js/engine/phaser-world-v1.js*',route=>route.abort());
  await begin(page);const sound=page.getByRole('button',{name:'Game sound',exact:true});
  await expect(sound).toBeVisible();await sound.click();await expect(sound).toHaveAttribute('aria-pressed','true');await expect(sound).toContainText('Sound: On');
  expect(await page.evaluate(()=>localStorage.getItem('legend-road-sound'))).toBe('on');
  await page.route('**/js/systems/road/road-audio-v100.js*',route=>route.abort());await page.reload();
  await expect(sound).toBeDisabled();await expect(sound).toContainText('Sound unavailable');
  await expect(page.locator('#newPrimary')).toBeEnabled();
});
