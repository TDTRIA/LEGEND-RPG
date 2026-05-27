// LEGEND v0.9.x - Art Integration Layer
// Applies uploaded art to older screens only. v0.9.5 town screens own their own layout/art.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const A = () => window.LegendAssetsV090 || {};
  const seen = new WeakSet();

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function img(path, cls='', alt=''){
    if(!path) return '';
    return `<img class="${esc(cls)}" src="${esc(path)}?v=0.9-art" alt="${esc(alt)}" loading="lazy" onerror="this.remove()">`;
  }
  function findAsset(text){ return A().byName ? A().byName(text) : ''; }
  function isManagedTownScreen(){ return !!document.querySelector('.v094-town-polish,#legendTownV080'); }

  function enhanceTown(){
    const town = document.getElementById('legendTownV080');
    if(!town || town.dataset.artV092 === '1') return;
    if(town.closest('.v094-town-polish')) return;
    town.dataset.artV092 = '1';
    const hero = town.querySelector('.v080-town-hero');
    if(hero && A().locations?.ashmereMain){
      hero.classList.add('v092-art-hero');
      hero.insertAdjacentHTML('afterbegin', `${img(A().locations.ashmereMain,'v092-hero-bg','Ashmere')}`);
    }
  }

  function enhanceLocation(){
    if(isManagedTownScreen()) return;
    const panel = document.querySelector('.v080-location-panel');
    if(!panel || panel.dataset.artV092 === '1') return;
    const text = panel.textContent || '';
    const portrait = findAsset(text);
    const bg = /gate|road|old road/i.test(text) ? A().locations?.oldRoad : A().locations?.ashmereMain;
    panel.dataset.artV092 = '1';
    panel.classList.add('v092-location-art');
    if(bg) panel.insertAdjacentHTML('afterbegin', img(bg,'v092-location-bg','Location'));
    if(portrait){
      const head = panel.querySelector('.v080-location-head');
      if(head) head.insertAdjacentHTML('beforeend', `<div class="v092-location-portrait">${img(portrait,'','Portrait')}</div>`);
    }
  }

  function enhanceBattle(){
    const battle = document.querySelector('.v087-battle');
    if(!battle || battle.dataset.artV092 === '1') return;
    const name = battle.querySelector('h2')?.textContent || battle.textContent || '';
    const enemyArt = findAsset(name);
    if(!enemyArt) return;
    battle.dataset.artV092 = '1';
    battle.classList.add('v092-battle-art');
    const enemyBox = battle.querySelector('.v087-enemy');
    if(enemyBox){ enemyBox.innerHTML = img(enemyArt,'v092-enemy-art',name); }
  }

  function enhanceDialogueLikeCards(){
    if(isManagedTownScreen()) return;
    document.querySelectorAll('.card,.panel,.v087-outcome').forEach(el => {
      if(seen.has(el)) return;
      const text = el.textContent || '';
      const portrait = findAsset(text);
      if(!portrait || !/(Mara|Brenn|Oric|Innkeeper|Trader|Blacksmith)/i.test(text)) return;
      seen.add(el);
      el.classList.add('v092-dialogue-card');
      el.insertAdjacentHTML('afterbegin', `<div class="v092-dialogue-portrait">${img(portrait,'','Portrait')}</div>`);
    });
  }

  function run(){
    enhanceTown();
    enhanceLocation();
    enhanceBattle();
    enhanceDialogueLikeCards();
  }

  window.LegendArtIntegrationV092 = { run };
  const rt = RT();
  if(rt?.onRender) rt.onRender(run);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    run();
    new MutationObserver(() => requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
  });
  else {
    run();
    new MutationObserver(() => requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
  }
})();