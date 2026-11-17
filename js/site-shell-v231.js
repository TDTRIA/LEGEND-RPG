/* LEGEND: The Awakening — shared site shell
   Renders one header and one footer for every public page so navigation no
   longer changes character between the Realm Hub, the Chronicle, the Dispatch
   and the resource pages. Page markup stays untouched apart from the include,
   so the old chrome remains a graceful fallback if this script never runs. */

(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (/site-shell-v231\.js/.test(all[i].src || '')) return all[i];
    }
    return null;
  })();

  var root = '/';
  if (script && script.src) {
    try { root = new URL('../', script.src).pathname; } catch (e) { root = '/'; }
  }

  var path = window.location.pathname;
  var file = path.split('/').pop() || 'index.html';
  var current = /\/posts\//.test(path) ? 'blog.html' : file;

  function link(href, label, page, extra) {
    var isCurrent = page && current === page;
    return '<a href="' + root + href + '"' +
      (isCurrent ? ' aria-current="page"' : '') +
      (extra ? ' class="' + extra + '"' : '') + '>' + label + '</a>';
  }

  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="site-bar">' +
      '<a class="site-brand" href="' + root + 'portal.html" aria-label="LEGEND: The Awakening — official site home">' +
        '<img src="' + root + 'assets/ui/logos/logo_legend_awakening_wordmark.png" alt="LEGEND: The Awakening">' +
        '<span class="site-brand-label">Official Game Site</span>' +
      '</a>' +
      '<nav class="site-nav" aria-label="Site">' +
        link('portal.html', 'Home', 'portal.html') +
        link('blog.html', 'Chronicle', 'blog.html') +
        link('updates.html', 'Dispatch', 'updates.html') +
        link('guide.html', 'Field Guide', 'guide.html') +
      '</nav>' +
      '<a class="site-play" href="' + root + 'index.html">Play the Game <span aria-hidden="true">&#8599;</span></a>' +
    '</div>';

  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<div class="site-footer-inner">' +
      '<div class="site-footer-brand">' +
        '<a href="' + root + 'portal.html"><img src="' + root + 'assets/ui/logos/logo_legend_awakening_wordmark.png" alt="LEGEND: The Awakening"></a>' +
        '<p>A dark-fantasy browser RPG about a traveler, a dangerous road, and a world that remembers.</p>' +
        '<p class="site-footer-build">Production build v0.30.5 &middot; Active development</p>' +
      '</div>' +
      '<nav class="site-footer-nav" aria-label="Explore">' +
        '<h2>Explore</h2>' +
        '<a href="' + root + 'portal.html">The World</a>' +
        '<a href="' + root + 'blog.html">Chronicle</a>' +
        '<a href="' + root + 'updates.html">Dispatch</a>' +
        '<a href="' + root + 'guide.html">Field Guide</a>' +
      '</nav>' +
      '<nav class="site-footer-nav" aria-label="Play">' +
        '<h2>Play</h2>' +
        '<a href="' + root + 'index.html">Play the game</a>' +
        '<a href="' + root + 'save.html">Save Vault</a>' +
        '<a href="' + root + 'feedback.html">Feedback &amp; support</a>' +
        '<a href="' + root + 'playtest.html">Playtest runner</a>' +
      '</nav>' +
      '<nav class="site-footer-nav" aria-label="Elsewhere">' +
        '<h2>Elsewhere</h2>' +
        '<a href="https://discord.gg/htbBvvY9N" target="_blank" rel="noopener">Discord</a>' +
        '<a href="https://github.com/TDTRIA/LEGEND-RPG" target="_blank" rel="noopener">GitHub</a>' +
        '<a href="' + root + 'docs/ROADMAP.md">The road ahead</a>' +
        '<a href="' + root + 'privacy.html">Privacy</a>' +
      '</nav>' +
    '</div>' +
    '<div class="site-footer-bottom">' +
      '<span>&copy; 2026 LEGEND: The Awakening</span>' +
      '<span>An independent dark-fantasy browser RPG in active development.</span>' +
    '</div>';

  function swap() {
    var oldHeaders = document.querySelectorAll('.rp-header, .chronicle-nav, .dd-header');
    for (var i = 0; i < oldHeaders.length; i++) oldHeaders[i].parentNode.removeChild(oldHeaders[i]);

    var oldFooters = document.querySelectorAll('.rp-footer, .dd-footer, .chronicle-index-footer, footer');
    for (var j = 0; j < oldFooters.length; j++) oldFooters[j].parentNode.removeChild(oldFooters[j]);

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(footer);
  }

  if (document.body) swap();
  else document.addEventListener('DOMContentLoaded', swap);
})();
