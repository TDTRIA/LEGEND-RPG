window.LegendUI = (() => {
  const root = () => document.getElementById('root');
  const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const pct = (n, d) => Math.max(0, Math.min(100, d ? (n / d) * 100 : 0));

  function topbar(player, version, locationName){
    return `<header class="topbar"><div class="brand"><h1>LEGEND</h1><div class="sub">Recovered Build ${version}</div></div><div class="meta-grid"><div class="box"><span class="label">Location</span><span class="value">${esc(locationName)}</span></div><div class="box"><span class="label">Hero</span><span class="value">${esc(player.username)}</span></div></div><div class="meta-grid"><div class="box"><span class="label">HP</span><span class="value">${player.hp}/${player.maxHp}</span></div><div class="box"><span class="label">Gold</span><span class="value">${player.gold}</span></div></div></header>`;
  }

  function stats(player, weapon, armor){
    return `<section class="panel"><div class="panel-head"><div><h3>Character</h3><p>${esc(weapon.name)} / ${esc(armor.name)}</p></div></div><div class="stat-grid"><div class="stat"><span class="label">Health</span><span class="num">${player.hp}/${player.maxHp}</span><div class="bar red"><span style="width:${pct(player.hp, player.maxHp)}%"></span></div></div><div class="stat"><span class="label">Level</span><span class="num">${player.level}</span></div><div class="stat"><span class="label">Road Tokens</span><span class="num gold">${player.inventory.roadToken}/3</span></div><div class="stat"><span class="label">Camp</span><span class="num">${player.inventory.camp}</span></div></div></section>`;
  }

  function quest(player, version){
    let step = 'Bell Quest: Speak to Mara Vell in People of Ashmere.';
    if(player.flags.bellQuestStarted && !player.flags.bellRoadSearched) step = 'Bell Quest: Explore Old Road to find the Bell Shard.';
    else if(player.flags.bellRoadSearched && !player.flags.bellQuestComplete) step = 'Bell Quest: Bring the Bell Fragment to Brenn in The Ledger Hall.';
    else if(player.flags.bellQuestComplete && !player.flags.firstRoadComplete) step = `The First Road: Bring 3 Road Tokens to Brenn. Current: ${player.inventory.roadToken}/3.`;
    else if(player.flags.firstRoadComplete) step = 'Next: Prepare for The Hollow Keep.';
    return `<section class="panel"><div class="panel-head"><div><h3>Quest Tracker</h3><p>Current objective</p></div></div><div class="quest-step"><span class="tag">Main</span><span class="tag">${version}</span><p class="text" style="font-size:.95rem;margin-top:8px">${esc(step)}</p></div></section>`;
  }

  function logs(log){
    return `<section class="panel"><div class="panel-head"><div><h3>World Log</h3><p>Recent events</p></div></div><div class="log">${log.length ? log.map(l => `<div class="log-entry ${l.t || ''}">${esc(l.m)}</div>`).join('') : '<div class="log-entry story">The world waits for input.</div>'}</div></section>`;
  }

  function renderLayout({player, version, locationName, title, content='', actions=[], extra='', log=[], weapon, armor}){
    root().innerHTML = `<div class="shell">${topbar(player, version, locationName)}<div class="layout"><section class="panel"><div class="panel-head"><div><h2>${esc(title)}</h2><p>${esc(locationName)}</p></div><span class="value">${esc(player.keepsake)}</span></div>${extra}<div class="text">${content}</div><div class="actions">${actions.map((a,i)=>`<button class="btn ${a.className || ''}" data-action="${i}">${esc(a.label)}</button>`).join('')}</div></section><aside class="stack">${stats(player, weapon, armor)}${quest(player, version)}${logs(log)}</aside></div></div>`;
    actions.forEach((a,i) => document.querySelector(`[data-action="${i}"]`).onclick = a.fn);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  return { esc, renderLayout, root: root };
})();
