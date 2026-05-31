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
  function supabaseReadyText(){
    if(!window.supabase) return 'CDN library missing';
    if(!window.LegendSupabaseV09x) return 'Config not loaded';
    if(!connected()) return 'Client unavailable';
    return 'Client ready';
  }

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

  async function createAccount(email, password, displayName){
    const c = client();
    if(!c?.auth?.signUp) return { ok:false, message:`Supabase is not ready yet (${supabaseReadyText()}).` };
    if(!email || !password) return { ok:false, message:'Enter an email and password.' };
    if(password.length < 6) return { ok:false, message:'Password must be at least 6 characters.' };
    try {
      console.info('LEGEND auth: creating account for', email);
      const result = await c.auth.signUp({ email, password, options:{ data:{ display_name:displayName || 'Ashmere Traveler' } } });
      if(result.error) throw result.error;
      return { ok:true, session:result.data?.session || null, user:result.data?.user || null, message: result.data?.session ? 'Account created and signed in.' : 'Account created. Check your email if confirmation is required.' };
    } catch(err){
      console.warn('LEGEND auth create account failed:', err);
      return { ok:false, message:`Create account failed: ${err.message || 'Unknown Supabase error.'}` };
    }
  }

  async function signIn(email, password){
    const c = client();
    if(!c?.auth?.signInWithPassword) return { ok:false, message:`Supabase is not ready yet (${supabaseReadyText()}).` };
    if(!email || !password) return { ok:false, message:'Enter an email and password.' };
    try {
      console.info('LEGEND auth: signing in', email);
      const result = await c.auth.signInWithPassword({ email, password });
      if(result.error) throw result.error;
      return { ok:true, session:result.data?.session || null, user:result.data?.user || null, message:'Signed in.' };
    } catch(err){
      console.warn('LEGEND auth sign in failed:', err);
      return { ok:false, message:`Sign in failed: ${err.message || 'Unknown Supabase error.'}` };
    }
  }

  async function signOut(){
    const c = client();
    if(!c?.auth?.signOut) return { ok:false, message:`Supabase is not ready yet (${supabaseReadyText()}).` };
    try {
      const result = await c.auth.signOut();
      if(result.error) throw result.error;
      return { ok:true, message:'Signed out. Local traveler save kept.' };
    } catch(err){
      return { ok:false, message:`Could not sign out: ${err.message || 'Unknown Supabase error.'}` };
    }
  }

  function sessionLabel(session){
    if(!connected()) return 'Offline';
    return session?.user ? 'Signed In' : 'Ready';
  }

  function sessionEmail(session){ return session?.user?.email || ''; }

  function authBox(session, prof){
    const debug = `<p class="account09x-note"><strong>Connection:</strong> ${esc(supabaseReadyText())}${window.LegendSupabaseV09x?.url ? ` • ${esc(window.LegendSupabaseV09x.url)}` : ''}</p>`;
    if(!connected()) return `<section class="account09x-panel account09x-auth-box"><h2>Realm Sign-In</h2>${debug}<p class="account09x-note"><strong>Offline:</strong> Supabase did not load. Local profile and traveler saves still work.</p></section>`;
    if(session?.user) return `<section class="account09x-panel account09x-auth-box"><h2>Realm Sign-In</h2>${debug}<p class="account09x-success account09x-session-card">Signed in as ${esc(sessionEmail(session))}</p><div class="account09x-actions"><button class="account09x-btn danger" id="signOutBtn" type="button">Sign Out</button></div><p class="account09x-note"><strong>Next:</strong> Cloud traveler slots and tester rewards will use this signed-in account.</p></section>`;
    return `<section class="account09x-panel account09x-auth-box"><h2>Realm Sign-In</h2>${debug}<form class="account09x-form" id="authForm"><div class="account09x-field"><label for="authEmail">Email</label><input id="authEmail" type="email" maxlength="72" value="${esc(prof?.email || '')}" placeholder="you@example.com" autocomplete="email"></div><div class="account09x-field"><label for="authPassword">Password</label><input id="authPassword" type="password" minlength="6" placeholder="Minimum 6 characters" autocomplete="current-password"></div><div class="account09x-actions"><button class="account09x-btn primary" id="signInBtn" type="submit">Sign In</button><button class="account09x-btn" id="createAccountBtn" type="button">Create Account</button></div><p class="account09x-note"><strong>Debug:</strong> If nothing happens, open DevTools Console and look for messages starting with <code>LEGEND auth</code>.</p></form></section>`;
  }

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
              <p>Claim a local profile, track the active traveler, sign in with an account, and prepare this save for cloud traveler slots.</p>
            </div>
          </section>
          ${message ? `<p class="account09x-success">${esc(message)}</p>` : ''}
          <section class="account09x-grid account09x-grid-wide">
            <div class="account09x-panel">
              <h2>Account Status</h2>
              <div class="account09x-status account09x-status-grid">
                <div class="account09x-stat"><strong>${sessionLabel(session)}</strong><span>Supabase Auth</span></div>
                <div class="account09x-stat"><strong>${prof ? 'Profile Ready' : 'No Profile'}</strong><span>Local Account</span></div>
                <div class="account09x-stat"><strong>${pl ? 'Linked' : 'No Traveler'}</strong><span>Active Traveler</span></div>
                <div class="account09x-stat"><strong>${session?.user ? 'Unlocked' : 'Staged'}</strong><span>Account Rewards</span></div>
              </div>
              <form class="account09x-form" id="profileForm">
                <div class="account09x-field"><label for="displayName">Profile Name</label><input id="displayName" maxlength="28" value="${esc(prof?.displayName || pl?.username || '')}" placeholder="Ashmere profile name"></div>
                <div class="account09x-field"><label for="profileEmail">Email / Login Handle</label><input id="profileEmail" maxlength="72" value="${esc(prof?.email || sessionEmail(session) || '')}" placeholder="Optional for now"></div>
                <p class="account09x-note"><strong>v0.9.x note:</strong> This still saves a local profile shell. Cloud saves and tester rewards stay staged until the account tables are ready.</p>
                <div class="account09x-actions"><button class="account09x-btn primary" id="saveProfile" type="submit">Save Profile</button><button class="account09x-btn" id="syncTraveler" type="button" ${pl ? '' : 'disabled'}>Link Active Traveler</button>${prof ? '<button class="account09x-btn danger" id="clearProfile" type="button">Clear Profile</button>' : ''}</div>
              </form>
              <div class="account09x-actions account09x-nav-actions"><button class="account09x-btn primary" id="backTitle">Back to Realm Portal</button>${pl ? '<button class="account09x-btn" id="backAshmere">Back to Ashmere</button>' : '<button class="account09x-btn" id="newTraveler">New Traveler</button>'}</div>
            </div>
            ${authBox(session, prof)}
            <aside class="account09x-panel">
              <h3>Traveler Slots</h3>
              <div class="account09x-slots">
                <button class="account09x-slot ${snap ? '' : 'account09x-disabled'}" id="localSlot" type="button"><strong>${snap ? esc(snap.username) : 'Local Traveler'}</strong><small>${snap ? `${esc(snap.className)} • ${esc(snap.town)} • Day ${snap.day} • ${snap.roadTokens} Road Tokens` : 'No local traveler linked yet.'}</small></button>
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
    const authForm = document.getElementById('authForm');
    if(authForm) authForm.onsubmit = async e => {
      e.preventDefault();
      const signInBtn = document.getElementById('signInBtn');
      if(signInBtn){ signInBtn.disabled = true; signInBtn.textContent = 'Signing In...'; }
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const result = await signIn(email, password);
      if(result.ok) saveProfile({ ...(getProfile() || {}), email, authUserId: result.user?.id || result.session?.user?.id || null });
      renderAccount(result.message);
    };
    const createBtn = document.getElementById('createAccountBtn');
    if(createBtn) createBtn.onclick = async () => {
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const displayName = document.getElementById('displayName')?.value.trim() || pl?.username || 'Ashmere Traveler';
      const result = await createAccount(email, password, displayName);
      if(result.ok) saveProfile({ ...(getProfile() || {}), displayName, email, authUserId: result.user?.id || result.session?.user?.id || null });
      renderAccount(result.message);
    };
    const signOutBtn = document.getElementById('signOutBtn');
    if(signOutBtn) signOutBtn.onclick = async () => {
      signOutBtn.disabled = true;
      signOutBtn.textContent = 'Signing Out...';
      const result = await signOut();
      renderAccount(result.message);
    };
    const localSlot = document.getElementById('localSlot');
    if(localSlot && pl) localSlot.onclick = () => window.LegendGameBootstrap?.continueGame?.();
  }

  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile, getSession };
})();