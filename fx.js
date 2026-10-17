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

  function line(x1, y1, x2, y2){
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1.5) return;
    var d = document.createElement('i');
    d.className = 'fx-line';
    d.style.left = x1 + 'px';
    d.style.top = y1 + 'px';
    d.style.width = len + 'px';
    d.style.transform = 'rotate(' + Math.atan2(dy, dx) + 'rad)';
    document.body.appendChild(d);
    setTimeout(function(){ if (d.parentNode) d.parentNode.removeChild(d); }, 500);
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

  // 滑动：白色光带 + 星点
  var prev = null, lastSpark = 0, lastLine = 0;

  document.addEventListener('touchstart', function(){ prev = null; }, {passive:true});

  document.addEventListener('touchmove', function(e){
    if (e.touches.length !== 1) { prev = null; return; }
    var t = e.touches[0];
    var x = t.clientX, y = t.clientY;
    var now = Date.now();

    if (prev && now - lastLine > 22) {
      lastLine = now;
      line(prev.x, prev.y, x, y);
    }
    prev = {x: x, y: y};

    if (now - lastSpark > 60) {
      lastSpark = now;
      spark(x + (Math.random() * 12 - 6), y + (Math.random() * 12 - 6), 10, 2.5 + Math.random() * 2.5, '.5s');
    }
  }, {passive:true});

  document.addEventListener('touchend', function(){ prev = null; }, {passive:true});
  document.addEventListener('touchcancel', function(){ prev = null; }, {passive:true});
})();
