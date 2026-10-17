(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // 点击光效
  document.addEventListener('pointerdown', function(e){
    var d = document.createElement('div');
    d.className = 'fx-ripple';
    d.style.left = e.clientX + 'px';
    d.style.top = e.clientY + 'px';
    document.body.appendChild(d);
    setTimeout(function(){ if (d.parentNode) d.parentNode.removeChild(d); }, 760);
  }, {passive:true});

  // 滑动光点（单指才触发，避免缩放时刷屏）
  var last = 0;
  document.addEventListener('touchmove', function(e){
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    var now = Date.now();
    if (now - last < 52) return;
    last = now;

    var d = document.createElement('i');
    d.className = 'fx-trail';
    d.style.left = t.clientX + 'px';
    d.style.top = t.clientY + 'px';
    document.body.appendChild(d);
    setTimeout(function(){ if (d.parentNode) d.parentNode.removeChild(d); }, 680);
  }, {passive:true});
})();
