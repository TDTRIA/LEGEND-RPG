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
    const signedIn = !!session?.user;
    const name = prof?.displayName || pl?.username || session?.user?.user_metadata?.display_name || 'Ashmere Traveler';

    root().innerHTML = `
      <main class="account09x account09x-clean">
        <div class="account09x-wrap">
          <header class="account09x-header">
            <div>
              <div class="account09x-kicker">LEGEND Account</div>
              <h1>Profile</h1>
            </div>
            <div class="account09x-header-actions">
              <button class="account09x-btn" id="backTitle" type="button">Back to Realm</button>
              ${signedIn ? '<button class="account09x-btn danger" id="signOutBtn" type="button">Sign Out</button>' : ''}
            </div>
          </header>
          ${message ? `<p class="account09x-success">${esc(message)}</p>` : ''}

          ${signedIn ? `
            <section class="account09x-panel account09x-profile-card">
              <div class="account09x-avatar">${esc(String(name).slice(0,1)).toUpperCase()}</div>
              <div class="account09x-profile-main">
                <div class="account09x-kicker">Traveler Profile</div>
                <h2>${esc(name)}</h2>
                <p>${esc(sessionEmail(session))}</p>
              </div>
              <form class="account09x-profile-form" id="profileForm">
                <label for="displayName">Traveler Name</label>
                <div class="account09x-profile-edit"><input id="displayName" maxlength="28" value="${esc(name)}" autocomplete="nickname"><button class="account09x-btn primary" type="submit">Save Name</button></div>
              </form>
            </section>
          ` : authBox(session, prof)}

          <section class="account09x-panel">
            <div class="account09x-section-head">
              <div><div class="account09x-kicker">Your Journey</div><h2>Traveler</h2></div>
              ${pl ? '<button class="account09x-btn primary" id="continueTraveler" type="button">Continue Journey</button>' : '<button class="account09x-btn primary" id="newTraveler" type="button">New Traveler</button>'}
            </div>
            <div class="account09x-traveler-summary ${pl ? '' : 'empty'}">
              <div class="account09x-avatar small">${pl ? esc(String(pl.username || '?').slice(0,1)).toUpperCase() : '?'}</div>
              <div>
                <h3>${pl ? esc(pl.username || 'Unnamed Traveler') : 'No traveler yet'}</h3>
                <p>${pl ? `${esc(pl.className || pl.class || 'Traveler')} • ${esc(pl.town || 'Ashmere')} • Day ${pl.day || 1} • ${Number(pl.inventory?.roadToken || 0)} Road Tokens` : 'Create a traveler to begin your journey through Ashmere.'}</p>
              </div>
            </div>
          </section>

          <section class="account09x-panel">
            <div class="account09x-section-head"><div><div class="account09x-kicker">Cloud Save</div><h2>Traveler Slots</h2></div><span class="account09x-cloud-state">${signedIn && cloudCanUse ? 'Cloud Online' : signedIn ? 'Connecting…' : 'Sign in to use cloud saves'}</span></div>
            <div class="account09x-cloud-grid">
              ${[1,2].map(slot => {
                const row = cloudRows.find(item => Number(item.slot) === slot);
                return `<article class="account09x-cloud-slot"><div><strong>Cloud Slot ${slot}</strong><small id="cloudSlot${slot}Info">${row ? esc(row.display_name || 'Traveler') + ' • ' + fmtDate(row.updated_at) : 'Empty'}</small></div><div class="account09x-actions"><button class="account09x-btn" type="button" data-cloud-load="${slot}" ${cloudCanUse && row ? '' : 'disabled'}>Load</button><button class="account09x-btn primary" type="button" data-cloud-save="${slot}" ${cloudCanUse && pl ? '' : 'disabled'}>Save Here</button><button class="account09x-btn danger" type="button" data-cloud-delete="${slot}" ${cloudCanUse && row ? '' : 'disabled'}>Clear</button></div></article>`;
              }).join('')}
            </div>
          </section>
        </div>
      </main>`;

    const back = document.getElementById('backTitle');
    if(back) back.onclick = () => window.LegendGameBootstrap?.title?.();
    const continueTraveler = document.getElementById('continueTraveler');
    if(continueTraveler) continueTraveler.onclick = () => window.LegendGameBootstrap?.continueGame?.();
    const newTraveler = document.getElementById('newTraveler');
    if(newTraveler) newTraveler.onclick = () => window.LegendGameBootstrap?.newTraveler?.();

    const form = document.getElementById('profileForm');
    if(form) form.onsubmit = e => {
      e.preventDefault();
      const displayName = document.getElementById('displayName').value.trim() || pl?.username || 'Ashmere Traveler';
      saveProfile({ ...(prof || {}), displayName, email:sessionEmail(session), authUserId:session?.user?.id || null, activeTraveler:prof?.activeTraveler || snapshotTraveler(pl) });
      renderAccount('Profile saved.');
    };

    const signOutBtn = document.getElementById('signOutBtn');
    if(signOutBtn) signOutBtn.onclick = async () => {
      signOutBtn.disabled = true;
      signOutBtn.textContent = 'Signing Out...';
      const result = await signOut();
      renderAccount(result.message);
    };

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
  }

  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile, getSession, cloudSave, cloudLoad, cloudList, cloudDelete };
})();