const { test, expect } = require('@playwright/test');

test.describe('LegendRoadActionsV100 compatibility contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() =>
      typeof window.LegendRoadStateV100?.create === 'function' &&
      typeof window.LegendRoadActionsV100?.create === 'function'
    );
  });

  test('expedition kickoff resets trip-local state, increments trips, and applies wick-sensitive pressure', async ({ page }) => {
    const result = await page.evaluate(() => {
      const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
      const rules = window.LegendRoadStateV100.create({
        getData: () => window.LEGEND_DATA,
        clamp
      });

      function startWithWick(wickCount) {
        const player = {
          inventory: { wispLanternWick: wickCount },
          flags: {
            roadExpeditionV100: {
              stage: 4,
              pressure: 20,
              trips: 7,
              events: 9,
              finds: 3,
              battles: 2,
              routeChoice: 'reeds',
              poiUsed: { stalePoi: true },
              searchUsed: { staleSearch: true },
              readUsed: { staleRead: true }
            }
          }
        };
        let saves = 0;
        const actions = window.LegendRoadActionsV100.create({
          getPlayer: () => player,
          savePlayer: () => { saves += 1; },
          ensureState: rules.ensure,
          getRoadData: () => window.LegendRoadsV100.oldRoad,
          getScore: () => 0,
          addInventory: (target, item, amount) => {
            target.inventory = target.inventory || {};
            target.inventory[item] = Number(target.inventory[item] || 0) + Number(amount || 0);
          },
          pick: values => values?.[0] ?? null,
          randomInt: (minimum) => minimum,
          clamp,
          itemName: item => item,
          skillLabel: skill => skill,
          renderExpedition: () => {},
          combat: () => {},
          getAreaForStage: () => ({ name: 'Test Area', text: 'Test scene' })
        });
        const openingNote = actions.start();
        return {
          openingNote,
          state: { ...player.flags.roadExpeditionV100 },
          inventory: { ...player.inventory },
          firstRoadEvent: player.flags.firstRoadEvent,
          saves
        };
      }

      return {
        withWick: startWithWick(1),
        withoutWick: startWithWick(0)
      };
    });

    expect(result.withWick.openingNote).toContain('opening Road Pressure rises by only 3 instead of 8');
    expect(result.withWick.state).toMatchObject({
      stage: 0,
      pressure: 23,
      trips: 8,
      events: 9,
      finds: 3,
      battles: 2,
      routeChoice: null,
      poiUsed: {},
      searchUsed: {},
      readUsed: {}
    });
    expect(result.withWick.inventory.wispLanternWick).toBe(0);
    expect(result.withWick.firstRoadEvent).toBe(true);
    expect(result.withWick.saves).toBe(1);

    expect(result.withoutWick.openingNote).toContain('You leave Ashmere with a clear route');
    expect(result.withoutWick.state).toMatchObject({
      stage: 0,
      pressure: 28,
      trips: 8,
      events: 9,
      finds: 3,
      battles: 2,
      routeChoice: null,
      poiUsed: {},
      searchUsed: {},
      readUsed: {}
    });
    expect(result.withoutWick.inventory.wispLanternWick).toBe(0);
    expect(result.withoutWick.firstRoadEvent).toBe(true);
    expect(result.withoutWick.saves).toBe(1);
  });
});


test('a careful traveler still meets a road encounter after two travel stretches', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.LegendRoadStateV100?.create === 'function' && typeof window.LegendRoadActionsV100?.create === 'function');
  const result = await page.evaluate(() => {
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const rules=window.LegendRoadStateV100.create({getData:()=>window.LEGEND_DATA,clamp});
    const player={
      username:'CadenceQA',
      hp:100,maxHp:100,gold:0,
      inventory:{},
      flags:{roadExpeditionV100:{pressure:0,trips:0}}
    };
    const battles=[];
    const actions=window.LegendRoadActionsV100.create({
      getPlayer:()=>player,
      savePlayer:()=>{},
      ensureState:rules.ensure,
      getRoadData:()=>window.LegendRoadsV100.oldRoad,
      getScore:()=>0,
      addInventory:(target,item,amount)=>{
        target.inventory=target.inventory||{};
        target.inventory[item]=Number(target.inventory[item]||0)+Number(amount||0);
      },
      pick:values=>values?.[0]??null,
      randomInt:minimum=>minimum,
      clamp,
      itemName:item=>item,
      skillLabel:skill=>skill,
      renderExpedition:()=>{},
      combat:(enemy,note)=>battles.push({name:enemy.name,note}),
      getAreaForStage:stage=>({name:'Cadence Test Stage '+stage,text:'A test stretch'})
    });
    actions.start();
    const state=player.flags.roadExpeditionV100;
    state.routeChoice='ridge';
    actions.resolveChoice('push');
    const afterFirst={
      battles:battles.length,
      steps:Number(state.roadStepsSinceEncounterV290||0),
      stage:Number(state.stage||0)
    };
    actions.resolveChoice('push');
    return {
      afterFirst,
      afterSecond:{
        battles:battles.length,
        steps:Number(state.roadStepsSinceEncounterV290||0),
        pressure:Number(state.pressure||0),
        battleName:battles[0]?.name,
        note:battles[0]?.note||''
      }
    };
  });
  expect(result.afterFirst).toMatchObject({battles:0,steps:1,stage:1});
  expect(result.afterSecond).toMatchObject({battles:1,steps:0,pressure:24,battleName:'Road Goblin'});
  expect(result.afterSecond.note).toContain('Two stretches of road have passed');
});
