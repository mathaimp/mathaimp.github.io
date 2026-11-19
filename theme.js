/*
 * Theme toggle. Light is the default (the system setting is ignored on purpose);
 * a small button in the corner switches to the dark theme and remembers the
 * choice in this browser. The inline snippet in each page's <head> applies a
 * saved choice before first paint, so there is no flash.
 */
(function () {
  'use strict';

  var KEY = 'theme';
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  function save(dark) {
    try {
      if (dark) localStorage.setItem(KEY, 'dark');
      else localStorage.removeItem(KEY);
    } catch (e) {}
  }

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Dark theme');

  function render() {
    var dark = isDark();
    button.innerHTML = dark ? SUN : MOON;
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? 'Return to the light' : 'Descend into the dark';
    if (meta) meta.setAttribute('content', dark ? '#0d1018' : '#fbfaf7');
  }

  button.addEventListener('click', function () {
    var dark = !isDark();
    if (!reduceMotion) {
      root.classList.add('theme-anim');
      setTimeout(function () { root.classList.remove('theme-anim'); }, 400);
    }
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    save(dark);
    render();
  });

  render();
  document.body.appendChild(button);
})();
