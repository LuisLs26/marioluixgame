(function(){
  'use strict';
  var previous={}, device=null;
  try{window.gamepadProfile=localStorage.eduGamepadProfile||'standard';}catch(e){window.gamepadProfile='standard';}
  try{window.padBindings=JSON.parse(localStorage.eduPadBindings||'{}');}catch(e){window.padBindings={};}
  function release(){if(window.player&&window.controls)Object.keys(previous).forEach(function(k){if(previous[k]&&controls.keyup[k])controls.keyup[k](player.keys);});previous={};}
  function tick(){
    requestAnimationFrame(tick);
    if(!window.player||!window.controls)return;
    var pads=navigator.getGamepads?navigator.getGamepads():[],gp=null;
    for(var i=0;i<pads.length;i++)if(pads[i]&&pads[i].connected){gp=pads[i];break;}
    if(!gp){if(device!==null)release();device=null;return;}
    if(device!==gp.index){release();device=gp.index;}
    function b(n){var v=gp.buttons[n];return !!v&&(typeof v==='object'?v.pressed:v>0.5);}
    var generic=window.gamepadProfile==='generic',x=gp.axes[0]||0,y=gp.axes[1]||0;
    var bindings=window.padBindings||{};
    var now={65:x<-.3||b(14),68:x>.3||b(15),87:b(bindings.jump===undefined?(generic?2:0):bindings.jump),83:y>.3||b(13),90:b(bindings.run===undefined?(generic?0:2):bindings.run),13:b(bindings.pause===undefined?9:bindings.pause),77:b(8),up:y<-.5||b(12),down:y>.5||b(13)};
    var status=document.getElementById('edu-controller');if(status)status.textContent='Conectado: '+gp.id;
    Object.keys(now).forEach(function(k){
      if(now[k]===!!previous[k])return;
      if(window.eduLocked&&eduLocked()){
        if(now[k]){if(k==='up')eduNavigate('up');if(k==='down')eduNavigate('down');if(k==='87')eduNavigate('confirm');}
      }else if(k!=='up'&&k!=='down'){
        if(k==='13'&&now[k])toggleGamePause();
        else if(k!=='13' && (!paused||!now[k])){var fn=controls[now[k]?'keydown':'keyup'][k];if(fn)fn(player.keys);}
      }
    }); previous=now;
  }
  window.addEventListener('blur',release);
  window.addEventListener('gamepaddisconnected',release);
  requestAnimationFrame(tick);
})();
