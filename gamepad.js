(function(){
  'use strict';
  var previous={}, device=null, wasModal=false, modalReady=false, lastDirection='', repeatAt=0;
  try{window.gamepadProfile=localStorage.eduGamepadProfile||'standard';}catch(e){window.gamepadProfile='standard';}
  try{window.padBindings=JSON.parse(localStorage.eduPadBindings||'{}');}catch(e){window.padBindings={};}
  function release(){if(window.player&&window.controls)Object.keys(previous).forEach(function(k){if(previous[k]&&controls.keyup[k])controls.keyup[k](player.keys);});previous={};lastDirection='';modalReady=false;}
  function tick(timestamp){
    requestAnimationFrame(tick);
    if(!window.player||!window.controls)return;
    var pads=navigator.getGamepads?navigator.getGamepads():[],gp=null;
    for(var i=0;i<pads.length;i++)if(pads[i]&&pads[i].connected){gp=pads[i];break;}
    if(!gp){if(device!==null)release();device=null;return;}
    if(device!==gp.index){release();device=gp.index;}
    function b(n){var v=gp.buttons[n];return !!v&&(typeof v==='object'?v.pressed:v>0.5);}
    var generic=window.gamepadProfile==='generic',x=gp.axes[0]||0,y=gp.axes[1]||0,bindings=window.padBindings||{};
    // Many DirectInput USB pads expose the directional hat as axes 6/7.
    var hx=gp.axes.length>7 ? gp.axes[6] : 0, hy=gp.axes.length>7 ? gp.axes[7] : 0;
    var now={65:x<-.35||b(14)||hx<-.5,68:x>.35||b(15)||hx>.5,87:b(bindings.jump===undefined?(generic?2:0):bindings.jump),83:y>.35||b(13)||hy>.5,90:b(bindings.run===undefined?(generic?0:2):bindings.run),13:b(bindings.pause===undefined?9:bindings.pause),77:b(8)};
    var direction=y<-.5||b(12)||hy<-.5?'up':y>.5||b(13)||hy>.5?'down':now[65]?'left':now[68]?'right':'';
    var modal=!!(window.eduLocked&&eduLocked());
    if(modal!==wasModal){release();wasModal=modal;}
    var status=document.getElementById('edu-controller');if(status&&status.textContent!=='Conectado: '+gp.id)status.textContent='Conectado: '+gp.id;
    if(modal){
      // Require a neutral controller after opening. A held jump must not answer.
      if(!modalReady){if(!direction&&!now[87])modalReady=true;previous=now;return;}
      if(direction && (direction!==lastDirection || timestamp>=repeatAt)){
        eduNavigate(direction);repeatAt=timestamp+(direction!==lastDirection?350:140);
      }
      lastDirection=direction;
      if(now[87]&&!previous[87])eduNavigate('confirm');
      previous=now;return;
    }
    Object.keys(now).forEach(function(k){
      if(now[k]===!!previous[k])return;
      if(k==='13'&&now[k])toggleGamePause();
      else if(k!=='13' && (!paused||!now[k]) && (!window.nokeys||!now[k])){var fn=controls[now[k]?'keydown':'keyup'][k];if(fn)fn(player.keys);}
    });previous=now;
  }
  window.addEventListener('blur',release);
  window.addEventListener('gamepaddisconnected',release);
  requestAnimationFrame(tick);
})();
