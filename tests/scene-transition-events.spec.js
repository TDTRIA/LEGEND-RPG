const {test,expect}=require('@playwright/test');
test('scene curtains preserve single native and forwarded callbacks with normal and reduced motion',async({page})=>{
  test.setTimeout(60000);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  await page.evaluate(()=>{
    window.__transitionCalls=[];
    const host=document.createElement('div');host.id='transition-event-fixture';host.style.cssText='position:fixed;top:0;left:0;z-index:999999;background:white';
    for(const [id,attribute,value] of [['native','data-ash-view','inn'],['forwarded','data-legend-scene-transition','Field records'],['travel','data-travel','Greyfen'],['unlock','data-unlock','Greyfen'],['disabled','data-ash-view','inn']]){
      const button=document.createElement('button');button.type='button';button.id='transition-'+id;button.textContent=id;button.setAttribute(attribute,value);button.disabled=id==='disabled';
      button.addEventListener('click',event=>__transitionCalls.push({id,prevented:event.defaultPrevented}));host.append(button);
    }
    document.body.append(host);
  });
  await page.locator('#transition-native').click();
  await expect.poll(()=>page.evaluate(()=>__transitionCalls)).toEqual([{id:'native',prevented:false}]);
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/);
  // A delegated control may call HTMLElement.click(); active curtains must not
  // consume subsequent callbacks or replay any callback twice.
  const calls=await page.evaluate(()=>{
    for(const id of ['forwarded','travel','unlock','disabled'])document.getElementById('transition-'+id).click();
    return __transitionCalls;
  });
  expect(calls).toEqual(['native','forwarded','travel','unlock'].map(id=>({id,prevented:false})));
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>document.getElementById('transition-forwarded').click());
  expect(await page.evaluate(()=>__transitionCalls)).toEqual([...calls,{id:'forwarded',prevented:false}]);
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/);
});

test('Settings retains its existing Escape return without changing the player save',async({page})=>{
  test.setTimeout(60000);await page.goto('/');await page.waitForFunction(()=>window.__legendPhaserWorldReady);
  const before=await page.evaluate(()=>localStorage.getItem('legend-roads-of-ashmere-v09'));
  await page.locator('#settings').click();await expect(page.locator('.settings09x')).toBeVisible();await page.keyboard.press('Escape');
  await expect(page.locator('.v120-title')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(before);
});
