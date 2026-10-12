/* Upkeep.js */
// Contains functions associated with the upkeep

var last_frame_time = 0;
var frame_count = 0;
var fps_last_calc = 0;

var physicsAccumulator = 0;
function upkeep(timestamp) {
  if(window.paused) return;
  window.nextupk = requestAnimationFrame(upkeep);
  timestamp = typeof timestamp === "number" ? timestamp : performance.now();
  if(!last_frame_time) { last_frame_time=timestamp; fps_last_calc=timestamp; return; }
  var elapsed = Math.min(timestamp-last_frame_time, 100);
  physicsAccumulator += elapsed;
  last_frame_time=timestamp;
  var stepTime=1000/60, steps=0;
  while(physicsAccumulator+0.001 >= stepTime && steps<5 && !paused) {
    physicsAccumulator-=stepTime; ++steps;
    for(var i=window.speed;i>0 && !paused;--i) {
      QuadsKeeper.determineAllQuadrants(solids);
      maintainSolids(); maintainCharacters(); maintainPlayer();
      if(texts.length)maintainTexts();
      TimeHandler.handleEvents();
      if(window.eduFlush)eduFlush();
    }
  }
  if(steps===5)physicsAccumulator=Math.min(physicsAccumulator,stepTime);
  if(steps || elapsed >= 14) { refillCanvas(); ++frame_count; }
  if(timestamp-fps_last_calc>=1000) {
    window.fps=Math.round(frame_count*1000/(timestamp-fps_last_calc));
    var el=document.getElementById("fps_counter");
    if(!el){el=document.createElement("div");el.id="fps_counter";body.appendChild(el);}
    el.textContent=fps+" FPS";frame_count=0;fps_last_calc=timestamp;
  }
}

function adjustFPS() {
  // Handled smoothly in upkeep frame loop
}

function pause(big) {
  if(paused && !window.nextupk) return;
  if(window.nextupk) {
    cancelAnimationFrame(nextupk);
    clearTimeout(nextupk);
    window.nextupk = null;
  }
  AudioPlayer.pause();
  paused = true;
  if(big) AudioPlayer.play("Pause");
}

function unpause() {
  if(!paused || (window.eduLocked && eduLocked())) return;
  last_frame_time = 0;
  physicsAccumulator = 0;
  frame_count = 0;
  window.time_prev = (window.performance && performance.now) ? performance.now() : now();
  window.nextupk = requestAnimationFrame(upkeep);
  paused = false;
  AudioPlayer.resume();
}


// Solids by themselves don't really do much
function maintainSolids(update) {
  for(var i = 0, solid; i < solids.length; ++i) {
    solid = solids[i];
    if(solid.alive) {
      if(solid.movement) {
        solid.movement(solid);
        QuadsKeeper.determineThingQuadrants(solid);
      }
    }
    if(!solid.alive || solid.right < QuadsKeeper.getDelX())
      deleteThing(solid, solids, i--);
  }
}

function maintainCharacters(update) {
  var delx = gamescreen.right + QuadsKeeper.getOutDifference(),
      character, i;
  for(i = 0; i < characters.length; ++i) {
    character = characters[i];
    // Gravity
    if(!character.resting) {
      if(!character.nofall) character.yvel += character.gravity || map.gravity;
      character.yvel = min(character.yvel, map.maxyvel);
    } else character.yvel = 0;
    
    // Position updating and collision detection
    updatePosition(character);
    QuadsKeeper.determineThingQuadrants(character);
    character.under = character.undermid = false;
    determineThingCollisions(character);
    
    // Resting tests
    if(character.resting) {
      if(!characterOnResting(character, character.resting)) {
        character.resting = false; // Necessary for moving platforms :(
      } else {
        /*character.jumping = */character.yvel = false;
        setBottom(character, character.resting.top);
      }
    }
    
    // Movement or deletion
    // To do: rethink this...
    //// Good for performance if gamescreen.bottom - gamescreen.top is saved in screen and updated on shift
    // To do: is map.shifting needed?
    if(character.alive) {
      if(character.type != "player" && !map.shifting && 
          (character.numquads == 0 || character.left > delx) && !character.outerok) {
          // (character.top > gamescreen.bottom - gamescreen.top || character.left < + quads.width * -1)) {
        deleteThing(character, characters, i--);
      }
      else {
        if(!character.nomove && character.movement)
          character.movement(character);
        // if(update) updateDisplay(character);
      }
    }
    else if(!map.shifting) deleteThing(character, characters, i--);
    
  }
}

function maintainPlayer(update) {
  if(!player.alive) return;
  
  // Player is falling
  if(player.yvel > 0) {
    if(!map.underwater) player.keys.jump = 0;
    // Jumping?
    if(!player.jumping) {
      // Paddling? (from falling off a solid)
      if(map.underwater) {
        if(!player.paddling) {
          switchClass(player, "paddling", "paddling");
          player.padding = true;
        }
      }
      else {
        addClass(player, "jumping");
        player.jumping = true;
      }
    }
    // Player has fallen too far
    if(!player.piping && !player.dying && player.top > gamescreen.deathheight) {
      // If the map has an exit loc (cloud world), transport there
      if(map.exitloc) {
        // Random maps will pretend he died
        if(map.random) {
          goToTransport(["Random", "Overworld", "Down"]);
          playerDropsIn();
          return;
        }
        // Otherwise just shift to the location
        return shiftToLocation(map.exitloc);
      }
      // Otherwise, since Player is below the gamescreen, kill him dead
      clearPlayerStats();
      killPlayer(player, 2);
    }
  }
  
  // Player is moving to the right
  if(player.xvel > 0) {
    if(player.right > gamescreen.middlex) {
      // If Player is to the right of the gamescreen's middle, move the gamescreen
      if(player.right > gamescreen.right - gamescreen.left)
        player.xvel = min(0, player.xvel);
    }
  }
  // Player is moving to the left
  else if(player.left < 0) {
    // Stop Player from going to the left.
    player.xvel = max(0, player.xvel);
  }
  
  // Player is hitting something (stop jumping)
  if(player.under) player.jumpcount = 0;
  
  // Scrolloffset is how far over the middle player's right is
  // It's multiplied by 0 or 1 for map.canscroll
  window.scrolloffset = (map.canscroll/* || (map.random && !map.noscroll)*/) * (player.right - gamescreen.middlex);
  if(scrolloffset > 0 && !map.shifting) {
    scrollWindow(lastscroll = round(min(player.scrollspeed, scrolloffset)));
  }
  else lastscroll = 0;
}

// Deletion checking is done by an interval set in shiftToLocation
// This simply does velocity
function maintainTexts() {
  var element, me, i;
  for(i = texts.length - 1; i >= 0; --i) {
    me = texts[i];
    element = me.element || me;
    if(me.xvel) elementShiftLeft(element, me.xvel);
    if(me.yvel) elementShiftTop(element, me.yvel);
  }
}
