const {test,expect}=require('@playwright/test');
test.setTimeout(90000);
async function boot(page,width){
  await page.setViewportSize({width,height:width===390?844:900});
  await page.goto('/');await page.waitForFunction(()=>window.__legendPhaserWorldReady);await expect(page.locator('#legend-boot-screen')).toBeHidden();
  await page.evaluate(()=>{const p=LegendStorage.normalize({username:'Credits QA',futureCredits:{keep:17},flags:{introV094Complete:true,firstRoadReturnSeen:true}});LegendStorage.savePlayer(p);});
}
const raw=page=>page.evaluate(()=>({player:localStorage.getItem('legend-roads-of-ashmere-v09'),settings:localStorage.getItem('legend-settings-v1'),audio:localStorage.getItem('legend-road-sound'),pending:sessionStorage.getItem('legend-awakening-return-to-town-v1')}));
async function native(page){await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeCredits;return{active:s.active,failure:s.failure};}),{timeout:12000}).toEqual({active:true,failure:''});await expect(page.locator('[data-credits-close]')).toHaveCSS('background-image','none');await expect(page.locator('[data-credits-close]')).toHaveCSS('color','rgba(0, 0, 0, 0)');return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCredits);}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`Credits retain complete copy, modal keyboard focus and real return at ${width}px`,async({page})=>{
    await boot(page,width);const before=await raw(page);const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const opener=page.locator('#credits');if(width===390)await opener.tap();else{await opener.focus();await page.keyboard.press('Enter');}
    const dialog=page.getByRole('dialog',{name:'LEGEND',exact:true});await expect(dialog).toBeVisible();let ui=await native(page);
    await expect(page.locator('[data-credits-close]')).toBeFocused();expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(true);
    await expect(page.locator('.legend-credits-overlay')).toHaveCSS('backdrop-filter','none');await expect(dialog).toHaveCSS('background-image','none');
    expect(ui.labels.map(n=>n.sourceText)).toEqual(await dialog.locator('.legend-credits-kicker,h2,h3,p:not(:has(.legend-credits-line)),.legend-credits-line,button').allTextContents().then(a=>a.map(s=>s.replace(/\s+/g,' ').trim())));
    expect(ui.labels).toHaveLength(10);expect(ui.labels.map(n=>n.text)).toEqual(expect.arrayContaining(['First light: Ashmere','Beyond the lanterns: Greyfen and the wider realm','Return to the Title']));
    const close=page.locator('[data-credits-close]');await page.keyboard.press('Tab');await expect(close).toBeFocused();await page.keyboard.press('Tab');await expect(close).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(close).toBeFocused();expect((await native(page)).focused).toBe(true);
    await page.setViewportSize({width:844,height:390});ui=await native(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await close.scrollIntoViewIfNeeded();await native(page);await expect(close).toBeInViewport();
    if(width===390)await close.tap();else await page.keyboard.press('Enter');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);
    await opener.click();await native(page);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();expect(await raw(page)).toEqual(before);expect(errors).toEqual([]);
  });
});
test('Credits preserve fallback, repeated opening and outside return with accessibility preferences',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await boot(page,390);
  await page.evaluate(()=>LegendStorage.saveSettings({...LegendStorage.loadSettings(),largeText:true,boldText:true,highContrast:true,spacious:true,readableFont:true,reducedMotion:true}));const before=await raw(page);
  await page.locator('#credits').click();await native(page);
  await page.evaluate(()=>LegendTitleScreenV120.openCredits());await expect(page.locator('.legend-credits-overlay')).toHaveCount(1);await expect(page.locator('[data-credits-close]')).toBeFocused();
  await page.evaluate(()=>{const n=document.createElement('p');n.id='future-credit';n.textContent='Future credit';document.querySelector('.legend-credits-panel').append(n);});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCredits.active)).toBe(false);await expect(page.locator('#future-credit')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await page.keyboard.press('Tab');await expect(page.locator('[data-credits-close]')).toBeFocused();
  await page.evaluate(()=>document.getElementById('future-credit').remove());await native(page);
  await page.evaluate(()=>{const h=document.getElementById('legendCreditsTitle');window.__creditsHeading=h.textContent;h.textContent='';});await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeCredits.active)).toBe(false);
  await page.evaluate(()=>document.getElementById('legendCreditsTitle').textContent=__creditsHeading);await native(page);
  await page.locator('.legend-credits-overlay').click({position:{x:2,y:2}});await expect(page.locator('.legend-credits-overlay')).toHaveCount(0);await expect(page.locator('#credits')).toBeFocused();expect(await raw(page)).toEqual(before);expect(await page.locator('#root').evaluate(n=>n.inert)).toBe(false);
});
