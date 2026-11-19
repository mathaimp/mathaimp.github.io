/*
 * Small hidden touches:
 *   - the tab title changes while you are on another tab
 *   - typing "sudo" anywhere on the page
 *   - triple-clicking the name on the home page
 */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function make(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  // Types `text` into `node` one character at a time, then calls `done`.
  // Returns a function that cancels it.
  function typeInto(node, text, delay, done) {
    if (reduceMotion) { node.textContent = text; if (done) done(); return function () {}; }
    var i = 0;
    var timer = setInterval(function () {
      i += 1;
      node.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(timer); if (done) done(); }
    }, delay);
    return function () { clearInterval(timer); };
  }

  /* ----------------------------- tab title ---------------------------- */

  var AWAY_TITLES = ['Come back, still planning…', 'Replanning…', 'Come back, wanderer'];
  var realTitle = null;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (realTitle === null) {
        realTitle = document.title;
        document.title = AWAY_TITLES[Math.floor(Math.random() * AWAY_TITLES.length)];
      }
    } else if (realTitle !== null) {
      document.title = realTitle;
      realTitle = null;
    }
  });

  /* -------------------------------- sudo ------------------------------ */

  var sudoBox, cancelSudo, hideTimer;

  function showSudo() {
    if (cancelSudo) cancelSudo();
    clearTimeout(hideTimer);
    if (!sudoBox) {
      sudoBox = make('div', 'sudo-toast');
      sudoBox.setAttribute('role', 'status');
      document.body.appendChild(sudoBox);
    }
    sudoBox.textContent = '';
    var cmd = make('div');
    var reply = make('div', 'sudo-err');
    sudoBox.appendChild(cmd);
    sudoBox.appendChild(reply);
    sudoBox.classList.add('on');

    var line = 'mathai is not in the sudoers file. This incident will be reported.';
    var cancelA = typeInto(cmd, '$ sudo', 55, function () {
      var wait = setTimeout(function () {
        cancelSudo = typeInto(reply, line, 14, function () {
          hideTimer = setTimeout(function () { sudoBox.classList.remove('on'); }, 4500);
        });
      }, reduceMotion ? 0 : 450);
      cancelSudo = function () { clearTimeout(wait); };
    });
    cancelSudo = cancelA;
  }

  var typed = '';
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    var t = e.target;
    var tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') { typed = ''; return; }
    if (!e.key || e.key.length !== 1) return;               // ignore Shift, arrows, and so on
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === 'sudo') { typed = ''; showSudo(); }
  });

  /* ------------------------- triple-click the name -------------------- */

  var heading = document.querySelector('.about h1');
  if (heading) {
    var recent = [];
    var busy = false;

    var LOG = [
      ['INFO', 'node started'],
      ['INFO', 'subscribed to /papers'],
      ['WARN', '/sleep has no publishers'],
      ['INFO', 'replanning...']
    ];

    var runLog = function () {
      busy = true;
      var original = heading.innerHTML;
      var name = heading.textContent;
      heading.style.minHeight = heading.offsetHeight + 'px';   // keep the page from jumping
      heading.textContent = '';
      var hidden = make('span', 'sr-only');
      hidden.textContent = name;
      var log = make('span', 'ros-log');
      log.setAttribute('aria-hidden', 'true');
      heading.appendChild(hidden);
      heading.appendChild(log);

      var i = 0;
      var next = function () {
        if (i >= LOG.length) {
          setTimeout(function () {
            heading.innerHTML = original;
            heading.style.minHeight = '';
            busy = false;
          }, reduceMotion ? 800 : 1100);
          return;
        }
        var entry = LOG[i++];
        var stamp = (Date.now() / 1000).toFixed(3);
        log.classList.toggle('ros-warn', entry[0] === 'WARN');
        typeInto(log, '[' + entry[0] + '] [' + stamp + '] [mathai]: ' + entry[1], 16, function () {
          setTimeout(next, reduceMotion ? 1100 : 900);
        });
      };
      next();
    };

    // Stop the browser from selecting the paragraph on a triple-click.
    heading.addEventListener('mousedown', function (e) { if (e.detail > 1) e.preventDefault(); });

    heading.addEventListener('click', function () {
      if (busy) return;
      var now = Date.now();
      recent.push(now);
      recent = recent.filter(function (t) { return now - t < 900; });
      if (recent.length >= 3) { recent = []; runLog(); }
    });
  }
})();
