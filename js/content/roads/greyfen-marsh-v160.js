/* LEGEND v0.24.0 — Greyfen Marsh Path data.
 * The route is authored and recoverable: detours never gate the waterline survey.
 */
(() => {
  window.LegendGreyfenMarshContentV160 = Object.freeze({
    id: 'greyfen-marsh-path',
    name: 'The Marsh Path',
    subtitle: 'Greyfen Landing to the old waterline gauge',
    stops: [
      { id: 'landing', name: 'Greyfen Landing', stage: 0, type: 'Departure', description: 'Low water slaps the pilings beneath the Landing Warden’s platform. From here, the raised posts and reed bed both lead inland.' },
      { id: 'fork', name: 'The Split Causeway', stage: 1, type: 'Route Choice', description: 'The raised posts keep boots above the mud. The reed bed cuts time off the walk, but water hides every hollow.' },
      { id: 'raised-posts', name: 'Raised Posts', stage: 1, route: 'raised', type: 'Safer Route', description: 'Old timber posts make a slow but stable line through the flooded ground.' },
      { id: 'reed-bed', name: 'Reed Bed', stage: 1, route: 'reeds', type: 'Riskier Route', description: 'The reeds hide the old track under shallow water and soft, yielding peat.' },
      { id: 'flooded-sluice', name: 'Flooded Sluice', stage: 2, type: 'Encounter Site', description: 'A low sluice has trapped the last of the current. A pale wisp moves along the waterline, and something glints in the mud.' },
      { id: 'fallen-ferry', name: 'Fallen Ferry', stage: 2, route: 'reeds', optional: true, type: 'Optional Salvage', description: 'A broken ferry lies nose-down against a post. One bundle of cloth remains above the waterline.' },
      { id: 'mossbarrow-shelter', name: 'Mossbarrow Shelter', stage: 3, type: 'Waystation', description: 'A raised timber shelter stands over the marsh. Its dry bench and sealed peat bin have survived another flood.' },
      { id: 'waterline-gauge', name: 'Waterline Gauge', stage: 4, type: 'Field Evidence', description: 'An old iron gauge records the height of previous floods. The latest notch was cut by hand; its date can be compared with Greyfen’s records.' },
      { id: 'greyfen-landing', name: 'Return to Greyfen', stage: 5, type: 'Return', description: 'The same pilings rise above the low water. The field notes and supplies are ready to bring back to the town.' }
    ],
    edges: [
      { from: 'landing', to: 'fork', kind: 'main' },
      { from: 'fork', to: 'raised-posts', route: 'raised', kind: 'main' },
      { from: 'fork', to: 'reed-bed', route: 'reeds', kind: 'main' },
      { from: 'raised-posts', to: 'flooded-sluice', route: 'raised', kind: 'main' },
      { from: 'reed-bed', to: 'flooded-sluice', route: 'reeds', kind: 'main' },
      { from: 'reed-bed', to: 'fallen-ferry', route: 'reeds', kind: 'optional' },
      { from: 'fallen-ferry', to: 'reed-bed', route: 'reeds', kind: 'return' },
      { from: 'flooded-sluice', to: 'mossbarrow-shelter', kind: 'main' },
      { from: 'mossbarrow-shelter', to: 'waterline-gauge', kind: 'main' },
      { from: 'waterline-gauge', to: 'greyfen-landing', kind: 'return' }
    ],
    routeOptions: {
      raised: {
        id: 'raised',
        label: 'Raised Posts',
        description: 'Take the stable line above the water.',
        cost: '1 hour · no supplies',
        consequence: 'Add 4 Road Pressure',
        reward: '1 Dry Peat Brick',
        hours: 1,
        pressure: 4,
        item: 'peatBrick'
      },
      reeds: {
        id: 'reeds',
        label: 'Reed Bed',
        description: 'Take the faster lowland cut through waterlogged peat.',
        cost: '1 Ration · 1 hour',
        consequence: 'Add 12 Road Pressure; an encounter may be harder to avoid',
        reward: '1 Road Herb',
        hours: 1,
        pressure: 12,
        item: 'roadHerb',
        supply: 'food',
        supplyAmount: 1
      }
    },
    optionalSites: {
      'fallen-ferry': {
        cost: '1 hour · +5 Road Pressure',
        reward: '1 Cloth Scrap',
        hours: 1,
        pressure: 5,
        item: 'clothScrap',
        amount: 1
      }
    }
  });
})();
