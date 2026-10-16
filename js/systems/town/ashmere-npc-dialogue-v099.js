/* LEGEND Ashmere/Greyfen NPC dialogue and evidence progression.
 * Owns the existing character dialogue branches, quest flags, memories, and objective
 * updates. Screen frame, player persistence, and presentation helpers are injected.
 */
(() => {
  function render(context, id) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const esc = context.escapeHtml;
    const img = context.imageMarkup;
    const bg = context.background;
    const npc = context.npcArt;
    const setBellQuestObjective = context.setBellQuestObjective;
    const head = context.head;
    const screen = context.screen;
    const npcCatalog = context.npcCatalog;

  function renderNPC(id){
    const pl=p(); if(!pl)return;
    const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const n = npcCatalog?.get
      ? npcCatalog.get(greyfen ? 'Greyfen' : 'Ashmere', id)
      : {
          name: 'Town Character',
          role: 'Town Guide',
          art: npc(id),
          text: 'The dialogue catalog did not load. Refresh before continuing.',
          lines: ['Town dialogue is temporarily unavailable.']
        };
    const story = context.npcStory;
    if (typeof story?.apply === 'function') {
      story.apply(pl, id, greyfen, n, setBellQuestObjective);
    } else {
      n.lines = ['The town story service did not load. Refresh before continuing.'];
    }
    save(pl);
    let extra='';
    if(id==='brenn'&&Number(pl.inventory?.roadToken||0)>=3) extra='<button class="ash099-btn" id="turnTokens">Open the Regional Ledger</button>';
    screen(head(n.role,n.name,n.text,n.art,id),'<div class="ash099-lines">'+n.lines.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>',extra);
    const turn=document.getElementById('turnTokens');
    if(turn) turn.onclick=()=>{
      if (typeof context.renderRegions === 'function') return context.renderRegions();
      return renderNPC('brenn');
    };
  }


    return renderNPC(id);
  }

  window.LegendAshmereNpcDialogueV099 = Object.freeze({ render });
})();
