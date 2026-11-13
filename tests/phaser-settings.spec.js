const {test,expect}=require('@playwright/test');
test.setTimeout(180000);
const pageKeys=['largeText','boldText','highContrast','reducedMotion','spacious','readableFont'];
async function boot(page,width){
  await page.setViewportSize({width,height:width===390?844:900});await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{if(!localStorage.getItem('legend-settings-v1'))localStorage.setItem('legend-settings-v1',JSON.stringify({largeText:false,boldText:false,highContrast:false,reducedMotion:false,spacious:false,readableFont:false,simpleAscii:true,futurePreference:{keep:23}}));});
  await page.goto('/');await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  await page.evaluate(()=>{const p=LegendStorage.normalize({username:'Settings QA',className:'Ranger',hp:60,maxHp:100,gold:20,inventory:{roadToken:1},futureSettingPlayer:{keep:54},flags:{introV094Complete:true,firstRoadReturnSeen:true}});p.currentRegion=p.town='Greyfen';p.discoveredRegions=p.unlockedRegions=['Ashmere','Greyfen'];LegendStorage.savePlayer(p);});
}
const raw=page=>page.evaluate(()=>({player:localStorage.getItem('legend-roads-of-ashmere-v09'),audio:localStorage.getItem('legend-road-sound'),pending:sessionStorage.getItem('legend-awakening-return-to-town-v1')}));
async function native(page,kind){await expect.poll(()=>page.evaluate(()=>{const s=LegendPhaserWorldV1.snapshot().nativeSettings;return{active:s.active,kind:s.kind,failure:s.failure};}),{timeout:15000}).toEqual({active:true,kind,failure:''});await expect(page.locator('[data-phaser-settings="true"] button').first()).toHaveCSS('background-image','none');return page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings);}
async function toggle(page,key,width,modal=false){
  const input=page.locator(`[${modal?'data-world-setting':'data-setting'}="${key}"]`);await input.locator('..').scrollIntoViewIfNeeded();
  if(width===390)await input.locator('..').tap();else{await input.focus();await page.keyboard.press('Space');}
}
for(const width of [1440,390])test.describe(`${width}px`,()=>{
  test.use({hasTouch:width===390});
  test(`title settings retain explicit saving, complete copy and preference reload at ${width}px`,async({page})=>{
    await boot(page,width);const before=await raw(page);const initial=await page.evaluate(()=>LegendStorage.loadSettings());
    await page.locator('#settings').click();let ui=await native(page,'page');expect(ui.states.map(n=>n.key)).toEqual(pageKeys);
    await expect(page.locator('.settings09x-hero h1')).toBeFocused();
    for(const key of pageKeys){await toggle(page,key,width);ui=await native(page,'page');expect(ui.states.find(n=>n.key===key).checked).toBe(true);}
    expect(await page.evaluate(()=>LegendStorage.loadSettings())).toEqual(initial);expect(await raw(page)).toEqual(before);
    await page.locator('#saveSettings').click();await native(page,'page');await expect(page.locator('#saveSettings')).toBeFocused();await expect(page.locator('.settings09x-status')).toHaveText('Settings saved for this device.');
    expect((await native(page,'page')).labelColors.every(color=>color==='#ffffff')).toBe(true);
    expect(await page.evaluate(()=>LegendStorage.loadSettings())).toEqual({...initial,...Object.fromEntries(pageKeys.map(k=>[k,true]))});expect(await raw(page)).toEqual(before);
    await page.setViewportSize({width:844,height:390});await page.locator('#backTitle').focus();ui=await native(page,'page');
    for(const label of ui.labels){expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width+1);expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height+5);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    await page.locator('#backTitle').click();await expect(page.locator('.v120-title')).toBeVisible();await page.reload();await page.waitForFunction(()=>window.__legendPhaserWorldReady);await page.locator('#settings').click();await native(page,'page');
    for(const key of pageKeys)await expect(page.locator(`[data-setting="${key}"]`)).toBeChecked();
    await toggle(page,'largeText',1440);await page.keyboard.press('Escape');await expect(page.locator('.v120-title')).toBeVisible();expect(await page.evaluate(()=>LegendStorage.loadSettings().largeText)).toBe(true);expect(await raw(page)).toEqual(before);
  });
  test(`in-game settings save immediately and preserve focus, fallback and failure feedback at ${width}px`,async({page})=>{
    await boot(page,width);await page.evaluate(()=>LegendAshmereV099.renderAshmere());const before=await raw(page);
    const opener=page.locator('.lws-bottom-bar [data-world-action="settings"]');await opener.click();await native(page,'modal');
    const dialog=page.getByRole('dialog',{name:'Settings'});await expect(dialog.locator('.lws-close-btn')).toBeFocused();
    await toggle(page,'largeText',width,true);await native(page,'modal');expect(await page.evaluate(()=>LegendStorage.loadSettings().largeText)).toBe(true);
    await expect(dialog.locator('[data-world-setting="largeText"]')).toBeFocused();
    for(const key of ['boldText','highContrast','reducedMotion','spacious','readableFont']){await toggle(page,key,width,true);await native(page,'modal');}
    await toggle(page,'simpleAscii',width,true);const contrastUi=await native(page,'modal');expect(contrastUi.labelColors.every(color=>color==='#ffffff')).toBe(true);for(const state of contrastUi.states){expect(state.rect.width).toBe(22);expect(state.rect.height).toBe(22);}expect(await page.evaluate(()=>LegendStorage.loadSettings().simpleAscii)).toBe(false);
    expect(await page.evaluate(()=>LegendStorage.loadSettings().futurePreference)).toEqual({keep:23});expect(await raw(page)).toEqual(before);
    await page.evaluate(()=>{const n=document.createElement('p');n.id='future-settings-field';n.textContent='Future device preference';document.querySelector('.lws-setting-list').append(n);});
    await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings.active)).toBe(false);await expect(dialog.locator('h2')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await toggle(page,'boldText',width,true);expect(await page.evaluate(()=>LegendStorage.loadSettings().boldText)).toBe(false);
    await page.evaluate(()=>document.getElementById('future-settings-field').remove());await native(page,'modal');
    await page.evaluate(()=>{window.__settingsSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='legend-settings-v1')throw new DOMException('Synthetic storage denial','QuotaExceededError');return __settingsSet.call(this,key,value);};});
    await toggle(page,'highContrast',width,true);await native(page,'modal');await expect(dialog.locator('[data-shell-modal-status]')).toContainText('could not be saved permanently');expect(await page.evaluate(()=>LegendStorage.loadSettings().highContrast)).toBe(false);
    await page.evaluate(()=>{Storage.prototype.setItem=__settingsSet;});expect(await raw(page)).toEqual(before);
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings.active)).toBe(false);
  });
});

