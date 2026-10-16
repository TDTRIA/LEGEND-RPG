/* LEGEND v0.20.36 - account/profile screen presentation.
 * Renders the local profile and cloud-slot UI. State changes and Supabase/local
 * persistence are supplied as callbacks by LegendAccountV09x.
 */
(() => {
  function create(config = {}) {
    const {
      root,
      escapeHtml: esc,
      sessionEmail,
      formatDate: fmtDate
    } = config;
    if (typeof root !== 'function' || typeof esc !== 'function' ||
        typeof sessionEmail !== 'function' || typeof fmtDate !== 'function') return null;

    function render(options = {}) {
      const {
        message = '',
        session = null,
        player = null,
        profile = null,
        cloudCanUse = false,
        cloudRows = [],
        displayName = 'Ashmere Traveler',
        authBox = '',
        onBackTitle,
        onContinueTraveler,
        onNewTraveler,
        onSubmitProfile,
        onSignOut,
        onCloudLoad,
        onCloudSave,
        onCloudDelete
      } = options;
      const host = root();
      if (!host) return;
      const signedIn = !!session?.user;

      host.innerHTML = `
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
                <div class="account09x-avatar">${esc(String(displayName).slice(0,1)).toUpperCase()}</div>
                <div class="account09x-profile-main">
                  <div class="account09x-kicker">Traveler Profile</div>
                  <h2>${esc(displayName)}</h2>
                  <p>${esc(sessionEmail(session))}</p>
                </div>
                <form class="account09x-profile-form" id="profileForm">
                  <label for="displayName">Traveler Name</label>
                  <div class="account09x-profile-edit"><input id="displayName" maxlength="28" value="${esc(displayName)}" autocomplete="nickname"><button class="account09x-btn primary" type="submit">Save Name</button></div>
                </form>
              </section>
            ` : authBox}

            <section class="account09x-panel">
              <div class="account09x-section-head">
                <div><div class="account09x-kicker">Your Journey</div><h2>Traveler</h2></div>
                ${player ? '<button class="account09x-btn primary" id="continueTraveler" type="button">Continue Journey</button>' : '<button class="account09x-btn primary" id="newTraveler" type="button">New Traveler</button>'}
              </div>
              <div class="account09x-traveler-summary ${player ? '' : 'empty'}">
                <div class="account09x-avatar small">${player ? esc(String(player.username || '?').slice(0,1)).toUpperCase() : '?'}</div>
                <div>
                  <h3>${player ? esc(player.username || 'Unnamed Traveler') : 'No traveler yet'}</h3>
                  <p>${player ? `${esc(player.className || player.class || 'Traveler')} • ${esc(player.town || 'Ashmere')} • Day ${player.day || 1} • ${Number(player.inventory?.roadToken || 0)} Road Tokens` : 'Create a traveler to begin your journey through Ashmere.'}</p>
                </div>
              </div>
            </section>

            <section class="account09x-panel">
              <div class="account09x-section-head"><div><div class="account09x-kicker">Cloud Save</div><h2>Traveler Slots</h2></div><span class="account09x-cloud-state">${signedIn && cloudCanUse ? 'Cloud Online' : signedIn ? 'Connecting…' : 'Sign in to use cloud saves'}</span></div>
              <div class="account09x-cloud-grid">
                ${[1,2].map(slot => {
                  const row = cloudRows.find(item => Number(item.slot) === slot);
                  return `<article class="account09x-cloud-slot"><div><strong>Cloud Slot ${slot}</strong><small id="cloudSlot${slot}Info">${row ? esc(row.display_name || 'Traveler') + ' • ' + fmtDate(row.updated_at) : 'Empty'}</small></div><div class="account09x-actions"><button class="account09x-btn" type="button" data-cloud-load="${slot}" ${cloudCanUse && row ? '' : 'disabled'}>Load</button><button class="account09x-btn primary" type="button" data-cloud-save="${slot}" ${cloudCanUse && player ? '' : 'disabled'}>Save Here</button><button class="account09x-btn danger" type="button" data-cloud-delete="${slot}" ${cloudCanUse && row ? '' : 'disabled'}>Clear</button></div></article>`;
                }).join('')}
              </div>
            </section>
          </div>
        </main>`;

      host.querySelector('#backTitle')?.addEventListener('click', () => onBackTitle?.());
      host.querySelector('#continueTraveler')?.addEventListener('click', () => onContinueTraveler?.());
      host.querySelector('#newTraveler')?.addEventListener('click', () => onNewTraveler?.());
      host.querySelector('#profileForm')?.addEventListener('submit', event => {
        event.preventDefault();
        onSubmitProfile?.(host.querySelector('#displayName')?.value || '');
      });
      const signOutButton = host.querySelector('#signOutBtn');
      if (signOutButton) signOutButton.addEventListener('click', () => onSignOut?.(signOutButton));
      host.querySelectorAll('[data-cloud-load]').forEach(button => {
        button.addEventListener('click', () => onCloudLoad?.(Number(button.dataset.cloudLoad)));
      });
      host.querySelectorAll('[data-cloud-save]').forEach(button => {
        button.addEventListener('click', () => onCloudSave?.(Number(button.dataset.cloudSave)));
      });
      host.querySelectorAll('[data-cloud-delete]').forEach(button => {
        button.addEventListener('click', () => onCloudDelete?.(Number(button.dataset.cloudDelete)));
      });
    }

    return Object.freeze({ render });
  }

  window.LegendAccountProfileViewV09x = Object.freeze({ create });
})();
