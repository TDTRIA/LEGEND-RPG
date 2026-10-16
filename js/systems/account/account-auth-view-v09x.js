/* LEGEND account authentication panel view.
 * Owns account-panel markup, mode toggles, and form event binding.
 * Supabase calls and profile metadata updates are injected callbacks.
 */
(() => {
  function create(config = {}) {
    const { escapeHtml } = config;
    if (typeof escapeHtml !== 'function') return null;
    const esc = escapeHtml;

    function renderAuthBox({ connected = false, session = null, profile = null, readyText = '', sessionEmail = () => '' } = {}) {
      const debug = `<p class="account09x-note account09x-debug"><strong>Connection:</strong> ${esc(readyText)}</p>`;
      if (!connected) {
        return `<section class="account09x-panel account09x-auth-box"><div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2>Sign In</h2><p>Sign in to access your account and cloud traveler saves.</p></div>${debug}<p class="account09x-note"><strong>Offline:</strong> Supabase did not load. Local profile and traveler saves still work.</p></section>`;
      }
      if (session?.user) {
        return `<section class="account09x-panel account09x-auth-box"><div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2>Signed In</h2><p class="account09x-session-email">${esc(sessionEmail(session))}</p></div>${debug}<div class="account09x-actions"><button class="account09x-btn danger" id="signOutBtn" type="button">Sign Out</button></div></section>`;
      }
      return `<section class="account09x-panel account09x-auth-box">
        <div class="account09x-auth-head"><div class="account09x-kicker">Ashmere Account</div><h2 id="authTitle">Sign In</h2><p id="authIntro">Sign in to continue your journey.</p></div>
        <div class="account09x-auth-tabs" role="tablist" aria-label="Account access">
          <button class="account09x-auth-tab active" id="authSignInTab" type="button">Sign In</button>
          <button class="account09x-auth-tab" id="authSignUpTab" type="button">Sign Up</button>
        </div>
        <form class="account09x-form account09x-auth-form" id="authForm">
          <div class="account09x-field"><label for="authEmail">Email</label><input id="authEmail" type="email" maxlength="72" value="${esc(profile?.email || '')}" placeholder="you@example.com" autocomplete="email" required></div>
          <div class="account09x-field account09x-signup-only" hidden><label for="authDisplayName">Traveler Name</label><input id="authDisplayName" type="text" maxlength="28" placeholder="Ashmere Traveler" autocomplete="nickname"></div>
          <div class="account09x-field"><label for="authPassword">Password</label><input id="authPassword" type="password" minlength="6" placeholder="Minimum 6 characters" autocomplete="current-password" required></div>
          <button class="account09x-btn primary account09x-auth-submit" id="authSubmitBtn" type="submit">Sign In</button>
          <p class="account09x-auth-switch" id="authSwitchText">New to Ashmere? <button id="authSwitchBtn" type="button">Create an account</button></p>
        </form>
        ${debug}
      </section>`;
    }

    function bindAuthForm({ onSubmit, onComplete } = {}) {
      const authForm = document.getElementById('authForm');
      if (!authForm) return;
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
        if (title) title.textContent = signup ? 'Create Account' : 'Sign In';
        if (intro) intro.textContent = signup ? 'Create your Ashmere account.' : 'Sign in to continue your journey.';
        if (submit) submit.textContent = signup ? 'Create Account' : 'Sign In';
        if (switchText) switchText.innerHTML = signup
          ? 'Already have an account? <button id="authSwitchBtn" type="button">Sign in</button>'
          : 'New to Ashmere? <button id="authSwitchBtn" type="button">Create an account</button>';
        if (display) display.hidden = !signup;
        if (signInTab) signInTab.classList.toggle('active', !signup);
        if (signUpTab) signUpTab.classList.toggle('active', signup);
        document.getElementById('authSwitchBtn')?.addEventListener('click', () => setAuthMode(signup ? 'signin' : 'signup'));
      };

      document.getElementById('authSignInTab')?.addEventListener('click', () => setAuthMode('signin'));
      document.getElementById('authSignUpTab')?.addEventListener('click', () => setAuthMode('signup'));
      setAuthMode('signin');

      authForm.onsubmit = async event => {
        event.preventDefault();
        const submit = document.getElementById('authSubmitBtn');
        if (submit) {
          submit.disabled = true;
          submit.textContent = authMode === 'signup' ? 'Creating...' : 'Signing In...';
        }
        const email = document.getElementById('authEmail')?.value.trim() || '';
        const password = document.getElementById('authPassword')?.value || '';
        const displayName = document.getElementById('authDisplayName')?.value.trim() || '';
        let result;
        try {
          result = await onSubmit?.({ mode: authMode, email, password, displayName });
        } catch (error) {
          result = { ok: false, message: error?.message || 'Account request failed.' };
        }
        onComplete?.(result?.message || 'Account request finished.');
      };
    }

    return Object.freeze({ renderAuthBox, bindAuthForm });
  }

  window.LegendAccountAuthViewV09x = Object.freeze({ create });
})();
