// LEGEND v0.20.36 - Active Game Runtime
// Safe bridge for loading saves, returning to Ashmere, and avoiding title-loop reloads.
(() => {
  const RETURN_KEY = 'legend-awakening-return-to-town-v1';

  function reportSessionStorageFailure(operation, error) {
    const message = 'The return-to-town marker could not be stored in this browser session. ' +
      'The game can continue, but automatic return after a reload may not be available.';
    console.warn('[LEGEND] Session storage could not ' + operation + '.', error);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(toast.__legendReturnStorageTimer);
      toast.__legendReturnStorageTimer = window.setTimeout(
        () => toast.classList.remove('show'),
        4500
      );
    }
  }

  function readPendingReturn() {
    try {
      return window.sessionStorage.getItem(RETURN_KEY);
    } catch (error) {
      reportSessionStorageFailure('read the return marker', error);
      return null;
    }
  }

  function writePendingReturn() {
    try {
      window.sessionStorage.setItem(RETURN_KEY, '1');
      return true;
    } catch (error) {
      reportSessionStorageFailure('write the return marker', error);
      return false;
    }
  }

  function clearPendingReturn() {
    try {
      window.sessionStorage.removeItem(RETURN_KEY);
      return true;
    } catch (error) {
      reportSessionStorageFailure('clear the return marker', error);
      return false;
    }
  }

  function loadPlayer() {
    return window.LegendStorage?.loadPlayer?.() || null;
  }

  function savePlayer(player) {
    if (!player) return;
    window.LegendStorage?.savePlayer?.(player);
  }

  function isContinueButton(el) {
    if (!el) return false;
    if (el.id === 'continue') return true;
    const txt = String(el.textContent || '').trim().toLowerCase();
    return txt.startsWith('continue') || txt.includes('continue as');
  }

  function findContinueButton() {
    const direct = document.getElementById('continue');
    if (direct) return direct;
    return [...document.querySelectorAll('button,a,.v089-menu-btn')].find(isContinueButton) || null;
  }

  function continueFromTitle() {
    const btn = findContinueButton();
    if (btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true') {
      btn.click();
      return true;
    }
    return false;
  }

  function renderAshmereDirect() {
    const player = loadPlayer();
    if (!player) return false;
    player.town = 'Ashmere';
    savePlayer(player);
    if (window.LegendAshmereV099?.renderAshmere) {
      window.LegendAshmereV099.renderAshmere();
      clearPendingReturn();
      return true;
    }
    return false;
  }

  function returnToAshmere() {
    const queued = writePendingReturn();
    if (renderAshmereDirect()) return true;
    if (queued) {
      location.reload();
      return true;
    }
    return continueFromTitle();
  }

  function handlePendingReturn() {
    if (readPendingReturn() !== '1') return false;
    if (renderAshmereDirect()) return true;
    const didContinue = continueFromTitle();
    if (didContinue) clearPendingReturn();
    return didContinue;
  }

  function autoResumePendingReturn() {
    if (readPendingReturn() !== '1') return;
    let tries = 0;
    const attempt = () => {
      tries += 1;
      if (handlePendingReturn() || tries >= 60) clearInterval(timer);
    };
    const timer = setInterval(attempt, 100);
    setTimeout(attempt, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoResumePendingReturn);
  } else {
    autoResumePendingReturn();
  }

  window.LegendRuntimeV120 = {
    loadPlayer,
    savePlayer,
    returnToAshmere,
    continueFromTitle,
    handlePendingReturn
  };
})();