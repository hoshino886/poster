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

  // 点击：一颗中心星芒 + 几颗飞散的小星点
  document.addEventListener('pointerdown', function(e){
    var x = e.clientX, y = e.clientY;

    var star = document.createElement('i');
    star.className = 'fx-star';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    document.body.appendChild(star);
    setTimeout(function(){ if (star.parentNode) star.parentNode.removeChild(star); }, 620);

    var n = 4 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) {
      spark(x, y, 26, 3 + Math.random() * 2, null);
    }
  }, {passive:true});

  // 滑动：细碎的星点拖尾
  var last = 0;
  document.addEventListener('touchmove', function(e){
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    var now = Date.now();
    if (now - last < 46) return;
    last = now;

    var x = t.clientX + (Math.random() * 12 - 6);
    var y = t.clientY + (Math.random() * 12 - 6);
    spark(x, y, 10, 2.5 + Math.random() * 2.5, '.5s');
  }, {passive:true});
})();
