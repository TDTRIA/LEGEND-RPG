// LEGEND: Roads of Ashmere v0.9.x - Account / Profile Screen
(() => {
  const PROFILE_KEY = 'legend-roads-of-ashmere-profile-v09x';
  const root = () => document.getElementById('root');
  const S = () => window.LegendStorage || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const local = () => S().loadPlayer?.() || null;

  function renderAccount(){
  function getProfile(){
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
    catch { return null; }
  }

  function saveProfile(profile){
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      ...profile,
      version: 'v0.9.x',
      updatedAt: new Date().toISOString()
    }));
  }

  function deleteProfile(){ localStorage.removeItem(PROFILE_KEY); }

  function snapshotTraveler(pl){
    if(!pl) return null;
    return {
      username: pl.username || 'Unnamed Traveler',
      className: pl.className || pl.class || 'Traveler',
      town: pl.town || 'Ashmere',
      day: pl.day || 1,
      roadTokens: Number(pl.inventory?.roadToken || 0),
      oldRoadClears: Number(pl.stats?.oldRoadClears || 0),
      monstersDefeated: Number(pl.stats?.monstersDefeated || 0),
      updatedAt: new Date().toISOString()
    };
  }

  function fmtDate(value){
    if(!value) return 'Not synced yet';
    try { return new Date(value).toLocaleString([], { dateStyle:'medium', timeStyle:'short' }); }
    catch { return 'Recently'; }
  }

  function connected(){ return !!window.LegendSupabaseV09x?.client; }

  function renderAccount(message = ''){
    const pl = local();
    const connected = !!window.LegendSupabaseV09x?.client;
    root().innerHTML = `<main class="account09x"><div class="account09x-wrap"><section class="account09x-hero"><div class="account09x-hero-content"><div class="account09x-kicker">LEGEND Account</div><h1>Profile</h1><p>Cloud profiles and multiple traveler slots are entering v0.9.x testing. This screen replaces the old Save Vault direction and prepares the game for real account progression.</p></div></section><section class="account09x-grid"><div class="account09x-panel"><h2>Account Status</h2><div class="account09x-status"><div class="account09x-stat"><strong>${connected ? 'Connected' : 'Not Connected'}</strong><span>Supabase</span></div><div class="account09x-stat"><strong>v0.9.x</strong><span>Account Layer</span></div><div class="account09x-stat"><strong>Coming Next</strong><span>Sign In</span></div><div class="account09x-stat"><strong>Coming Next</strong><span>Cloud Travelers</span></div></div><p class="account09x-note"><strong>Next pass:</strong> activate sign in, account creation, and cloud traveler slots. Local play remains available while this system is being wired.</p><div class="account09x-actions"><button class="account09x-btn primary" id="backTitle">Back to Title</button>${pl ? '<button class="account09x-btn" id="backAshmere">Back to Ashmere</button>' : ''}</div></div><aside class="account09x-panel"><h3>Traveler Slots</h3><div class="account09x-slots"><div class="account09x-slot account09x-disabled"><strong>Cloud Slot 1</strong><small>Future account traveler slot.</small></div><div class="account09x-slot account09x-disabled"><strong>Cloud Slot 2</strong><small>Future alternate traveler slot.</small></div><div class="account09x-slot"><strong>Local Traveler</strong><small>${pl ? `${esc(pl.username)} • ${esc(pl.className || 'Wanderer')} • ${Number(pl.inventory?.roadToken || 0)} Road Tokens` : 'No local traveler yet.'}</small></div></div></aside></section></div></main>`;
    const prof = getProfile();
    const snap = prof?.activeTraveler || snapshotTraveler(pl);
    root().innerHTML = `
      <main class="account09x account09x-finished">
        <div class="account09x-wrap">
          <section class="account09x-hero">
            <div class="account09x-hero-content">
              <div class="account09x-kicker">LEGEND Account</div>
              <h1>Profile</h1>
              <p>Claim a local profile, track the active traveler, and prepare this save for cloud traveler slots. Supabase hooks can plug in here without replacing local play.</p>
            </div>
          </section>

          ${message ? `<p class="account09x-success">${esc(message)}</p>` : ''}

          <section class="account09x-grid">
            <div class="account09x-panel">
              <h2>Account Status</h2>
              <div class="account09x-status account09x-status-grid">
                <div class="account09x-stat"><strong>${connected() ? 'Connected' : 'Not Connected'}</strong><span>Supabase</span></div>
                <div class="account09x-stat"><strong>${prof ? 'Profile Ready' : 'No Profile'}</strong><span>Local Account</span></div>
                <div class="account09x-stat"><strong>${pl ? 'Linked' : 'No Traveler'}</strong><span>Active Traveler</span></div>
                <div class="account09x-stat"><strong>v0.9.x</strong><span>Account Layer</span></div>
              </div>

              <form class="account09x-form" id="profileForm">
                <div class="account09x-field">
                  <label for="displayName">Profile Name</label>
                  <input id="displayName" maxlength="28" value="${esc(prof?.displayName || pl?.username || '')}" placeholder="Ashmere profile name">
                </div>
                <div class="account09x-field">
                  <label for="profileEmail">Email / Login Handle</label>
                  <input id="profileEmail" maxlength="72" value="${esc(prof?.email || '')}" placeholder="Optional for now">
                </div>
                <p class="account09x-note"><strong>v0.9.x note:</strong> This saves a local profile shell now. Real authentication and cloud sync are intentionally gated until Supabase credentials and tables are wired.</p>
                <div class="account09x-actions">
                  <button class="account09x-btn primary" id="saveProfile" type="submit">Save Profile</button>
                  <button class="account09x-btn" id="syncTraveler" type="button" ${pl ? '' : 'disabled'}>Link Active Traveler</button>
                  ${prof ? '<button class="account09x-btn danger" id="clearProfile" type="button">Clear Profile</button>' : ''}
                </div>
              </form>

              <div class="account09x-actions account09x-nav-actions">
                <button class="account09x-btn primary" id="backTitle">Back to Title</button>
                ${pl ? '<button class="account09x-btn" id="backAshmere">Back to Ashmere</button>' : '<button class="account09x-btn" id="newTraveler">New Traveler</button>'}
              </div>
            </div>

            <aside class="account09x-panel">
              <h3>Traveler Slots</h3>
              <div class="account09x-slots">
                <button class="account09x-slot ${snap ? '' : 'account09x-disabled'}" id="localSlot" type="button">
                  <strong>${snap ? esc(snap.username) : 'Local Traveler'}</strong>
                  <small>${snap ? `${esc(snap.className)} • ${esc(snap.town)} • Day ${snap.day} • ${snap.roadTokens} Road Tokens` : 'No local traveler linked yet.'}</small>
                </button>
                <div class="account09x-slot account09x-disabled"><strong>Cloud Slot 1</strong><small>Reserved for Supabase traveler sync.</small></div>
                <div class="account09x-slot account09x-disabled"><strong>Cloud Slot 2</strong><small>Reserved for alternate traveler saves.</small></div>
              </div>

              <h3 class="account09x-subhead">Save Readiness</h3>
              <div class="account09x-readiness">
                <div><span>Local Profile</span><strong>${prof ? 'Ready' : 'Missing'}</strong></div>
                <div><span>Traveler Snapshot</span><strong>${snap ? 'Ready' : 'Missing'}</strong></div>
                <div><span>Last Profile Update</span><strong>${fmtDate(prof?.updatedAt)}</strong></div>
                <div><span>Last Traveler Link</span><strong>${fmtDate(snap?.updatedAt)}</strong></div>
              </div>
            </aside>
          </section>
        </div>
      </main>`;

    const back = document.getElementById('backTitle');
    if(back) back.onclick = () => window.LegendGameBootstrap?.title?.();
    const ash = document.getElementById('backAshmere');
    if(ash) ash.onclick = () => window.LegendGameBootstrap?.continueGame?.();
    const newTraveler = document.getElementById('newTraveler');
    if(newTraveler) newTraveler.onclick = () => window.LegendGameBootstrap?.newTraveler?.();
    const form = document.getElementById('profileForm');
    if(form) form.onsubmit = e => {
      e.preventDefault();
      const displayName = document.getElementById('displayName').value.trim() || pl?.username || 'Ashmere Traveler';
      const email = document.getElementById('profileEmail').value.trim();
      saveProfile({ ...(prof || {}), displayName, email, activeTraveler: prof?.activeTraveler || snapshotTraveler(pl) });
      renderAccount('Profile saved.');
    };
    const sync = document.getElementById('syncTraveler');
    if(sync) sync.onclick = () => {
      const current = getProfile() || { displayName: pl?.username || 'Ashmere Traveler', email: '' };
      saveProfile({ ...current, activeTraveler: snapshotTraveler(pl) });
      renderAccount('Active traveler linked to profile.');
    };
    const clear = document.getElementById('clearProfile');
    if(clear) clear.onclick = () => {
      if(confirm('Clear local profile shell? Your traveler save will not be deleted.')){
        deleteProfile();
        renderAccount('Profile cleared. Traveler save kept.');
      }
    };
    const localSlot = document.getElementById('localSlot');
    if(localSlot && pl) localSlot.onclick = () => window.LegendGameBootstrap?.continueGame?.();
  }

  window.LegendAccountV09x = { renderAccount };
})();
  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile };
})();
