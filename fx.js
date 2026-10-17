(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  function spark(x, y, spread, size, dur){
    var s = document.createElement('i');
    s.className = 'fx-spark';
    var a = Math.random() * Math.PI * 2;
    var d = spread * (0.5 + Math.random() * 0.8);
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.margin = (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px';
    s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
    s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(1) + 'px');
    if (dur) s.style.animationDuration = dur;
    document.body.appendChild(s);
    setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, 700);
  }

  // 点击：星芒 + 飞散星点
  document.addEventListener('pointerdown', function(e){
    var x = e.clientX, y = e.clientY;

    var star = document.createElement('i');
    star.className = 'fx-star';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    document.body.appendChild(star);
    setTimeout(function(){ if (star.parentNode) star.parentNode.removeChild(star); }, 620);

    var n = 4 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) spark(x, y, 26, 3 + Math.random() * 2, null);
  }, {passive:true});

  // ================= 滑动光带（canvas 曲线） =================
  var canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  var W = 0, H = 0;

  function resize(){
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var LIFE = 460;
  var pts = [];
  var running = false;

  function tick(){
    ctx.clearRect(0, 0, W, H);
    var now = performance.now();
    while (pts.length && now - pts[0].t > LIFE) pts.shift();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1];
      var p1 = pts[i];
      var pm = pts[i - 2] || p0;
      var age = now - p1.t;
      if (age > LIFE) continue;

      var a = Math.pow(1 - age / LIFE, 1.35);
      var alpha = a * 0.95;

      // 中点平滑：用 p0 作控制点，画到相邻中点，接缝自然
      var qx = (pm.x + p0.x) / 2, qy = (pm.y + p0.y) / 2;
      var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;

      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.quadraticCurveTo(p0.x, p0.y, mx, my);

      ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.1 + 2.6 * a;
      ctx.shadowColor = 'rgba(185,228,255,' + (alpha * 0.85).toFixed(3) + ')';
      ctx.shadowBlur = 14 * a;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    if (pts.length) requestAnimationFrame(tick);
    else running = false;
  }

  document.addEventListener('touchstart', function(){ pts = []; }, {passive:true});

  document.addEventListener('touchmove', function(e){
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    var now = performance.now();
    var last = pts[pts.length - 1];

    if (last) {
      var dx = t.clientX - last.x;
      var dy = t.clientY - last.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1.2) return;

      // 快速滑动时补插值点，避免变成折线/断点
      if (d > 9) {
        var steps = Math.min(8, Math.floor(d / 9));
        for (var k = 1; k <= steps; k++) {
          var f = k / (steps + 1);
          pts.push({
            x: last.x + dx * f,
            y: last.y + dy * f,
            t: now - (1 - f) * 14
          });
        }
      }
    }

    pts.push({x: t.clientX, y: t.clientY, t: now});
    if (pts.length > 160) pts.shift();

    if (!running) { running = true; requestAnimationFrame(tick); }
  }, {passive:true});

  document.addEventListener('touchend', function(){}, {passive:true});
  document.addEventListener('touchcancel', function(){ pts = []; }, {passive:true});
})();
