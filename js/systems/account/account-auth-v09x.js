/* LEGEND v0.20.36 - Account authentication and auth-flow service.
 * Owns Supabase readiness/session/sign-in/sign-up/sign-out and the profile-metadata
 * effects of auth submissions. account-auth-view-v09x owns panel markup and DOM binding.
 */
(() => {
  function create(context = {}) {
    const {getClient,isConnected,getHealth,escapeHtml,getProfile,saveProfile,getLocalPlayer}=context;
    if(typeof getClient!=='function'||typeof isConnected!=='function'||typeof getHealth!=='function'||
      typeof escapeHtml!=='function'||typeof getProfile!=='function'||typeof saveProfile!=='function'||
      typeof getLocalPlayer!=='function')return null;
    const client=getClient,connected=isConnected,health=getHealth,esc=escapeHtml;
    const local=getLocalPlayer;
    const authView=window.LegendAccountAuthViewV09x?.create({escapeHtml:esc});
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

  function sessionEmail(session){ return session?.user?.email || ''; }

  function authBox(session, prof){
    if (authView?.renderAuthBox) {
      return authView.renderAuthBox({
        connected: connected(),
        session,
        profile: prof,
        readyText: supabaseReadyText(),
        sessionEmail
      });
    }
    return '<section class="account09x-panel account09x-auth-box"><p>Account access is unavailable. Refresh before retrying.</p></section>';
  }

    function bindAuthForm({ onComplete } = {}) {
      if (!authView?.bindAuthForm) return;
      authView.bindAuthForm({
        onComplete,
        onSubmit: async ({ mode, email, password, displayName }) => {
          if (mode === 'signup') {
            const chosenName = String(displayName || '').trim() || local()?.username || 'Ashmere Traveler';
            const result = await createAccount(email, password, chosenName);
            if (result.ok) {
              saveProfile({
                ...(getProfile() || {}),
                displayName: chosenName,
                email,
                authUserId: result.user?.id || result.session?.user?.id || null
              });
            }
            return result;
          }

          const result = await signIn(email, password);
          if (result.ok) {
            saveProfile({
              ...(getProfile() || {}),
              email,
              authUserId: result.user?.id || result.session?.user?.id || null
            });
          }
          return result;
        }
      });
    }

    return Object.freeze({getSession,refreshHealth,signOut,sessionEmail,authBox,bindAuthForm});
  }
  window.LegendAccountAuthV09x=Object.freeze({create});
})();
