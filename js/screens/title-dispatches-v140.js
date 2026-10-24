/* LEGEND v0.21.1 — in-game development dispatches and roadmap preview */
(() => {
  const esc = window.LegendHtmlV120?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const updates = [
    {version:'v0.21.1',title:'Your memories now shape a real starting build',status:'Preview · validation pending',text:'Identity, personality, origin, class, and keepsake choices now use dedicated art and plainly stated effects. Those effects carry into road checks, class techniques, starting supplies, and the Bent Coin market bonus. Read the Blackroot Tracks is a new trail-reading contract on the Work Board.'},
    {version:'v0.20.40',title:'The first journey begins on the road',status:'Opening pass · preview',text:'The Veil-led memory flow leads into Oric finding the traveler beneath a dead lantern, a scripted ACT awakening, and a guided first expedition in the production road systems.'},
    {version:'v0.20.37',title:'Road encounters gain distinct rhythms',status:'Shipped',text:'Road Goblins, Blackroot Wolves, and Lantern Wisps now use different readable attack patterns. Watch the intent, then choose how to respond.'},
    {version:'v0.20.35',title:'A more cinematic title screen',status:'Shipped',text:'The production menu uses committed Ashmere artwork, the Awakening wordmark, and a framed RPG menu while preserving Continue and accessibility options.'},
    {version:'v0.20.29',title:'The world gets a stronger art foundation',status:'Shipped',text:'New local environment, class, enemy, service, equipment, and item art now support the Ashmere and Old Road experience.'}
  ];
  const roadmap = [
    {status:'In progress',title:'The Veil and the first road',text:'A memory-led opening, Oric at the dead lantern, a first ACT encounter, and a guided first expedition using the real road systems.'},
    {status:'Next',title:'Make the road remember',text:'Give route, discovery, combat, and return choices stronger callbacks in dialogue, the journal, and later expeditions.'},
    {status:'Planned',title:'A more connected frontier',text:'Expand regional stories, progression, NPC relationships, and the reasons to prepare before travelling farther.'}
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
