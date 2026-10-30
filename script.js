(function () {
  'use strict';

  // Marquee: duplicate the items once so the loop is seamless
  var mq = document.getElementById('marquee');
  if (mq) mq.innerHTML += mq.innerHTML;

  // Pipeline: select a stage, mark earlier stages as done
  var stages = Array.prototype.slice.call(document.querySelectorAll('.stage'));
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

  // One intro sequence on load, resting on Evaluate (current research)
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) { select(FOCUS); return; }
  var step = 0;
  (function tick() {
    select(step);
    if (step < FOCUS) { step++; timer = setTimeout(tick, 550); }
  })();
})();
