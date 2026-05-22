// LEGEND v0.7.0 — Universal UI Theme Enhancer
// Safe additive layer: adds classes and removes legacy ASCII nodes after render.
(function(){
  var MARK = 'ui-theme-v070-ready';
  var sceneClasses = ['legend-scene-title','legend-scene-ashmere','legend-scene-road','legend-scene-battle','legend-scene-people','legend-scene-inventory','legend-scene-defeat'];

  function tag(selector, className){
    var nodes = document.querySelectorAll(selector);
    for(var i = 0; i < nodes.length; i++){
      nodes[i].classList.add(className);
      nodes[i].classList.add(MARK);
    }
  }

  function removeAscii(){
    var nodes = document.querySelectorAll('pre.ascii, .ascii');
    for(var i = 0; i < nodes.length; i++){
      var node = nodes[i];
      if(node.dataset && node.dataset.themeRemoved === '1') continue;
      var scene = document.createElement('div');
      scene.className = 'legend-visual-scene';
      scene.setAttribute('aria-hidden','true');
      node.parentNode.insertBefore(scene, node);
      node.dataset.themeRemoved = '1';
      node.remove();
    }
  }

  function setScene(){
    var text = (document.body && document.body.innerText || '').toLowerCase();
    document.body.classList.remove.apply(document.body.classList, sceneClasses);
    if(document.querySelector('.title-card') && document.querySelector('.game-title')) document.body.classList.add('legend-scene-title');
    else if(text.indexOf('battle') >= 0 || text.indexOf('intent:') >= 0 || document.querySelector('.enemy')) document.body.classList.add('legend-scene-battle');
    else if(text.indexOf('old road') >= 0 || text.indexOf('road continues') >= 0 || text.indexOf('choose a route') >= 0 || text.indexOf('ashmere road') >= 0) document.body.classList.add('legend-scene-road');
    else if(text.indexOf('people of ashmere') >= 0 || text.indexOf('mara vell') >= 0 || text.indexOf('old brenn') >= 0 || text.indexOf('captain oric') >= 0) document.body.classList.add('legend-scene-people');
    else if(text.indexOf('inventory') >= 0 || text.indexOf('character sheet') >= 0) document.body.classList.add('legend-scene-inventory');
    else if(text.indexOf('road defeat') >= 0 || text.indexOf('the road drags you back') >= 0) document.body.classList.add('legend-scene-defeat');
    else if(text.indexOf('ashmere menu') >= 0 || text.indexOf('ashmere') >= 0) document.body.classList.add('legend-scene-ashmere');
  }

  function enhanceTitle(){
    var title = document.querySelector('.title-card');
    if(!title) return;
    title.classList.add('legend-title-theme');
    var h1 = title.querySelector('h1, .game-title');
    if(h1) h1.classList.add('legend-logo-theme');
  }

  function enhance(){
    removeAscii();
    tag('.panel', 'legend-panel-theme');
    tag('.card', 'legend-card-theme');
    tag('.title-card', 'legend-panel-theme');
    tag('.topbar', 'legend-topbar-theme');
    tag('.actions', 'legend-actions-theme');
    tag('.text', 'legend-text-theme');
    tag('.choice-card', 'legend-choice-theme');
    tag('.event-card', 'legend-choice-theme');
    tag('.shop', 'legend-choice-theme');
    tag('.npc-card', 'legend-choice-theme');
    tag('.setting-card', 'legend-choice-theme');
    tag('.quest', 'legend-card-theme');
    tag('.stat', 'legend-card-theme');
    tag('.box', 'legend-card-theme');
    tag('.legend-visual-scene', 'legend-scene-card');
    enhanceTitle();
    setScene();
  }

  function start(){
    enhance();
    var queued = false;
    var observer = new MutationObserver(function(){
      if(queued) return;
      queued = true;
      window.requestAnimationFrame(function(){ queued = false; enhance(); });
    });
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
