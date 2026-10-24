/* LEGEND v0.20.39 - anonymous presence and soul-shaping traveler creation.
 * Owns the reusable creation step markup and DOM binding. The creation controller
 * supplies the current state and callbacks; this module never writes player saves.
 */
(() => {
  const escapeHtml = window.LegendHtmlV120.escapeHtml;

  function mount(root, markup, options = {}) {
    if (!root) return;
    const assets = window.LegendAssetsV090 || {};
    const logo = assets.logo?.main || 'assets/ui/logos/logo_legend_awakening_wordmark.png?v=0.21.0-local-raster-wordmark';
    const mode = options.mode === 'arrival' ? 'arrival' : 'creation';
    const isArrival = mode === 'arrival';
    const presenceMark = assets.skills?.veil || 'assets/generated/skills/icons/veil.webp';
    const portrait = assets.npcs?.oric || 'assets/generated/npcs/captain-oric.webp';
    const step = Math.max(1, Math.min(7, Number(options.step || 1)));
    const guideText = options.guideText || 'A name is a small beginning. What do you remember?';
    const speaker = isArrival ? 'CAPTAIN ORIC' : '???';
    const role = isArrival ? 'GATE CAPTAIN' : '';
    const visual = isArrival
      ? '<div class="v140-guide-portrait-frame"><img class="v140-guide-portrait" src="' + escapeHtml(portrait) + '" alt="Captain Oric, Ashmere watch captain" decoding="async"><span>ASHMERE WATCH</span></div>'
      : '<div class="v140-guide-portrait-frame v140-presence-frame" aria-hidden="true"><div class="v140-presence-haze"></div><div class="v140-presence-ring"></div><img class="v140-presence-mark" src="' + escapeHtml(presenceMark) + '" alt="" decoding="async"><span class="v140-presence-glyph">???</span><small class="v140-presence-caption">MEMORY · SHAPE · SELF</small></div>';
    root.innerHTML = '<main class="v094-beginning v140-creation v140-' + mode + '" data-creation-step="' + step + '">' +
      '<div class="v094-beginning-bg" aria-hidden="true"></div>' +
      '<header class="v140-creation-brand"><span class="v150-logo-lockup" role="img" aria-label="LEGEND: The Awakening"><img src="' + escapeHtml(logo) + '" alt="" aria-hidden="true" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="v150-wordmark-fallback" hidden><strong>LEGEND</strong><em>THE AWAKENING</em></span></span>' +
      '<span>' + (isArrival ? 'THE GATE IS OPEN' : 'BETWEEN MEMORY AND WAKING') + '</span></header>' +
      '<div class="v140-creation-layout">' +
        '<aside class="v140-guide-pane" aria-label="' + (isArrival ? 'Captain Oric at the Ashmere gate' : 'An unnamed voice in the darkness') + '">' +
          visual +
          '<section class="v140-dialogue-box" role="region" aria-live="polite" aria-label="' + (isArrival ? 'Captain Oric dialogue' : '??? dialogue') + '">' +
            '<div class="v140-dialogue-speaker"><strong>' + speaker + '</strong><span>' + role + '</span></div>' +
            '<p>' + escapeHtml(guideText) + '</p>' +
            '<small>' + (isArrival ? 'ASHMERE · FIRST STEPS' : 'A SOUL TAKES SHAPE') + '</small>' +
          '</section>' +
        '</aside>' +
        '<div class="v094-beginning-shell">' + markup + '</div>' +
      '</div></main>';
    root.querySelectorAll('.v140-creation img').forEach(img => {
      img.addEventListener('error', () => {
        const art = img.closest('.v094-choice-art');
        if (art) {
          img.remove();
          art.classList.add('is-fallback');
        } else {
          img.remove();
        }
      }, { once: true });
    });
  }

  function actionButtons({ back = false, next = true, label = 'Continue' } = {}) {
    return '<div class="v094-actions">' +
      (next ? '<button class="v094-btn primary" id="v094Next" data-legend-scene-transition="A memory returns" type="button">' + escapeHtml(label) + '</button>' : '') +
      (back ? '<button class="v094-btn" id="v094Back" data-legend-scene-transition="Returning to an earlier memory" type="button">Back</button>' : '') +
      '</div>';
  }

  function stepProgress(step, label) {
    return '<div class="v094-stepper" aria-label="Character creation progress">' +
      '<div class="v094-stepper-top"><span>SOUL TAKING SHAPE</span><strong>STEP ' + step + ' OF 7</strong></div>' +
      '<div class="v094-stepper-track"><i style="width:' + (step / 7 * 100) + '%"></i></div>' +
      '<p>' + escapeHtml(label) + '</p></div>';
  }

  function renderName({ root, name = '', onBack, onSubmit }) {
    mount(root,
      '<section class="v094-beginning-card"><div class="v094-kicker">A Voice in the Dark</div>' +
      stepProgress(1, 'A name gives the forming soul something to answer to.') +
      '<h1>What name shall you carry?</h1><p>Before there is a road, a face, or a past, there is a name. Choose one to gather the scattered pieces around.</p>' +
      '<div class="v094-field"><label for="v094Name">Name to carry</label>' +
      '<input id="v094Name" maxlength="24" placeholder="A name that feels like yours" value="' + escapeHtml(name) + '">' +
      '<p id="v094NameError" role="alert" style="display:none;color:#ffb4a9;margin:8px 0 0"></p></div>' +
      actionButtons({ back: true, next: true, label: 'Choose Identity' }) + '</section>', { step: 1, guideText: 'You are not awake yet. Not quite. I can offer questions; only you can give the answers shape. First, a name. Is it remembered, wished for, or waiting to be made?' });
    root?.querySelector('#v094Back')?.addEventListener('click', () => onBack?.());
    root?.querySelector('#v094Next')?.addEventListener('click', () => {
      const input = root.querySelector('#v094Name');
      const error = root.querySelector('#v094NameError');
      onSubmit?.(input, error);
    });
  }

  function choiceMarkup(items, key, selected, classPortraits) {
    return '<div class="v094-choice-grid ' + (key === 'class' ? 'v094-class-grid' : '') + '">' +
      items.map(item => {
        const active = selected === item.id;
        const classPortrait = key === 'class' ? classPortraits?.[item.id] : '';
        const artCell = key !== 'class' && Array.isArray(item.artCell) ? item.artCell : null;
        const atlas = item.artSource || '';
        const atlasArt = atlas
          ? '<span class="v094-choice-art" aria-hidden="true"><img ' + (artCell ? 'src="' + escapeHtml(atlas) + '" style="left:-' + (Number(artCell[0]) * 100) + '%;top:-' + (Number(artCell[1]) * 100) + '%"' : 'class="v094-choice-art-image" src="' + escapeHtml(atlas) + '"') + ' alt="" aria-hidden="true" loading="lazy" decoding="async"></span>'
          : '';
        return '<button class="v094-choice' + (active ? ' is-selected' : '') + ((classPortrait || atlasArt) ? ' v094-choice-has-art' : '') +
          '" data-' + key + '="' + escapeHtml(item.id) + '" aria-pressed="' + active + '">' +
          (classPortrait ? '<img class="v094-class-art" src="' + escapeHtml(classPortrait) + '" alt="" aria-hidden="true" loading="lazy" decoding="async" >' : atlasArt) +
          '<strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.text || '') + '</span>' +
          (item.tag ? '<em>' + escapeHtml(item.tag) + '</em>' : '') +
          (item.effect ? '<small class="v094-choice-effect">' + escapeHtml(item.effect) + '</small>' : '') +
          '<small class="v094-choice-prompt">' + (active ? 'Selected · change any time' : 'Tap to choose') + '</small></button>';
      }).join('') + '</div>';
  }

  function renderChoiceStep({
    root, step, kicker, title, description, items, key, selected,
    classPortraits, nextLabel, progress, scene, onSelect, onBack, onNext
  }) {
    const baseGuide = ({ gender: 'Something is taking shape where the dark was. Is it the form you remember, or the form you choose now?', personality: 'A feeling can survive the memory that made it. Which one still calls to you?', origin: 'A place takes shape, but its edges are blurred. Was it home, refuge, or only a story you needed?', class: 'Your hands remember before your mind does. Steel, bow, spell, or guile. What movement finds you first?', keepsake: 'One thing remained when the rest fell quiet. Did you carry it—or did it carry you?' })[key] || scene;
    const selectedItem = items.find(item => String(item.id) === String(selected));
    const selectedLabel = String(selectedItem?.label || selectedItem?.id || selected || '');
    const echoGuide = selectedItem ? ({
      gender: 'The silhouette steadies around ' + selectedLabel + '. It feels familiar, but no face comes with the memory.',
      personality: 'The feeling returns before its cause: ' + selectedLabel + '. Something in you recognizes it.',
      origin: selectedLabel + ' comes into focus, though its edges will not hold still. You can keep the memory without understanding it.',
      class: 'Your hands answer with ' + selectedLabel.toLowerCase() + ' before your mind can explain why.',
      keepsake: 'The ' + selectedLabel + ' settles into your palm like something you once promised to keep. The memory stays incomplete.'
    })[key] || baseGuide : baseGuide;
    const fragmentLabel = selectedItem ? 'MEMORY ECHO · ' + selectedLabel.toUpperCase() : 'FRAGMENT · MEMORY';
    const fragmentText = selectedItem?.text || scene;
    mount(root,
      '<section class="v094-beginning-card v094-choice-scene"><div class="v094-kicker">' + escapeHtml(kicker) + '</div>' +
      stepProgress(step, progress) + '<h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(description) + '</p>' +
      '<aside class="v094-scene-note' + (selectedItem ? ' is-remembered' : '') + '"><span>' + escapeHtml(fragmentLabel) + '</span><p>' + escapeHtml(fragmentText) + '</p></aside>' +
      choiceMarkup(items, key, selected, classPortraits) +
      '<p id="v094ChoiceError" role="alert" class="v094-choice-error" hidden>Please choose an option to continue.</p>' +
      actionButtons({ back: true, next: true, label: nextLabel }) + '</section>', { step, guideText: echoGuide, mode: 'creation' });

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

  function renderConfirmation({ root, name, gender, personality, origin, className, keepsake, benefits = {}, onBack, onBegin }) {
    mount(root,
      '<section class="v094-beginning-card v140-soul-confirmation"><div class="v094-kicker">The Shape You Chose</div>' +
      stepProgress(7, 'Fragments of memory gather around the self you have chosen.') +
      '<h2>' + escapeHtml(name) + '</h2><p>A shape gathers from your choices: a name to answer to, instincts that still feel familiar, and memories you may or may not fully trust. The rest can wait.</p>' +
      '<div class="v094-summary"><div><span>Form</span><strong>' + escapeHtml(gender.label) + ' (' + escapeHtml(gender.pronouns) + ')</strong></div>' +
      '<div><span>Feeling</span><strong>' + escapeHtml(personality.label) + '</strong></div>' +
      '<div><span>Memory</span><strong>' + escapeHtml(origin) + '</strong></div>' +
      '<div><span>Calling</span><strong>' + escapeHtml(className) + '</strong></div>' +
      '<div><span>Fragment</span><strong>' + escapeHtml(keepsake) + '</strong></div></div>' +
      '<section class="v094-confirm-benefits" aria-label="Starting advantages"><h3>What your memories give you</h3>' +
      ['personality','origin','class','keepsake'].map(key => {
        const item = benefits[key];
        if (!item) return '';
        const labels = { personality:'Instinct', origin:'Past', class:'Calling', keepsake:'Keepsake' };
        return '<div class="v094-confirm-benefit"><span>' + labels[key] + '</span><strong>' + escapeHtml(item.label) + '</strong><p>' + escapeHtml(item.effect || item.tag || item.text || '') + '</p></div>';
      }).join('') + '</section>' +
      actionButtons({ back: true, next: true, label: 'Let Me Wake' }) + '</section>', { step: 7, mode: 'creation', guideText: 'There. A name, a shape, a feeling to follow. A beginning, not the whole of you. When you are ready, open your eyes.' });
    root?.querySelector('#v094Back')?.addEventListener('click', () => onBack?.());
    root?.querySelector('#v094Next')?.addEventListener('click', () => onBegin?.());
  }

  function renderIntro({ root, onEnter }) {
    const scenes = [
      {
        kicker: 'THE LAST MILE',
        title: 'Under a Dead Lantern',
        lines: [
          'You wake beneath a dead lantern with no memory of the last mile.',
          'Mud darkens your boots. Behind you, the Old Road folds into fog; ahead, Ashmere glows with tired yellow light.'
        ],
        dialogue: "Easy now. Captain Oric, Ashmere watch. I won't pretend I know where you came from. I only know you were found beneath a lantern that should have been lit."
      },
      {
        kicker: "THE GATEKEEPER'S LEDGER",
        title: 'A Bell, Once',
        lines: [
          'Mara Vell heard the town bell ring once when you arrived. She says that should not be possible.',
          'Oric has no explanation. For now, the bell is a fact to investigate—not an answer.'
        ],
        dialogue: 'Mara keeps the archive. Ask what she heard and what she actually saw. Keep your own guesses separate from the record until there is evidence.'
      },
      {
        kicker: 'FIRST STEPS',
        title: 'Warm Lights. Open Roads.',
        lines: [
          'Ashmere offers a place to rest, provisions, gear, work, and people who know the road.',
          'There is no required order for preparing. You decide when you are ready to leave.'
        ],
        dialogue: 'Speak with the townsfolk first. Sella can help with supplies, Brenn keeps the ledgers, and I can tell you what the watch knows. When ready, check the road board: the High Ridge is safer; the Reed Cut is riskier. The choice is yours.'
      }
    ];
    let index = 0;
    function renderBeat() {
      const scene = scenes[index];
      const goals = index === scenes.length - 1
        ? '<div class="v094-summary"><div><span>First Goal</span><strong>Talk in Town Square</strong></div>' +
          '<div><span>Then</span><strong>Prepare at Inn / Shops</strong></div>' +
          '<div><span>When Ready</span><strong>Choose Your Road</strong></div></div>'
        : '';
      mount(root,
        '<section class="v094-beginning-card v140-arrival-card"><div class="v094-kicker">' + escapeHtml(scene.kicker) + '</div>' +
        '<h2>' + escapeHtml(scene.title) + '</h2><div class="v094-intro-lines">' +
        scene.lines.map(line => '<p>' + escapeHtml(line) + '</p>').join('') +
        '</div>' + goals +
        actionButtons({ back: false, next: true, label: index === scenes.length - 1 ? 'Enter Ashmere' : 'Continue' }) +
        '<button class="v140-skip-intro" id="v140SkipIntro" type="button">Skip arrival briefing</button>' +
        '</section>', { step: 7, mode: 'arrival', guideText: scene.dialogue });
      root?.querySelector('#v140SkipIntro')?.addEventListener('click', () => onEnter?.());
      root?.querySelector('#v094Next')?.addEventListener('click', () => {
        if (index < scenes.length - 1) {
          index += 1;
          renderBeat();
          return;
        }
        onEnter?.();
      });
    }
    renderBeat();
  }

  window.LegendPlayerCreationViewV094 = Object.freeze({
    renderName,
    renderChoiceStep,
    renderConfirmation,
    renderIntro
  });
})();