test('title settings preserve accessible fallback and report denied writes without claiming success',async({page})=>{
  await boot(page,390);const before=await raw(page);await page.locator('#settings').click();await native(page,'page');
  await page.evaluate(()=>{const image=document.querySelector('.settings09x-setting-icon img');window.__settingsArt={image,parent:image.parentNode};image.remove();});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings.active)).toBe(false);
  const input=page.locator('[data-setting="largeText"]');await input.focus();await page.keyboard.press('Space');await expect(input).toBeChecked();
  expect(await page.locator('.settings09x-toggle').first().locator('.settings09x-switch').evaluate(n=>getComputedStyle(n,'::after').transform)).toBe('matrix(1, 0, 0, 1, 21, 0)');
  await page.evaluate(()=>{const {image,parent}=__settingsArt;parent.append(image);});await native(page,'page');
  await page.evaluate(()=>{window.__settingsSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='legend-settings-v1')throw new DOMException('Synthetic denied write','QuotaExceededError');return __settingsSet.call(this,key,value);};});
  await page.locator('#saveSettings').click();await native(page,'page');await expect(page.locator('.settings09x-status')).toContainText('could not be saved permanently');await expect(page.locator('#saveSettings')).toBeFocused();
  expect(await page.evaluate(()=>LegendStorage.loadSettings().largeText)).toBe(true);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('legend-settings-v1')).largeText)).toBe(false);expect(await raw(page)).toEqual(before);
  await page.evaluate(()=>{Storage.prototype.setItem=__settingsSet;});
  await page.locator('#saveSettings').click();await native(page,'page');await expect(page.locator('.settings09x-status')).toHaveText('Settings saved for this device.');
  await page.locator('#backGame').click();await expect(page.locator('.ash100-town-greyfen')).toBeVisible();expect(await raw(page)).toEqual(before);
});


test('settings recover from incomplete modal content and identical replacement copy',async({page})=>{
  await boot(page,390);await page.evaluate(()=>LegendAshmereV099.renderAshmere());const before=await raw(page);
  await page.locator('.lws-bottom-bar [data-world-action="settings"]').click();await native(page,'modal');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.evaluate(()=>document.querySelector('.lws-modal-content').classList.replace('lws-modal-content','settings-content-missing'));
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings.active)).toBe(false);
  await expect(page.locator('.lws-modal-heading h2')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
  await page.evaluate(()=>document.querySelector('.settings-content-missing').classList.replace('settings-content-missing','lws-modal-content'));await native(page,'modal');
  await page.evaluate(()=>{const heading=document.querySelector('.lws-modal-heading h2');window.__settingsHeading=heading.textContent;heading.textContent='';});
  await expect.poll(()=>page.evaluate(()=>LegendPhaserWorldV1.snapshot().nativeSettings.active)).toBe(false);
  await page.evaluate(()=>{document.querySelector('.lws-modal-heading h2').textContent=__settingsHeading;});await native(page,'modal');
  await page.evaluate(()=>{const heading=document.querySelector('.lws-modal-heading h2'),replacement=document.createElement('h2');replacement.textContent=heading.textContent;heading.replaceWith(replacement);});
  await expect(page.locator('.lws-modal-heading h2')).toHaveAttribute('data-settings-copy','true');await native(page,'modal');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Settings'})).toHaveCount(0);expect(errors).toEqual([]);expect(await raw(page)).toEqual(before);
});
