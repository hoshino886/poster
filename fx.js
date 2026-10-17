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

  // ============ 滑动光带（实时、单条曲线） ============
  var canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  var W = 0, H = 0;

  function resize(){
    W = document.documentElement.clientWidth || window.innerWidth;
    H = document.documentElement.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function(){ setTimeout(resize, 120); });

  var MAXPTS = 26;      // 只留最近一小段，实时跟手
  var LIFE = 300;       // 毫秒
  var pts = [];
  var running = false;

  function tick(){
    ctx.clearRect(0, 0, W, H);
    var now = performance.now();

    // 只保留最近的点和最近的时间窗
    while (pts.length > MAXPTS) pts.shift();
    while (pts.length && now - pts[0].t > LIFE) pts.shift();

    if (pts.length >= 2) {
      var first = pts[0];
      var last = pts[pts.length - 1];

      // 单条平滑曲线
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (var i = 1; i < pts.length - 1; i++) {
        var mx = (pts[i].x + pts[i + 1].x) / 2;
        var my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(last.x, last.y);

      // 沿首尾方向做渐变：尾透明、头纯白
      var gx = last.x - first.x;
      var gy = last.y - first.y;
      if (Math.abs(gx) + Math.abs(gy) < 1) { gx = 0.01; gy = 0.01; }
      var grad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.38)');
      grad.addColorStop(1, 'rgba(255,255,255,0.96)');

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.6;
      ctx.shadowColor = 'rgba(180,225,255,0.85)';
      ctx.shadowBlur = 13;
      ctx.stroke();

      // 再描一遍细芯，更亮
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

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
      if (d < 0.8) return;
      if (d > 8) {
        var steps = Math.min(6, Math.floor(d / 8));
        for (var k = 1; k <= steps; k++) {
          var f = k / (steps + 1);
          pts.push({x: last.x + dx * f, y: last.y + dy * f, t: now});
        }
      }
    }

    pts.push({x: t.clientX, y: t.clientY, t: now});
    if (!running) { running = true; requestAnimationFrame(tick); }
  }, {passive:true});

  // 页面滚动时清掉，避免线停在旧位置显得偏移
  window.addEventListener('scroll', function(){ pts = []; }, {passive:true});
  document.addEventListener('touchcancel', function(){ pts = []; }, {passive:true});
  document.addEventListener('touchend', function(){}, {passive:true});
})();
