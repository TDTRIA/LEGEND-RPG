/* LEGEND — DOM interface restore switch (v1).
 *
 * Purpose: the Phaser migration painted a pixel copy of nearly every DOM
 * surface and then hid the DOM underneath it. That left two renderers with
 * two sources of truth, and the interface lost its native feel.
 *
 * This switch makes every native painter a no-op and asks it to release the
 * DOM it was covering, so the authored HTML interface is the interactive layer
 * again. Phaser keeps the world plate, environment art and transitions.
 *
 * Precedence:
 *   1. ?dom-ui=1 / ?dom-ui=0 on the URL wins for that page load, and is saved.
 *   2. Otherwise the saved preference is used.
 *   3. Otherwise the painters run exactly as they do today (switch off).
 *
 * The preference lives in its own storage key. It must never be written into
 * LEGEND_DATA.SAVE_KEY or legend-settings-v1: those are player data contracts.
 */
(() => {
  const KEY = 'legend-dom-ui-restore';
  const EVENT = 'legend:dom-ui-change';
  const BODY_CLASS = 'legend-dom-ui-restore-active';

  const truthy = value => /^(1|true|on|yes|dom|restore)$/i.test(String(value || '').trim());
  const falsy = value => /^(0|false|off|no|phaser|native)$/i.test(String(value || '').trim());

  function stored() {
    try {
      return window.localStorage?.getItem(KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function persist(enabled) {
    try {
      window.localStorage?.setItem(KEY, enabled ? '1' : '0');
    } catch (error) {
      /* Private mode or blocked storage: the switch still works for this load. */
    }
  }

  function fromUrl() {
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (error) {
      return null;
    }
    for (const name of ['dom-ui', 'domUi', 'domui']) {
      if (!params.has(name)) continue;
      const raw = params.get(name);
      if (raw === '' || falsy(raw)) return false;
      if (truthy(raw)) return true;
      return null;
    }
    return null;
  }

  let enabled = false;
  const urlChoice = fromUrl();
  if (urlChoice === null) {
    enabled = stored();
  } else {
    enabled = urlChoice;
    persist(urlChoice);
  }

  function applyBodyClass() {
    const body = document.body;
    if (!body) return;
    body.classList.toggle(BODY_CLASS, enabled);
    document.documentElement.dataset.domUiRestore = enabled ? '1' : '0';
  }

  function announce() {
    applyBodyClass();
    try {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { enabled } }));
    } catch (error) {
      /* Older browsers without CustomEvent constructors: the class still lands. */
    }
  }

  const api = {
    key: KEY,
    event: EVENT,
    get enabled() {
      return enabled;
    },
    /* Painters call this to decide whether to paint. */
    paints() {
      return !enabled;
    },
    setEnabled(next) {
      const value = Boolean(next);
      if (value === enabled) return enabled;
      enabled = value;
      persist(enabled);
      announce();
      return enabled;
    },
    toggle() {
      return api.setEnabled(!enabled);
    },
    /* Test/debug helper: clears the saved preference. */
    clearPreference() {
      try {
        window.localStorage?.removeItem(KEY);
      } catch (error) {
        /* no-op */
      }
    }
  };

  window.LegendDomUiRestore = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBodyClass, { once: true });
  } else {
    applyBodyClass();
  }
})();
