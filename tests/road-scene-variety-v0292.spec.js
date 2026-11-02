const { test, expect } = require('@playwright/test');

async function startAshmereTraveler(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout:10000 });
  await page.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await page.getByRole('button', { name:/Begin Your Journey/i }).click();
  await page.getByRole('button', { name:/^Continue$/ }).click();
  await page.getByRole('button', { name:/^Continue$/ }).click();
  await page.getByRole('button', { name:/Shape the traveler/i }).click();
  await page.locator('#v094Name').fill('RoadSceneVarietyQA');
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name:'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name:'Lift your head' }).click();
  await page.evaluate(() => {
    const player=window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player,'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('the six Old Road stages resolve to distinct committed local scenes', async ({ page }) => {
  await startAshmereTraveler(page);
  const scenes=await page.evaluate(() => {
    const player=window.LegendRuntimeV120.loadPlayer();
    player.flags=player.flags||{};
    const state={
      stage:0,pressure:12,trips:1,events:0,finds:0,battles:0,
      routeChoice:'ridge',poiUsed:{},searchUsed:{},readUsed:{},
      campWatchUsed:{},campRestUsed:{},visitedNodeIdsV160:[],
      discoveredNodeIdsV160:[],completedInteractionIdsV160:[]
    };
    player.flags.roadExpeditionV100=state;
    window.LegendRuntimeV120.savePlayer(player);
    const results=[];
    for(let stage=0;stage<=5;stage++){
      state.stage=stage;
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendRoadControllerV100.renderExpedition();
      const image=document.querySelector('.exp100-scene-live img');
      const src=image?.getAttribute('src')||'';
      results.push({stage,src,path:src?new URL(src,location.href).pathname:''});
    }
    return results;
  });
  expect(scenes).toHaveLength(6);
  expect(scenes.every(scene=>scene.path)).toBe(true);
  expect(new Set(scenes.map(scene=>scene.path)).size).toBe(6);
  expect(scenes.map(scene=>scene.path)).toEqual([
    '/assets/generated/locations/old-road-south-fork.webp',
    '/assets/generated/locations/high-ridge.webp',
    '/assets/generated/locations/roadside-camp.webp',
    '/assets/locations/roads/location_old_road_main_v1.jpg',
    '/assets/generated/locations/greyfen-marsh-walkway.webp',
    '/assets/generated/locations/greyfen-town.webp'
  ]);
});
