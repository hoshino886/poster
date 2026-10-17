(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // QQ/X5 等旧内核没有 performance.now 时回退
  var now = (window.performance && window.performance.now)
    ? function(){ return performance.now(); }
    : function(){ return Date.now(); };

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
    setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, 760);
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

  // ============ 长按：从指尖向外散星光，范围渐大 ============
  var hold = null;
  var holdTimer = null;

  function stopHold(){
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (hold && hold.burst) { clearInterval(hold.burst); }
    if (hold && hold.kill) { clearTimeout(hold.kill); }
    hold = null;
  }

  function startBurst(){
    if (!hold || hold.burst) return;
    hold.burst = setInterval(function(){
      if (!hold) return;
      var age = (now() - hold.start) / 1000;
      if (age > 2.6) { stopHold(); return; }
      var reach = Math.min(14 + age * 34, 82);
      var n = 4 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2;
        spark(hold.x + Math.cos(a) * 3, hold.y + Math.sin(a) * 3, reach, 2 + Math.random() * 2.4, '.72s');
      }
    }, 110);
  }

  document.addEventListener('touchstart', function(e){
    if (!e.touches || e.touches.length !== 1) { stopHold(); return; }
    var t = e.touches[0];
    stopHold();
    hold = {
      x: t.clientX,
      y: t.clientY,
      start: now(),
      burst: null,
      kill: null
    };
    holdTimer = setTimeout(startBurst, 260);
  }, {passive:true});

  document.addEventListener('touchmove', function(e){
    if (!hold || !e.touches || e.touches.length !== 1) return;
    var t = e.touches[0];
    var dx = t.clientX - hold.x;
    var dy = t.clientY - hold.y;
    if (dx * dx + dy * dy > 196) stopHold();   // 移动超过 14px 取消
  }, {passive:true});

  document.addEventListener('touchend', stopHold, {passive:true});

  // 关键：QQ 等浏览器长按会先触发 touchcancel（系统接手势），
  // 这里不立刻停，让星光再持续一会儿
  document.addEventListener('touchcancel', function(){
    if (!hold) return;
    // 有些浏览器（QQ/X5）在长按刚开始就 cancel，
    // 这时定时器还没到点，直接手动启动
    if (!hold.burst) {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      startBurst();
    }
    if (hold.kill) clearTimeout(hold.kill);
    hold.kill = setTimeout(stopHold, 1400);
  }, {passive:true});

  // 兜底：长按若被识别成 contextmenu，也照样爆发
  document.addEventListener('contextmenu', function(){
    if (!hold) return;
    if (!hold.burst) {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      startBurst();
    }
    if (hold.kill) clearTimeout(hold.kill);
    hold.kill = setTimeout(stopHold, 1600);
  }, {passive:true});

  window.addEventListener('scroll', function(){ stopHold(); }, {passive:true});

  // ============ 滑动光带（实时单曲线） ============
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

  var MAXPTS = 26;
  var LIFE = 300;
  var pts = [];
  var running = false;

  function tick(){
    ctx.clearRect(0, 0, W, H);
    var t0 = now();

    while (pts.length > MAXPTS) pts.shift();
    while (pts.length && t0 - pts[0].t > LIFE) pts.shift();

    if (pts.length >= 2) {
      var first = pts[0];
      var last = pts[pts.length - 1];

      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (var i = 1; i < pts.length - 1; i++) {
        var mx = (pts[i].x + pts[i + 1].x) / 2;
        var my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(last.x, last.y);

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

  document.addEventListener('touchmove', function(e){
    if (!e.touches || e.touches.length !== 1) return;
    var t = e.touches[0];
    var t0 = now();
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
          pts.push({x: last.x + dx * f, y: last.y + dy * f, t: t0});
        }
      }
    }

    pts.push({x: t.clientX, y: t.clientY, t: t0});
    if (!running) { running = true; requestAnimationFrame(tick); }
  }, {passive:true});

  window.addEventListener('scroll', function(){ pts = []; }, {passive:true});
  document.addEventListener('touchcancel', function(){ pts = []; }, {passive:true});
})();
