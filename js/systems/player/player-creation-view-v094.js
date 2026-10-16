/* LEGEND v0.20.36 - traveler creation presentation.
 * Owns the reusable creation step markup and DOM binding. The creation controller
 * supplies the current state and callbacks; this module never writes player saves.
 */
(() => {
  const escapeHtml = window.LegendHtmlV120.escapeHtml;

  function mount(root, markup) {
    if (!root) return;
    root.innerHTML = '<main class="v094-beginning"><div class="v094-beginning-bg" aria-hidden="true"></div><div class="v094-beginning-shell">' + markup + '</div></main>';
  }

  function actionButtons({ back = false, next = true, label = 'Continue' } = {}) {
    return '<div class="v094-actions">' +
      (next ? '<button class="v094-btn primary" id="v094Next" type="button">' + escapeHtml(label) + '</button>' : '') +
      (back ? '<button class="v094-btn" id="v094Back" type="button">Back</button>' : '') +
      '</div>';
  }

  function stepProgress(step, label) {
    return '<div class="v094-stepper" aria-label="Character creation progress">' +
      '<div class="v094-stepper-top"><span>YOUR TRAVELER</span><strong>STEP ' + step + ' OF 7</strong></div>' +
      '<div class="v094-stepper-track"><i style="width:' + (step / 7 * 100) + '%"></i></div>' +
      '<p>' + escapeHtml(label) + '</p></div>';
  }

  function renderName({ root, name = '', onBack, onSubmit }) {
    mount(root,
      '<section class="v094-beginning-card"><div class="v094-kicker">Traveler Creation</div>' +
      stepProgress(1, 'Start with the name you want the world to remember.') +
      '<h1>Who reaches Ashmere?</h1><p>You wake under a dead lantern with road mud on your boots. Give the town a name to remember.</p>' +
      '<div class="v094-field"><label for="v094Name">Traveler Name</label>' +
      '<input id="v094Name" maxlength="24" placeholder="Name, no spaces" value="' + escapeHtml(name) + '">' +
      '<p id="v094NameError" role="alert" style="display:none;color:#ffb4a9;margin:8px 0 0"></p></div>' +
      actionButtons({ back: true, next: true, label: 'Choose Identity' }) + '</section>');
    root?.querySelector('#v094Back')?.addEventListener('click', () => onBack?.());
    root?.querySelector('#v094Next')?.addEventListener('click', () => {
      const input = root.querySelector('#v094Name');
      const error = root.querySelector('#v094NameError');
      onSubmit?.(input, error);
    });
  }

  function choiceMarkup(items, key, selected, classPortraits) {
    const stateKey = key === 'class' ? 'className' : key;
    return '<div class="v094-choice-grid ' + (key === 'class' ? 'v094-class-grid' : '') + '">' +
      items.map(item => {
        const active = selected === item.id;
        const portrait = key === 'class' ? classPortraits?.[item.id] : '';
        return '<button class="v094-choice' + (active ? ' is-selected' : '') + (portrait ? ' v094-choice-has-art' : '') +
          '" data-' + key + '="' + escapeHtml(item.id) + '" aria-pressed="' + active + '">' +
          (portrait ? '<img class="v094-class-art" src="' + escapeHtml(portrait) + '" alt="" aria-hidden="true" onerror="this.style.display=\'none\'">' : '') +
          '<strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.text || '') + '</span>' +
          (item.tag ? '<em>' + escapeHtml(item.tag) + '</em>' : '') +
          '<small class="v094-choice-prompt">' + (active ? 'Selected · change any time' : 'Tap to choose') + '</small></button>';
      }).join('') + '</div>';
  }

  function renderChoiceStep({
    root, step, kicker, title, description, items, key, selected,
    classPortraits, nextLabel, progress, scene, onSelect, onBack, onNext
  }) {
    mount(root,
      '<section class="v094-beginning-card v094-choice-scene"><div class="v094-kicker">' + escapeHtml(kicker) + '</div>' +
      stepProgress(step, progress) + '<h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(description) + '</p>' +
      '<aside class="v094-scene-note"><span>FIELD NOTE · THE OLD ROAD</span><p>' + escapeHtml(scene) + '</p></aside>' +
      choiceMarkup(items, key, selected, classPortraits) +
      '<p id="v094ChoiceError" role="alert" class="v094-choice-error" hidden>Please choose an option to continue.</p>' +
      actionButtons({ back: true, next: true, label: nextLabel }) + '</section>');

    root?.querySelectorAll('[data-' + key + ']').forEach(button => {
      button.addEventListener('click', () => onSelect?.(button.dataset[key]));
    });
    root?.querySelector('#v094Back')?.addEventListener('click', () => onBack?.());
    root?.querySelector('#v094Next')?.addEventListener('click', () => {
      if (!selected) {
        const error = root.querySelector('#v094ChoiceError');
        if (error) {
          error.hidden = false;
          error.textContent = 'Choose the option that feels right for your traveler, then continue.';
        }
        return;
      }
      onNext?.();
    });
  }

  function renderConfirmation({ root, name, gender, personality, origin, className, keepsake, onBack, onBegin }) {
    mount(root,
      '<section class="v094-beginning-card"><div class="v094-kicker">Your Story So Far</div>' +
      stepProgress(7, 'One last look before your first steps into Ashmere.') +
      '<h2>' + escapeHtml(name) + '</h2><p>A ' + escapeHtml(personality.label.toLowerCase()) + ' traveler reaches Ashmere. The bell is silent. The gate is open.</p>' +
      '<div class="v094-summary"><div><span>Gender</span><strong>' + escapeHtml(gender.label) + ' (' + escapeHtml(gender.pronouns) + ')</strong></div>' +
      '<div><span>Personality</span><strong>' + escapeHtml(personality.label) + '</strong></div>' +
      '<div><span>Origin</span><strong>' + escapeHtml(origin) + '</strong></div>' +
      '<div><span>Class</span><strong>' + escapeHtml(className) + '</strong></div>' +
      '<div><span>Keepsake</span><strong>' + escapeHtml(keepsake) + '</strong></div></div>' +
      actionButtons({ back: true, next: true, label: 'Begin the Road' }) + '</section>');
    root?.querySelector('#v094Back')?.addEventListener('click', () => onBack?.());
    root?.querySelector('#v094Next')?.addEventListener('click', () => onBegin?.());
  }

  function renderIntro({ root, onEnter }) {
    mount(root,
      '<section class="v094-beginning-card"><div class="v094-kicker">The Road to Ashmere</div>' +
      '<h2>The bell rings once.</h2><div class="v094-intro-lines">' +
      '<p>You wake beneath a dead lantern with no memory of the last mile.</p>' +
      '<p>Behind you, the Old Road has folded into fog. Ahead, Ashmere burns with tired yellow light.</p>' +
      '<p>A guard sees your face, then the mud on your boots. He does not ask where you came from.</p>' +
      '<p>Inside the gate, three choices matter first: speak to the townsfolk, prepare supplies, and only then test the road.</p></div>' +
      '<div class="v094-summary"><div><span>First Goal</span><strong>Talk in Town Square</strong></div>' +
      '<div><span>Then</span><strong>Prepare at Inn / Shops</strong></div>' +
      '<div><span>Then</span><strong>Travel the Old Road</strong></div></div>' +
      actionButtons({ back: false, next: true, label: 'Enter Ashmere' }) + '</section>');
    root?.querySelector('#v094Next')?.addEventListener('click', () => onEnter?.());
  }

  window.LegendPlayerCreationViewV094 = Object.freeze({
    renderName,
    renderChoiceStep,
    renderConfirmation,
    renderIntro
  });
})();
