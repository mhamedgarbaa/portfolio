(function () {
  'use strict';

  // Theme toggle (initial theme is set by the inline script in <head>)
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Pipeline: select a stage, mark earlier stages as done
  var stages = Array.prototype.slice.call(document.querySelectorAll('.stage'));
  var title = document.getElementById('p-title');
  var text = document.getElementById('p-text');
  var tools = document.getElementById('p-tools');
  if (!stages.length) return;

  function select(i) {
    stages.forEach(function (s, n) {
      s.classList.toggle('done', n < i);
      s.classList.toggle('on', n === i);
      s.setAttribute('aria-selected', n === i ? 'true' : 'false');
      s.tabIndex = n === i ? 0 : -1;
    });
    var s = stages[i];
    title.textContent = s.dataset.title;
    text.textContent = s.dataset.text;
    tools.textContent = s.dataset.tools;
  }

  stages.forEach(function (s, i) {
    s.addEventListener('click', function () { stopIntro(); select(i); });
    s.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + stages.length) % stages.length;
      stopIntro(); select(n); stages[n].focus();
    });
  });

  // One intro sequence on load: run through the stages and rest on Evaluate
  var FOCUS = 2, timer = null;
  function stopIntro() { clearTimeout(timer); timer = null; }
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) { select(FOCUS); return; }
  var step = 0;
  (function tick() {
    select(step);
    if (step < FOCUS) { step++; timer = setTimeout(tick, 550); }
  })();
})();
