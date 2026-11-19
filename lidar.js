/*
 * Easter egg: double-click the profile photo (two clicks in a row) and it glitches into a
 * LiDAR-style point cloud, with a scan line sweeping across it, then glitches
 * back. Everything is drawn on a canvas from the photo itself.
 */
(function () {
  'use strict';

  var photo = document.querySelector('.photo');
  var wrap = photo && photo.parentNode;
  if (!wrap || !wrap.classList.contains('photo-wrap')) return;

  var CLICKS_NEEDED = 2;
  var CLICK_GAP = 1200;          // ms allowed between clicks
  var GLITCH_IN = 280;           // photo glitches
  var SWEEP = 1500;              // scan line reveals the points
  var HOLD_END = 4600;           // points shimmer under a repeating scan
  var GLITCH_OUT = 4950;         // glitch back to the photo

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var clicks = 0;
  var lastClick = 0;
  var active = null;

  // navy -> the site's teal -> pale cyan -> white (like a LiDAR intensity view)
  var RAMP = [[24, 70, 100], [31, 111, 139], [140, 200, 212], [246, 244, 236]];
  function ramp(t) {
    var s = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
    var i = Math.min(Math.floor(s), RAMP.length - 2);
    var f = s - i, a = RAMP[i], b = RAMP[i + 1];
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * f) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * f) + ')';
  }

  // Turn the photo into scan "rings" of points; brightness stands in for range.
  function buildPoints(size) {
    var ringGap = 4, pointGap = 3;
    var cols = Math.round(size / pointGap), rows = Math.round(size / ringGap);
    var off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    var o = off.getContext('2d');
    var s = Math.min(photo.naturalWidth, photo.naturalHeight);
    var sx = (photo.naturalWidth - s) / 2, sy = (photo.naturalHeight - s) / 2;
    o.drawImage(photo, sx, sy, s, s, 0, 0, cols, rows);
    var data = o.getImageData(0, 0, cols, rows).data;   // throws if the canvas is tainted

    var lums = new Array(rows * cols), sorted;
    for (var n = 0; n < rows * cols; n++) {
      lums[n] = (0.2126 * data[n * 4] + 0.7152 * data[n * 4 + 1] + 0.0722 * data[n * 4 + 2]) / 255;
    }
    sorted = lums.slice().sort(function (a, b) { return a - b; });
    var lo = sorted[Math.floor(sorted.length * 0.04)], hi = sorted[Math.floor(sorted.length * 0.96)];
    var span = Math.max(hi - lo, 0.05);                 // stretch contrast so the subject stands out

    var pts = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var lum = Math.pow(Math.max(0, Math.min(1, (lums[r * cols + c] - lo) / span)), 0.7);
        pts.push({
          x: c * pointGap + (r % 2 ? pointGap / 2 : 0) + (Math.random() - 0.5) * 0.8,
          y: r * ringGap + (Math.random() - 0.5) * 0.8,
          color: ramp(lum),
          phase: Math.random()
        });
      }
    }
    return pts;
  }

  function drawGlitch(ctx, size, strength) {
    var s = Math.min(photo.naturalWidth, photo.naturalHeight);
    var sx = (photo.naturalWidth - s) / 2, sy = (photo.naturalHeight - s) / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(photo, sx, sy, s, s, 0, 0, size, size);
    var slices = Math.round(4 + 8 * strength);
    for (var i = 0; i < slices; i++) {
      var y = Math.random() * size, h = 3 + Math.random() * 16 * strength + 2;
      var dx = (Math.random() - 0.5) * size * 0.4 * strength;
      ctx.drawImage(photo, sx, sy + (y / size) * s, s, (h / size) * s, dx, y, size, h);
    }
    for (var j = 0; j < 3; j++) {
      ctx.fillStyle = j % 2 ? 'rgba(255, 40, 160, .22)' : 'rgba(0, 230, 255, .22)';
      ctx.fillRect(0, Math.random() * size, size, 2 + Math.random() * 6);
    }
  }

  function drawCloud(ctx, pts, size, reveal, scan) {
    ctx.fillStyle = '#0c1118';
    ctx.fillRect(0, 0, size, size);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p.x > reveal) continue;
      var since = scan - p.x;                      // how far behind the scan line
      var hot = since >= 0 && since < 22 ? 1 - since / 22 : 0;
      ctx.fillStyle = hot > 0.15 ? 'rgba(255, ' + Math.round(170 + 85 * (1 - hot)) + ', ' + Math.round(90 + 150 * (1 - hot)) + ', ' + (0.45 + hot * 0.55).toFixed(2) + ')' : p.color;
      ctx.fillRect(p.x, p.y, 2.6, 2.6);
    }
    if (scan >= 0 && scan <= size) {               // the scan line itself
      var g = ctx.createLinearGradient(scan - 16, 0, scan, 0);
      g.addColorStop(0, 'rgba(194, 86, 31, 0)');
      g.addColorStop(1, 'rgba(240, 130, 60, .6)');
      ctx.fillStyle = g;
      ctx.fillRect(scan - 16, 0, 16, size);
    }
  }

  function start() {
    if (active) return;
    if (!(photo.complete && photo.naturalWidth)) return;

    var size = Math.round(photo.getBoundingClientRect().width) || 240;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts;
    try { pts = buildPoints(size); } catch (e) { return; }

    var canvas = document.createElement('canvas');
    canvas.className = 'lidar-canvas';
    canvas.width = canvas.height = Math.round(size * dpr);
    canvas.setAttribute('aria-hidden', 'true');
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    wrap.appendChild(canvas);

    var t0 = performance.now();
    var skipTo = null;                              // set when the canvas is clicked
    var state = { canvas: canvas };
    active = state;

    function finish() {
      canvas.remove();
      active = null;
    }

    canvas.addEventListener('click', function () {
      var t = performance.now() - t0;
      if (t < HOLD_END) skipTo = t0 - (HOLD_END - t);   // jump straight to the glitch-out
    });

    if (reduceMotion) {
      drawCloud(ctx, pts, size, size * 2, -1);
      setTimeout(finish, 3000);
      canvas.addEventListener('click', finish);
      return;
    }

    function frame() {
      if (active !== state) return;
      var t = performance.now() - (skipTo !== null ? skipTo : t0);
      if (t >= GLITCH_OUT) { finish(); return; }

      if (t < GLITCH_IN) {
        drawGlitch(ctx, size, 0.4 + 0.6 * (t / GLITCH_IN));
      } else if (t >= HOLD_END) {
        var k = (t - HOLD_END) / (GLITCH_OUT - HOLD_END);
        if (k < 0.5) drawCloud(ctx, pts, size, size * 2, -1);
        else drawGlitch(ctx, size, 1 - (k - 0.5));
      } else {
        var u = t - GLITCH_IN;
        var reveal = Math.min(1, u / SWEEP) * (size + 24);
        var scan = u < SWEEP ? reveal : ((u - SWEEP) % 1100) / 1100 * (size + 24);
        drawCloud(ctx, pts, size, reveal, scan);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  photo.addEventListener('click', function () {
    if (active) return;
    var now = Date.now();
    clicks = now - lastClick > CLICK_GAP ? 1 : clicks + 1;
    lastClick = now;

    if (clicks >= CLICKS_NEEDED) { clicks = 0; start(); }
  });
})();
