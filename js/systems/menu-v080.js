// LEGEND v0.8 - Ashmere Navigation Controller
// First real extraction step: replaces the visible Ashmere menu UI while preserving
// game.js button actions underneath. This makes game.js more of a fallback shell.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const MENU_ID = 'legendMenuV080';

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function iconFor(title){
    const t = String(title || '').toLowerCase();
    if(t.includes('road')) return icon('road');
    if(t.includes('people')) return icon('people');
    if(t.includes('archive')) return icon('archive');
    if(t.includes('ledger')) return icon('ledger');
    if(t.includes('inn')) return icon('inn');
    if(t.includes('trading')) return icon('trade');
    if(t.includes('weapon')) return icon('weapon');
    if(t.includes('armor')) return icon('armor');
    if(t.includes('commons')) return icon('commons');
    if(t.includes('keep')) return icon('keep');
    if(t.includes('character')) return icon('sheet');
    if(t.includes('settings')) return icon('settings');
    if(t.includes('save vault')) return icon('save');
    if(t.includes('exit')) return icon('exit');
    return icon('node');
  }

  function icon(type){
    const map = {
      road:'<svg viewBox="0 0 24 24"><path d="M8 21 11 3"/><path d="M16 21 13 3"/><path d="M4 10h16"/><path d="M3 17h18"/></svg>',
      people:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c1-4 4-6 7-6s6 2 7 6"/><path d="M14 15c3 .4 5 2 6 5"/></svg>',
      archive:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>',
      ledger:'<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M6 19V8l6-4 6 4v11"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>',
      inn:'<svg viewBox="0 0 24 24"><path d="M4 11h16v8"/><path d="M4 19V7"/><path d="M8 11V8h5a3 3 0 0 1 3 3"/></svg>',
      trade:'<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-4 7h8L7 7Z"/><path d="M17 7l-4 7h8l-4-7Z"/></svg>',
      weapon:'<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9 9-4-4 9-9Z"/><path d="M5 17l2 2-3 3-2-2 3-3Z"/></svg>',
      armor:'<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/></svg>',
      commons:'<svg viewBox="0 0 24 24"><path d="M12 21C8 16 5 12 5 8a7 7 0 0 1 14 0c0 4-3 8-7 13Z"/><path d="M9 9h6"/><path d="M12 6v6"/></svg>',
      keep:'<svg viewBox="0 0 24 24"><path d="M5 21V8l3-3 4 3 4-3 3 3v13"/><path d="M9 21v-6h6v6"/><path d="M5 11h14"/></svg>',
      sheet:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-5 14.6-5 16 0"/></svg>',
      settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
      save:'<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h7V3"/><path d="M8 21v-7h8v7"/></svg>',
      exit:'<svg viewBox="0 0 24 24"><path d="M9 21H5V3h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
      node:'<svg viewBox="0 0 24 24"><path d="M12 3l8 9-8 9-8-9 8-9Z"/></svg>'
    };
    return map[type] || map.node;
  }

  function parseCard(card){
    const h = card.querySelector('h3');
    const p = card.querySelector('p');
    let title = h ? h.textContent.trim() : card.textContent.trim();
    title = title.replace(/^\S+\s+/, match => /[A-Za-z0-9]/.test(match) ? match : '');
    return {
      title,
      desc: p ? p.textContent.trim() : '',
      original: card,
      important: /road|character sheet/i.test(title)
    };
  }

  function menuStatus(player){
    if(!player) return 'No save loaded.';
    const tokens = Number(player.inventory?.roadToken || 0);
    const bells = Number(player.inventory?.bellFragment || 0);
    const trust = Number(player.townTrust?.Ashmere || 0);
    return `Level ${Number(player.level||1)} • ${Number(player.gold||0)}g • Road Tokens ${tokens}/3 • Bell Fragments ${bells} • Ashmere Trust ${trust}`;
  }

  function enhanceMenu(){
    if(document.getElementById(MENU_ID)) return;
    const title = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Ashmere Menu');
    if(!title) return;
    const panel = title.closest('.panel');
    if(!panel) return;
    const grid = panel.querySelector('.grid');
    if(!grid) return;
    const cards = [...grid.querySelectorAll('.card')].map(parseCard);
    if(!cards.length) return;

    const player = RT()?.loadPlayer?.() || null;
    const oldGrid = grid;
    oldGrid.style.display = 'none';
    const hint = panel.querySelector('.quest');
    if(hint) hint.style.display = 'none';

    const shell = document.createElement('section');
    shell.id = MENU_ID;
    shell.className = 'v080-menu-shell';
    shell.innerHTML = `
      <div class="v080-menu-hero">
        <div>
          <div class="v080-kicker">Ashmere Navigation v0.8</div>
          <h3>Ashmere</h3>
          <p>${esc(menuStatus(player))}</p>
        </div>
        <div class="v080-menu-actions"><button class="v080-primary-btn" id="v080QuickRoad">Travel the Old Road</button><button class="v080-btn" id="v080QuickSheet">Character Sheet</button></div>
      </div>
      <div class="v080-menu-grid">
        ${cards.map((c,i)=>`<button class="v080-menu-card ${c.important?'important':''}" data-v080-menu="${i}"><span class="v080-menu-icon">${iconFor(c.title)}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.desc)}</small></span></button>`).join('')}
      </div>
      ${hint ? `<div class="v080-menu-note"><strong>More of Ashmere is still closed.</strong><span>Meet people, survive the road, and bring proof back to town to open new places.</span></div>` : ''}`;
    oldGrid.after(shell);

    shell.querySelectorAll('[data-v080-menu]').forEach(btn => {
      const c = cards[Number(btn.dataset.v080Menu)];
      btn.onclick = () => c.original.click();
    });
    const road = cards.find(c => /road/i.test(c.title));
    const sheet = cards.find(c => /character sheet/i.test(c.title));
    const roadBtn = document.getElementById('v080QuickRoad');
    const sheetBtn = document.getElementById('v080QuickSheet');
    if(roadBtn && road) roadBtn.onclick = () => road.original.click();
    if(sheetBtn && sheet) sheetBtn.onclick = () => sheet.original.click();
  }

  const css = document.createElement('style');
  css.textContent = `.v080-menu-shell{display:grid;gap:14px;margin-top:12px}.v080-menu-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;border:1px solid rgba(255,211,105,.32);border-radius:24px;padding:18px;background:radial-gradient(circle at 15% 25%,rgba(255,211,105,.14),transparent 30%),linear-gradient(180deg,rgba(18,34,26,.96),rgba(3,8,6,.86));box-shadow:0 18px 48px rgba(0,0,0,.28)}.v080-menu-hero h3{margin:0;color:#7dffad;font-size:clamp(2rem,6vw,4rem);line-height:1}.v080-menu-hero p{margin:.35rem 0 0;color:#d9efe1;line-height:1.4}.v080-menu-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.v080-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v080-menu-card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;text-align:left;border:1px solid rgba(125,255,173,.16);border-radius:18px;background:linear-gradient(180deg,rgba(12,25,19,.9),rgba(0,0,0,.22));color:#eaffef;padding:13px;cursor:pointer;transition:.16s}.v080-menu-card:hover{transform:translateY(-2px);border-color:rgba(255,211,105,.55);box-shadow:0 16px 34px rgba(0,0,0,.24)}.v080-menu-card.important{border-color:rgba(255,211,105,.32);background:linear-gradient(180deg,rgba(255,211,105,.08),rgba(0,0,0,.18))}.v080-menu-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:16px;border:1px solid rgba(255,211,105,.25);background:rgba(255,211,105,.07);color:#ffe7a6}.v080-menu-icon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.v080-menu-card strong{display:block;color:#ffd369;font-size:1rem;line-height:1.15}.v080-menu-card small{display:block;color:#b9d3c1;margin-top:4px;line-height:1.35}.v080-menu-note{border:1px solid rgba(255,211,105,.22);border-radius:16px;background:rgba(255,211,105,.06);padding:12px;color:#ffe7a6}.v080-menu-note strong,.v080-menu-note span{display:block}.v080-menu-note span{color:#d9efe1;margin-top:4px}@media(max-width:820px){.v080-menu-hero{grid-template-columns:1fr}.v080-menu-actions{display:grid;grid-template-columns:1fr;justify-content:stretch}.v080-menu-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(css);

  const rt = RT();
  if(rt && typeof rt.onRender === 'function') rt.onRender(enhanceMenu);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceMenu);
  else enhanceMenu();
})();
