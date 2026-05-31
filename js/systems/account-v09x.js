// LEGEND: Roads of Ashmere v0.9.x - Account / Profile Screen
(() => {
  const PROFILE_KEY = 'legend-roads-of-ashmere-profile-v09x';
  const root = () => document.getElementById('root');
  const S = () => window.LegendStorage || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const local = () => S().loadPlayer?.() || null;

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

  function client(){ return window.LegendSupabaseV09x?.client || null; }
  function connected(){ return !!client(); }

  async function getSession(){
    const c = client();
    if(!c?.auth?.getSession) return null;
    try {
      const result = await c.auth.getSession();
      return result?.data?.session || null;
    } catch(err){
      console.warn('LEGEND account session check failed:', err);
      return null;
    }
  }

  function sessionLabel(session){
    if(!connected()) return 'Offline';
    return session?.user ? 'Signed In' : 'Ready';
  }

  function sessionEmail(session){ return session?.user?.email || ''; }

  async function renderAccount(message = ''){
    const session = await getSession();
    const pl = local();
    const prof = getProfile();
    const snap = prof?.activeTraveler || snapshotTraveler(pl);
    root().innerHTML = `
      <main class="account09x account09x-finished">
        <div class="account09x-wrap">
          <section class="account09x-hero">
            <div class="account09x-hero-content">
              <div class="account09x-kicker">LEGEND Account</div>
              <h1>Profile</h1>
              <p>Claim a local profile, track the active traveler, and prepare this save for cloud traveler slots. Supabase identity is now detected when available.</p>
            </div>
          </section>

          ${message ? `<p class="account09x-success">${esc(message)}</p>` : ''}

          <section class="account09x-grid">
            <div class="account09x-panel">
              <h2>Account Status</h2>
              <div class="account09x-status account09x-status-grid">
                <div class="account09x-stat"><strong>${sessionLabel(session)}</strong><span>Supabase Auth</span></div>
                <div class="account09x-stat"><strong>${prof ? 'Profile Ready' : 'No Profile'}</strong><span>Local Account</span></div>
                <div class="account09x-stat"><strong>${pl ? 'Linked' : 'No Traveler'}</strong><span>Active Traveler</span></div>
                <div class="account09x-stat"><strong>${session?.user ? 'Unlocked' : 'Staged'}</strong><span>Account Rewards</span></div>
              </div>

              ${session?.user ? `<p class="account09x-success account09x-session-card">Signed in as ${esc(sessionEmail(session))}</p>` : `<p class="account09x-note"><strong>Sign-in staged:</strong> Supabase is ${connected() ? 'loaded and ready' : 'offline or not loaded'}. The next patch will add the sign-in button flow.</p>`}

              <form class="account09x-form" id="profileForm">
                <div class="account09x-field">
                  <label for="displayName">Profile Name</label>
                  <input id="displayName" maxlength="28" value="${esc(prof?.displayName || pl?.username || '')}" placeholder="Ashmere profile name">
                </div>
                <div class="account09x-field">
                  <label for="profileEmail">Email / Login Handle</label>
                  <input id="profileEmail" maxlength="72" value="${esc(prof?.email || sessionEmail(session) || '')}" placeholder="Optional for now">
                </div>
                <p class="account09x-note"><strong>v0.9.x note:</strong> This still saves a local profile shell. Cloud saves and tester rewards stay staged until the account flow is complete.</p>
                <div class="account09x-actions">
                  <button class="account09x-btn primary" id="saveProfile" type="submit">Save Profile</button>
                  <button class="account09x-btn" id="syncTraveler" type="button" ${pl ? '' : 'disabled'}>Link Active Traveler</button>
                  ${prof ? '<button class="account09x-btn danger" id="clearProfile" type="button">Clear Profile</button>' : ''}
                </div>
              </form>

              <div class="account09x-actions account09x-nav-actions">
                <button class="account09x-btn primary" id="backTitle">Back to Realm Portal</button>
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
                <div><span>Supabase Session</span><strong>${session?.user ? 'Signed In' : connected() ? 'Ready' : 'Offline'}</strong></div>
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
      const email = document.getElementById('profileEmail').value.trim() || sessionEmail(session);
      saveProfile({ ...(prof || {}), displayName, email, authUserId: session?.user?.id || null, activeTraveler: prof?.activeTraveler || snapshotTraveler(pl) });
      renderAccount('Profile saved.');
    };
    const sync = document.getElementById('syncTraveler');
    if(sync) sync.onclick = () => {
      const current = getProfile() || { displayName: pl?.username || 'Ashmere Traveler', email: sessionEmail(session) || '' };
      saveProfile({ ...current, authUserId: session?.user?.id || null, activeTraveler: snapshotTraveler(pl) });
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

  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile, getSession };
})();