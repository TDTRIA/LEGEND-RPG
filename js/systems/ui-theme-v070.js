// LEGEND v0.7.0 — Universal UI Theme Enhancer
// Safe additive layer: adds theme classes only. It does not move DOM nodes or replace game markup.
(function(){
  var MARK = 'ui-theme-v070-ready';

  function tag(selector, className){
    var nodes = document.querySelectorAll(selector);
    for(var i = 0; i < nodes.length; i++){
      nodes[i].classList.add(className);
      nodes[i].classList.add(MARK);
    }
  }

  function enhanceTitle(){
    var title = document.querySelector('.title-card');
    if(!title) return;
    title.classList.add('legend-title-theme');
    var h1 = title.querySelector('h1, .game-title');
    if(h1) h1.classList.add('legend-logo-theme');
  }

  function enhance(){
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
    enhanceTitle();
  }

  function start(){
    enhance();
    var observer = new MutationObserver(function(){
      window.requestAnimationFrame(enhance);
    });
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    start();
  }
})();
