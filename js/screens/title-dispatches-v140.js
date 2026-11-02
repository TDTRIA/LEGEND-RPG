/* LEGEND v0.21.1 — in-game development dispatches and roadmap preview */
(() => {
  const esc = window.LegendHtmlV120?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const updates = [
    {version:'v0.27.0',title:'Greyfen becomes a working frontier',status:'Current build · shipped',text:'The lowland now has its own crossing response, Marsh Path expedition, optional Silted Storehouse delve, local salvage and crafting loop, and Marshguard Coat. The first two towns now have a stronger foundation for a connected road journey.'},
    {version:'v0.26.0',title:'The crossing keeps its consequences',status:'Shipped',text:'A provisional safety notice can be posted or the report can remain sealed while the missing closure order is still sought. The choice changes the next Marsh Path pressure without naming an unproven author.'},
    {version:'v0.25.0',title:'A deeper place beneath Greyfen',status:'Shipped',text:'The Silted Storehouse adds a three-room optional delve with route choices, evidence to preserve, and supplies to recover.'},
    {version:'v0.24.0',title:'The first marsh road takes shape',status:'Shipped',text:'Greyfen gains its own Marsh Path, waterline discovery, shelter decisions, regional map stops, and a return report.'},
    {version:'v0.22.0',title:'The realm opens like a game client',status:'Shipped',text:'A measured boot sequence, readable scene curtain, persistent realm presentation, and a title menu grounded in Ashmere artwork lead into the production game.'}
  ];
  const roadmap = [
    {status:'In progress',title:'Make every road trip matter',text:'Reliable encounter pacing, distinct enemies, varied location scenes, and discoveries that change what the traveler knows and brings home.'},
    {status:'Next',title:'Give Ashmere a stronger home loop',text:'Make the daily field board easy to reach, turn paid jobs into useful assignments, and make the market, forge, inn, and town spaces feel like one lived-in place.'},
    {status:'Planned',title:'Complete the first three towns',text:'Finish the Ashmere and Greyfen loops, then bring Ironpass online with its own services, expeditions, quests, economy, and discoveries.'}
  ];
  function card(item, kind) {
    return "<article class='dispatches-v140-card'><div class='dispatches-v140-card-meta'><span>" + esc(item.status) + "</span><small>" + esc(item.version || kind) + "</small></div><h3>" + esc(item.title) + "</h3><p>" + esc(item.text) + "</p></article>";
  }
  function render(config = {}) {
    const root = config.root;
    const buildVersion = config.buildVersion || 'v0.21.1';
    const onBack = config.onBack;
    if (!root) return false;
    root.innerHTML =
      "<main class='dispatches-v140'><div class='dispatches-v140-backdrop' aria-hidden='true'></div><div class='dispatches-v140-shell'>" +
        "<header class='dispatches-v140-header'><div><span class='dispatches-v140-kicker'>LEGEND · DEVELOPMENT DISPATCH</span><h1>News &amp; Roadmap</h1><p>Notes from the making of <em>LEGEND: The Awakening</em>.</p></div><button id='dispatchesBack' type='button'>Return to Title</button></header>" +
        "<section class='dispatches-v140-feature'><div class='dispatches-v140-feature-copy'><span class='dispatches-v140-kicker'>CURRENT BUILD · " + esc(buildVersion) + "</span><h2>A world in progress.</h2><p>Follow improvements to the title, story, road encounters, combat, and progression. Roadmap items are intentions, not release promises; shipped changes are marked separately.</p><nav><a href='updates.html' target='_blank' rel='noopener'>All development updates ↗</a><a href='blog.html' target='_blank' rel='noopener'>Read the devlog ↗</a><a href='https://github.com/TDTRIA/LEGEND-RPG' target='_blank' rel='noopener'>Project on GitHub ↗</a></nav></div><div class='dispatches-v140-feature-mark' aria-hidden='true'><img src='assets/generated/ui/icons/service-milestone.webp' alt='' loading='lazy' decoding='async'></div></section>" +
        "<section class='dispatches-v140-section' aria-labelledby='dispatchNewsTitle'><div class='dispatches-v140-section-heading'><div><span class='dispatches-v140-kicker'>RECENT NOTES</span><h2 id='dispatchNewsTitle'>Development News</h2></div></div><div class='dispatches-v140-grid'>" + updates.map(item => card(item, 'UPDATE')).join('') + "</div></section>" +
        "<section class='dispatches-v140-section' aria-labelledby='dispatchRoadmapTitle'><div class='dispatches-v140-section-heading'><div><span class='dispatches-v140-kicker'>WHAT'S AHEAD</span><h2 id='dispatchRoadmapTitle'>The Roadmap</h2></div><small>Direction, not deadlines</small></div><div class='dispatches-v140-grid dispatches-v140-roadmap'>" + roadmap.map(item => card(item, 'ROADMAP')).join('') + "</div></section>" +
        "<footer class='dispatches-v140-footer'><span>LEGEND: THE AWAKENING</span><span>Build " + esc(buildVersion) + " · Your save and journey remain yours.</span></footer>" +
      "</div></main>";
    root.querySelector('#dispatchesBack')?.addEventListener('click', () => onBack?.());
    return true;
  }
  window.LegendTitleDispatchesV140 = Object.freeze({render});
})();
