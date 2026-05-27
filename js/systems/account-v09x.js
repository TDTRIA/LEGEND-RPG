// LEGEND: Roads of Ashmere v0.9.x - Account / Profile Screen
(() => {
  const root = () => document.getElementById('root');
  const S = () => window.LegendStorage || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const local = () => S().loadPlayer?.() || null;

  function renderAccount(){
    const pl = local();
    const connected = !!window.LegendSupabaseV09x?.client;
    root().innerHTML = `<main class="account09x"><div class="account09x-wrap"><section class="account09x-hero"><div class="account09x-hero-content"><div class="account09x-kicker">LEGEND Account</div><h1>Profile</h1><p>Cloud profiles and multiple traveler slots are entering v0.9.x testing. This screen replaces the old Save Vault direction and prepares the game for real account progression.</p></div></section><section class="account09x-grid"><div class="account09x-panel"><h2>Account Status</h2><div class="account09x-status"><div class="account09x-stat"><strong>${connected ? 'Connected' : 'Not Connected'}</strong><span>Supabase</span></div><div class="account09x-stat"><strong>v0.9.x</strong><span>Account Layer</span></div><div class="account09x-stat"><strong>Coming Next</strong><span>Sign In</span></div><div class="account09x-stat"><strong>Coming Next</strong><span>Cloud Travelers</span></div></div><p class="account09x-note"><strong>Next pass:</strong> activate sign in, account creation, and cloud traveler slots. Local play remains available while this system is being wired.</p><div class="account09x-actions"><button class="account09x-btn primary" id="backTitle">Back to Title</button>${pl ? '<button class="account09x-btn" id="backAshmere">Back to Ashmere</button>' : ''}</div></div><aside class="account09x-panel"><h3>Traveler Slots</h3><div class="account09x-slots"><div class="account09x-slot account09x-disabled"><strong>Cloud Slot 1</strong><small>Future account traveler slot.</small></div><div class="account09x-slot account09x-disabled"><strong>Cloud Slot 2</strong><small>Future alternate traveler slot.</small></div><div class="account09x-slot"><strong>Local Traveler</strong><small>${pl ? `${esc(pl.username)} • ${esc(pl.className || 'Wanderer')} • ${Number(pl.inventory?.roadToken || 0)} Road Tokens` : 'No local traveler yet.'}</small></div></div></aside></section></div></main>`;
    const back = document.getElementById('backTitle');
    if(back) back.onclick = () => window.LegendGameBootstrap?.title?.();
    const ash = document.getElementById('backAshmere');
    if(ash) ash.onclick = () => window.LegendGameBootstrap?.continueGame?.();
  }

  window.LegendAccountV09x = { renderAccount };
})();
