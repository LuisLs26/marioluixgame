(function () {
  'use strict';
  var queue = [], deck = [], current, answered = false, selected = 0, panel, priorFocus;
  var total = 0, correct = 0, streak = 0;
  var uiBar;
  function shuffle(a) { for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function resetInput() { if(window.player) { player.keys = new Keys(); player.canjump = true; } }
  function ensureUI() {
    if(uiBar && uiBar.isConnected) return;
    uiBar = document.getElementById('edu-bar');
    if(uiBar) return;
    var bar=document.createElement('div'); bar.id='edu-bar';
    bar.innerHTML='<span id="edu-progress">Aciertos '+correct+' / '+total+'</span><button id="edu-help">Controles / mando</button><button id="edu-pause">Pausa</button>';
    document.body.appendChild(bar);
    uiBar = bar;
    document.getElementById('edu-help').onclick=function(){ showHelp(); };
    document.getElementById('edu-pause').onclick=window.toggleGamePause;
  }
  function overlay(title) {
    ensureUI(); priorFocus=document.activeElement;
    panel=document.createElement('div'); panel.id='edu-overlay';
    panel.innerHTML='<section class="edu-card" role="dialog" aria-modal="true" aria-labelledby="edu-title"><p class="edu-eyebrow"><span class="edu-block" aria-hidden="true">?</span> MARIO · AULA AVENTURA <span class="edu-coin" aria-hidden="true">●</span></p><h1 id="edu-title"></h1><div id="edu-content"></div></section>';
    document.body.appendChild(panel); document.getElementById('edu-title').textContent=title;
    pause(); resetInput();
  }
  function close() { if(panel)panel.remove(); panel=null; resetInput(); if(priorFocus && priorFocus.isConnected)priorFocus.focus(); }
  window.eduLocked=function(){return !!panel;};
  window.eduResetQueue=function(){queue.length=0;};
  window.eduTrigger=function(kind,thing) {
    if(kind !== 'moneda' && kind !== 'hongo') return;
    if(thing && thing.eduAsked)return;
    if(thing)thing.eduAsked=true;
    queue.push(kind);
  };
  window.eduFlush=function(){
    ensureUI();
    if(!panel && queue.length && window.player && player.alive && !player.dying)showQuestion();
  };
  function showQuestion() {
    var kind=queue.shift();
    if(!deck.length)deck=shuffle(EDU_QUESTIONS.slice());
    current=deck.pop(); answered=false; selected=0;
    var choices=shuffle(current.options.map(function(text,index){return {text:text,index:index};}));
    overlay(kind==='moneda'?'¡Moneda de conocimiento!':'¡Crece aprendiendo!');
    var content=document.getElementById('edu-content');
    content.innerHTML='<p class="edu-source"></p><h2></h2><div class="edu-options"></div><p id="edu-feedback" role="status" aria-live="polite"></p><button id="edu-continue" hidden>Continuar aventura →</button><p class="edu-hint">1–4 o ↑ ↓ + Enter · Mando: cruceta + ✕ / A</p>';
    content.querySelector('.edu-source').textContent='Evaluación de los aprendizajes · sección '+current.section+' · pág. '+current.page;
    content.querySelector('h2').textContent=current.question;
    choices.forEach(function(choice,i){var b=document.createElement('button');b.className='edu-option';b.textContent=(i+1)+'. '+choice.text;b.dataset.answer=choice.index;b.onclick=function(){answer(i);};content.querySelector('.edu-options').appendChild(b);});
    document.getElementById('edu-continue').onclick=function(){close();if(queue.length)showQuestion();else unpause();};
    focusOption(0);
  }
  function focusOption(i){var bs=panel.querySelectorAll('.edu-option'); selected=(i+bs.length)%bs.length;bs.forEach(function(b,n){b.classList.toggle('selected',n===selected);});bs[selected].focus();}
  function answer(i) {
    if(answered || !current)return; answered=true;
    var bs=panel.querySelectorAll('.edu-option'),ok=Number(bs[i].dataset.answer)===current.answer;
    total++;if(ok){correct++;streak++;score(player,250,false);AudioPlayer.play('Coin');}else streak=0;
    bs.forEach(function(b){b.disabled=true;if(Number(b.dataset.answer)===current.answer)b.classList.add('correct');});
    if(!ok)bs[i].classList.add('incorrect');
    var feedback=document.getElementById('edu-feedback');
    feedback.textContent=(ok?'¡Correcto! +250 puntos. ':'Respuesta incorrecta. La respuesta es: '+current.options[current.answer]+'. ')+current.explanation;
    feedback.className=ok?'feedback-good':'feedback-review';
    document.getElementById('edu-progress').textContent='Aciertos '+correct+' / '+total+' · Racha '+streak;
    var next=document.getElementById('edu-continue');next.hidden=false;next.focus();
  }
  window.eduNavigate=function(action){
    if(!panel)return;
    if(panel.querySelector('.edu-options')){
      if((action==='up'||action==='left')&&!answered)focusOption(selected-1);
      if((action==='down'||action==='right')&&!answered)focusOption(selected+1);
      if(action==='confirm'){if(answered)document.getElementById('edu-continue').click();else answer(selected);}
    }else if(action==='confirm'){panel.querySelector('.edu-close').click();}
  };
  function showHelp(){
    if(panel)return; overlay('Tu aventura, tus controles');
    document.getElementById('edu-content').innerHTML='<p>Recoge monedas y consume hongos para responder preguntas. Derrota enemigos sin interrumpir la aventura. El mundo se detiene mientras piensas. Cada acierto suma 250 puntos; los errores incluyen una explicación.</p><p><strong>Teclado:</strong> A/D o ←/→: mover · W/↑/Espacio: saltar · S/↓: agacharse · Shift/X: correr o disparar · P/Escape/Enter: pausa · M: sonido.</p><p><strong>Mando:</strong> stick/cruceta: mover · ✕/A: saltar y confirmar · □/X: correr · Options/Start: pausa. Conéctalo y pulsa un botón.</p><label>Perfil de mando <select id="edu-profile"><option value="standard">Automático / PlayStation / Xbox</option><option value="generic">Genérico USB (botones 3 y 0)</option></select></label><p id="edu-controller">Sin mando detectado</p><button class="edu-close">¡A jugar!</button>';
    var s=document.getElementById('edu-profile');s.value=window.gamepadProfile||'standard';s.onchange=function(){window.gamepadProfile=s.value;try{localStorage.eduGamepadProfile=s.value;}catch(e){}};
    var settings=document.createElement('p');
    settings.innerHTML='<small>Si tu mando tiene otra distribución, ajusta el número de botón (desde 0):</small><br><label>Salto <input id="pad-jump" type="number" min="0" max="31" value="0"></label> <label>Correr <input id="pad-run" type="number" min="0" max="31" value="2"></label> <label>Pausa <input id="pad-pause" type="number" min="0" max="31" value="9"></label><button id="pad-reset">Restablecer botones</button>';
    panel.querySelector('.edu-close').before(settings);
    var quality=document.createElement('p');quality.innerHTML='<label>Gráficos <select id="edu-detail"><option value="low">Rendimiento · PC gama baja</option><option value="high">Más resolución</option></select></label>';
    settings.before(quality);
    var qualitySelect=document.getElementById('edu-detail');try{qualitySelect.value=localStorage.marioDetail||'low';}catch(e){}
    qualitySelect.onchange=function(){try{localStorage.marioDetail=qualitySelect.value;}catch(e){}resizeRenderCanvas();refillCanvas();};
    ['jump','run','pause'].forEach(function(key){var input=document.getElementById('pad-'+key);if(window.padBindings&&padBindings[key]!==undefined)input.value=padBindings[key];input.onchange=function(){var v=Number(input.value);if(Number.isInteger(v)&&v>=0&&v<=31){window.padBindings=window.padBindings||{};padBindings[key]=v;try{localStorage.eduPadBindings=JSON.stringify(padBindings);}catch(e){}}};});
    document.getElementById('pad-reset').onclick=function(){window.padBindings={};try{localStorage.removeItem('eduPadBindings');}catch(e){};document.getElementById('pad-jump').value=0;document.getElementById('pad-run').value=2;document.getElementById('pad-pause').value=9;};
    panel.querySelector('.edu-close').onclick=function(){close();unpause();};panel.querySelector('.edu-close').focus();
  }
  window.toggleGamePause=function(){if(panel)return;if(paused){unpause();return;}overlay('Aventura en pausa');document.getElementById('edu-content').innerHTML='<p>Tómate un respiro. Tu partida te espera.</p><button class="edu-close">Reanudar</button>';panel.querySelector('button').onclick=function(){close();unpause();};panel.querySelector('button').focus();};
  document.addEventListener('keydown',function(e){
    if(!panel)return;
    if(e.target.tagName==='SELECT'||e.target.tagName==='INPUT') { e.stopPropagation(); return; }
    var handled=true;
    if(e.key==='ArrowUp')eduNavigate('up');else if(e.key==='ArrowDown')eduNavigate('down');else if(e.key==='Enter'||e.key===' ') {if(!e.repeat)eduNavigate('confirm');}
    else if(/^[1-4]$/.test(e.key)&&panel.querySelector('.edu-options')&&!answered)answer(Number(e.key)-1);
    else if(e.key==='Tab'){var focusables=Array.from(panel.querySelectorAll('button:not(:disabled):not([hidden]),select,input'));var n=focusables.indexOf(document.activeElement);focusables[(n+(e.shiftKey?-1:1)+focusables.length)%focusables.length].focus();}
    else if((e.key==='Escape'||e.key.toLowerCase()==='p')&&!panel.querySelector('.edu-options'))panel.querySelector('.edu-close').click();
    else handled=false;
    if(handled)e.preventDefault();e.stopImmediatePropagation();
  },true);
  window.addEventListener('blur',function(){resetInput();if(window.gameon&&!paused)pause();});
  document.addEventListener('visibilitychange',function(){if(document.hidden){resetInput();if(window.gameon)pause();}});
  window.eduStart=function(){ensureUI();showHelp();};
})();
