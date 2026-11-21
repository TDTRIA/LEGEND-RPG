/* LEGEND: The Awakening — Portal v2.0 interactions
   Ambient embers, hero parallax, scroll reveals, nav state, art marquee.
   All decorative; the page is fully usable without it. */
(function () {
  'use strict';
  var body = document.body;
  body.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav background once past the fold */
  var nav = document.querySelector('.portal-nav');
  function onNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* Seamless art marquee: duplicate the track, then let CSS animate it */
  var marquee = document.querySelector('[data-marquee]');
  if (marquee && !reduced) {
    var track = marquee.querySelector('.portal-marquee-track');
    track.innerHTML += track.innerHTML;
    body.classList.add('marquee-on');
  }

  /* Scroll reveals — content is visible by default; only .js hides it */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Hero parallax — art drifts slower than the scroll */
  var heroArt = document.querySelector('.portal-hero-art');
  var hero = document.querySelector('.portal-hero');
  var ticking = false;
  function parallax() {
    ticking = false;
    var y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroArt.style.transform = 'translateY(' + (y * 0.28) + 'px)';
    }
  }
  if (!reduced && heroArt) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  /* Ambient embers over the hero */
  var canvas = document.querySelector('.portal-embers');
  if (!canvas || reduced) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var running = false;
  var W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(n) {
    particles.length = 0;
    for (var i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.25 + Math.random() * 0.55,
        sway: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.5,
        warm: Math.random() < 0.7
      });
    }
  }

  var last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min((t - last) / 16.7, 3) || 1;
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy * dt;
      p.phase += 0.02 * dt;
      var x = p.x + Math.sin(p.phase) * p.sway * 8;
      if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
      var flicker = 0.75 + 0.25 * Math.sin(p.phase * 3);
      ctx.globalAlpha = p.alpha * flicker;
      ctx.fillStyle = p.warm ? '#e7c982' : '#b96f5f';
      ctx.beginPath();
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    window.requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  resize();
  spawn(Math.max(18, Math.floor(W / 34)));
  window.addEventListener('resize', function () {
    resize();
    spawn(Math.max(18, Math.floor(W / 34)));
  });

  /* Only burn cycles while the hero is on screen and the tab is visible */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.05 }).observe(hero);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
})();
