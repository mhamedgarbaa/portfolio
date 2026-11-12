(function () {
  'use strict';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;

  // Marquee: duplicate items once so the loop is seamless
  var mq = document.getElementById('marquee');
  if (mq) mq.innerHTML += mq.innerHTML;

  // Scroll progress bar + active nav link
  var bar = document.getElementById('progress');
  var links = [].slice.call(document.querySelectorAll('.nav-pill'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var cur = -1;
    secs.forEach(function (el, i) { if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('act', i === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Cursor glow + card spotlight
  var glow = document.getElementById('glow');
  if (fine && !calm) {
    addEventListener('mousemove', function (e) {
      if (glow) { glow.classList.add('on'); glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }
    }, { passive: true });
  }
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (fine && !calm && !c.classList.contains('lg')) {
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg) translateY(-3px)';
      }
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  // Tilt on the portrait + magnetic buttons
  var tilt = document.getElementById('tilt');
  if (tilt && fine && !calm) {
    tilt.addEventListener('mousemove', function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = 'perspective(900px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg)';
    });
    tilt.addEventListener('mouseleave', function () { tilt.style.transform = ''; });
    tilt.style.transition = 'transform .25s ease-out';
  }
  if (fine && !calm) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // Typed role line
  var typed = document.getElementById('typed');
  if (typed) {
    var words = ['LLM evaluation & alignment', 'agent memory systems', 'FastAPI services', 'reproducible ML pipelines'];
    if (calm) { typed.textContent = words[0]; }
    else {
      var w = 0, ch = 0, del = false;
      (function type() {
        var t = words[w];
        typed.textContent = '> ' + t.slice(0, ch);
        if (!del && ch < t.length) { ch++; setTimeout(type, 55); }
        else if (!del) { del = true; setTimeout(type, 1500); }
        else if (ch > 0) { ch--; setTimeout(type, 28); }
        else { del = false; w = (w + 1) % words.length; setTimeout(type, 300); }
      })();
    }
  }

  // Scroll reveals + counters (GSAP when available, plain fallback otherwise)
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  function showAll() { rv.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; }); }
  if (calm || !window.gsap || !window.ScrollTrigger) { showAll(); }
  else {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch(rv, {
      start: 'top 90%', once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .09, overwrite: true });
      }
    });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      } });
      el.textContent = '0';
    });
    gsap.to('.hero .photo-wrap', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Pipeline: select a stage, mark earlier stages as done
  var stages = [].slice.call(document.querySelectorAll('.stage'));
  if (!stages.length) return;
  var title = document.getElementById('p-title');
  var text = document.getElementById('p-text');
  var tools = document.getElementById('p-tools');
  var FOCUS = 2, timer = null;

  function select(i) {
    stages.forEach(function (s, n) {
      s.classList.toggle('done', n < i);
      s.classList.toggle('on', n === i);
      s.setAttribute('aria-selected', n === i ? 'true' : 'false');
      s.tabIndex = n === i ? 0 : -1;
    });
    title.textContent = stages[i].dataset.title;
    text.textContent = stages[i].dataset.text;
    tools.textContent = stages[i].dataset.tools;
  }
  function stop() { clearTimeout(timer); timer = null; }

  stages.forEach(function (s, i) {
    s.addEventListener('click', function () { stop(); select(i); });
    s.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + stages.length) % stages.length;
      stop(); select(n); stages[n].focus();
    });
  });

  if (calm) { select(FOCUS); return; }
  var step = 0;
  (function tick() {
    select(step);
    if (step < FOCUS) { step++; timer = setTimeout(tick, 550); }
  })();
})();
