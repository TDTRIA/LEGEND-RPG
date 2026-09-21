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

  const CLOUD_TABLE = 'traveler_slots';
  const CLOUD_SLOT_COUNT = 2;

  function cloudReady(session){
    return !!(session?.user && connected() && health()?.ok !== false);
  }

  function cloudErrorMessage(err){
    const message = err?.message || 'Cloud save failed.';
    if(/traveler_slots|relation .* does not exist|schema cache/i.test(message)){
      return 'Cloud traveler storage is not installed yet. Run supabase/traveler-slots.sql in the Supabase SQL editor once.';
    }
    return message;
  }

  async function cloudList(session){
    if(!cloudReady(session)) return { ok:false, rows:[] };
    try {
      const result = await client().from(CLOUD_TABLE).select('slot,display_name,updated_at').eq('user_id', session.user.id).order('slot', { ascending:true });
      if(result.error) throw result.error;
      return { ok:true, rows:result.data || [] };
    } catch(err){
      console.warn('LEGEND cloud list failed:', err);
      return { ok:false, rows:[], message:cloudErrorMessage(err) };
    }
  }

  async function cloudSave(session, slot){
    const pl = local();
    if(!cloudReady(session)) return { ok:false, message:'Sign in before saving a traveler to the cloud.' };
    if(!pl) return { ok:false, message:'Create a traveler before saving a cloud slot.' };
    if(slot < 1 || slot > CLOUD_SLOT_COUNT) return { ok:false, message:'Invalid cloud traveler slot.' };
    try {
      const result = await client().from(CLOUD_TABLE).upsert({ user_id:session.user.id, slot, display_name:pl.username || 'Unnamed Traveler', traveler_data:pl, updated_at:new Date().toISOString() }, { onConflict:'user_id,slot' });
      if(result.error) throw result.error;
      return { ok:true, message:'Cloud Slot ' + slot + ' saved.' };
    } catch(err){
      console.warn('LEGEND cloud save failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }

  async function cloudLoad(session, slot){
    if(!cloudReady(session)) return { ok:false, message:'Sign in before loading a cloud traveler.' };
    try {
      const result = await client().from(CLOUD_TABLE).select('traveler_data').eq('user_id', session.user.id).eq('slot', slot).maybeSingle();
      if(result.error) throw result.error;
      if(!result.data?.traveler_data) return { ok:false, message:'Cloud Slot ' + slot + ' is empty.' };
      S().savePlayer?.(result.data.traveler_data);
      return { ok:true, message:'Cloud Slot ' + slot + ' loaded into this browser.' };
    } catch(err){
      console.warn('LEGEND cloud load failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }

  async function cloudDelete(session, slot){
    if(!cloudReady(session)) return { ok:false, message:'Sign in before clearing a cloud traveler.' };
    try {
      const result = await client().from(CLOUD_TABLE).delete().eq('user_id', session.user.id).eq('slot', slot);
      if(result.error) throw result.error;
      return { ok:true, message:'Cloud Slot ' + slot + ' cleared.' };
    } catch(err){
      console.warn('LEGEND cloud delete failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }
  function fmtDate(value){
    if(!value) return 'Not synced yet';
    try { return new Date(value).toLocaleString([], { dateStyle:'medium', timeStyle:'short' }); }
    catch { return 'Recently'; }
  }

  function client(){ return window.LegendSupabaseV09x?.client || null; }
  function connected(){ return !!client(); }
  function health(){ return window.LegendSupabaseV09x?.health || null; }
  function supabaseReadyText(){
    if(!window.supabase) return 'CDN library missing';
    if(!window.LegendSupabaseV09x) return 'Config not loaded';
    if(!connected()) return 'Client unavailable';
    const h = health();
    if(h?.ok === true) return 'Online';
    if(h?.ok === false) return h.message || 'Service unavailable';
    return 'Checking service';
  }

  function authRedirectUrl(){
    const fallback = 'https://tdtria.github.io/LEGEND-RPG/';
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      url.search = '';
      if(!url.pathname.endsWith('/')){
        const parts = url.pathname.split('/');
        parts.pop();
        url.pathname = parts.join('/') + '/';
      }
      return url.toString();
    } catch {
      return fallback;
    }
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

  async function refreshHealth(){
    const check = window.LegendSupabaseV09x?.checkHealth;
    if(typeof check !== 'function') return health();
    try { return await check(); }
    catch(err){
      console.warn('LEGEND Supabase health check failed:', err);
      return health();
    }
  }

  async function createAccount(email, password, displayName){
    const c = client();
    if(!c?.auth?.signUp) return { ok:false, message:`Supabase is not ready yet (${supabaseReadyText()}).` };
    if(!email || !password) return { ok:false, message:'Enter an email and password.' };
    if(password.length < 6) return { ok:false, message:'Password must be at least 6 characters.' };
    try {
      console.info('LEGEND auth: creating account for', email, 'redirect:', authRedirectUrl());
      const result = await c.auth.signUp({
        email,
        password,
        options:{
          emailRedirectTo: authRedirectUrl(),
          data:{ display_name:displayName || 'Ashmere Traveler' }
        }
      });
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
      const current = getProfile();
      if(current) saveProfile({ ...current, authUserId:null });
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
    const debug = `<p class="account09x-note account09x-debug"><strong>Connection:</strong> ${esc(supabaseReadyText())}</p>`;
    if(!connected()) return `<section class="account09x-panel account09x-auth-box"><div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2>Sign In</h2><p>Sign in to access your account and cloud traveler saves.</p></div>${debug}<p class="account09x-note"><strong>Offline:</strong> Supabase did not load. Local profile and traveler saves still work.</p></section>`;
    if(session?.user) return `<section class="account09x-panel account09x-auth-box"><div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2>Signed In</h2><p class="account09x-session-email">${esc(sessionEmail(session))}</p></div>${debug}<div class="account09x-actions"><button class="account09x-btn danger" id="signOutBtn" type="button">Sign Out</button></div></section>`;
    return `<section class="account09x-panel account09x-auth-box">
      <div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2 id="authTitle">Sign In</h2><p id="authIntro">Sign in to continue your journey.</p></div>
      <div class="account09x-auth-tabs" role="tablist" aria-label="Account access">
        <button class="account09x-auth-tab active" id="authSignInTab" type="button">Sign In</button>
        <button class="account09x-auth-tab" id="authSignUpTab" type="button">Sign Up</button>
      </div>
      <form class="account09x-form account09x-auth-form" id="authForm">
        <div class="account09x-field"><label for="authEmail">Email</label><input id="authEmail" type="email" maxlength="72" value="${esc(prof?.email || '')}" placeholder="you@example.com" autocomplete="email" required></div>
        <div class="account09x-field account09x-signup-only" hidden><label for="authDisplayName">Traveler Name</label><input id="authDisplayName" type="text" maxlength="28" placeholder="Ashmere Traveler" autocomplete="nickname"></div>
        <div class="account09x-field"><label for="authPassword">Password</label><input id="authPassword" type="password" minlength="6" placeholder="Minimum 6 characters" autocomplete="current-password" required></div>
        <button class="account09x-btn primary account09x-auth-submit" id="authSubmitBtn" type="submit">Sign In</button>
        <p class="account09x-auth-switch" id="authSwitchText">New to Ashmere? <button id="authSwitchBtn" type="button">Create an account</button></p>
      </form>
      ${debug}
    </section>`;
  }


  async function renderAccount(message = ''){
    await refreshHealth();
    const session = await getSession();
    const pl = local();
    const prof = getProfile();
    const snap = prof?.activeTraveler || snapshotTraveler(pl);
    const cloudCanUse = cloudReady(session);
    const cloudResult = await cloudList(session);
    const cloudRows = cloudResult.rows || [];
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
<div class="account09x-cloud-grid"><article class="account09x-slot"><strong>Cloud Slot 1</strong><small id="cloudSlot1Info">Loading cloud slot...</small><div class="account09x-actions"><button class="account09x-btn" type="button" data-cloud-load="1" disabled>Load</button><button class="account09x-btn primary" type="button" data-cloud-save="1" disabled>Save Here</button><button class="account09x-btn danger" type="button" data-cloud-delete="1" disabled>Clear</button></div></article><article class="account09x-slot"><strong>Cloud Slot 2</strong><small id="cloudSlot2Info">Loading cloud slot...</small><div class="account09x-actions"><button class="account09x-btn" type="button" data-cloud-load="2" disabled>Load</button><button class="account09x-btn primary" type="button" data-cloud-save="2" disabled>Save Here</button><button class="account09x-btn danger" type="button" data-cloud-delete="2" disabled>Clear</button></div></article></div>
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
    let authMode = 'signin';
    const setAuthMode = mode => {
      authMode = mode === 'signup' ? 'signup' : 'signin';
      const signup = authMode === 'signup';
      const title = document.getElementById('authTitle');
      const intro = document.getElementById('authIntro');
      const submit = document.getElementById('authSubmitBtn');
      const switchText = document.getElementById('authSwitchText');
      const display = document.querySelector('.account09x-signup-only');
      const signInTab = document.getElementById('authSignInTab');
      const signUpTab = document.getElementById('authSignUpTab');
      if(title) title.textContent = signup ? 'Create Account' : 'Sign In';
      if(intro) intro.textContent = signup ? 'Create your Ashmere account.' : 'Sign in to continue your journey.';
      if(submit) submit.textContent = signup ? 'Create Account' : 'Sign In';
      if(switchText) switchText.innerHTML = signup ? 'Already have an account? <button id="authSwitchBtn" type="button">Sign in</button>' : 'New to Ashmere? <button id="authSwitchBtn" type="button">Create an account</button>';
      if(display) display.hidden = !signup;
      if(signInTab) signInTab.classList.toggle('active', !signup);
      if(signUpTab) signUpTab.classList.toggle('active', signup);
      const switchBtn = document.getElementById('authSwitchBtn');
      if(switchBtn) switchBtn.onclick = () => setAuthMode(signup ? 'signin' : 'signup');
    };
    const signInTab = document.getElementById('authSignInTab');
    const signUpTab = document.getElementById('authSignUpTab');
    if(signInTab) signInTab.onclick = () => setAuthMode('signin');
    if(signUpTab) signUpTab.onclick = () => setAuthMode('signup');
    setAuthMode('signin');
    if(authForm) authForm.onsubmit = async e => {
      e.preventDefault();
      const submit = document.getElementById('authSubmitBtn');
      if(submit){ submit.disabled = true; submit.textContent = authMode === 'signup' ? 'Creating...' : 'Signing In...'; }
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      let result;
      if(authMode === 'signup'){
        const displayName = document.getElementById('authDisplayName').value.trim() || pl?.username || 'Ashmere Traveler';
        result = await createAccount(email, password, displayName);
        if(result.ok) saveProfile({ ...(getProfile() || {}), displayName, email, authUserId: result.user?.id || result.session?.user?.id || null });
      } else {
        result = await signIn(email, password);
        if(result.ok) saveProfile({ ...(getProfile() || {}), email, authUserId: result.user?.id || result.session?.user?.id || null });
      }
      renderAccount(result.message);
    };
    const signOutBtn = document.getElementById('signOutBtn');
    if(signOutBtn) signOutBtn.onclick = async () => {
      signOutBtn.disabled = true;
      signOutBtn.textContent = 'Signing Out...';
      const result = await signOut();
      renderAccount(result.message);
    };
    [1,2].forEach(slot => {
      const row = cloudRows.find(item => Number(item.slot) === slot);
      const info = document.getElementById('cloudSlot' + slot + 'Info');
      if(info) info.textContent = row ? ((row.display_name || 'Traveler') + ' • ' + fmtDate(row.updated_at)) : 'Empty cloud traveler slot.';
      document.querySelectorAll('[data-cloud-load="' + slot + '"],[data-cloud-save="' + slot + '"],[data-cloud-delete="' + slot + '"]').forEach(btn => {
        btn.disabled = !cloudCanUse || (btn.dataset.cloudLoad || btn.dataset.cloudDelete ? !row : false);
      });
    });
    document.querySelectorAll('[data-cloud-load]').forEach(btn => btn.onclick = async () => {
      const result = await cloudLoad(session, Number(btn.dataset.cloudLoad));
      if(result.ok) window.LegendGameBootstrap?.continueGame?.();
      else renderAccount(result.message);
    });
    document.querySelectorAll('[data-cloud-save]').forEach(btn => btn.onclick = async () => {
      const result = await cloudSave(session, Number(btn.dataset.cloudSave));
      renderAccount(result.message);
    });
    document.querySelectorAll('[data-cloud-delete]').forEach(btn => btn.onclick = async () => {
      const slot = Number(btn.dataset.cloudDelete);
      if(confirm('Clear Cloud Slot ' + slot + '? This does not delete your local traveler.')){
        const result = await cloudDelete(session, slot);
        renderAccount(result.message);
      }
    });
    const localSlot = document.getElementById('localSlot');
    if(localSlot && pl) localSlot.onclick = () => window.LegendGameBootstrap?.continueGame?.();
  }

  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile, getSession, cloudSave, cloudLoad, cloudList, cloudDelete };
})();