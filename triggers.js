/* Triggers.js */
// Keeps track of triggers, which mainly consist of key presses,
// and messages, which would be from an index.html UI

function resetTriggers() {
  // Make the controls object with support for WASD, Arrow keys, Space, and Shift
  window.controls = new Controls({
    left:   [65, 37],          // A, Left Arrow
    right:  [68, 39],          // D, Right Arrow
    up:     [87, 38, 32],      // W, Up Arrow, Space (Jump)
    down:   [83, 40],          // S, Down Arrow (Crouch/Pipe)
    sprint: [90, 88, 16],      // Z, X, Shift (Sprint/Fire)
    pause:  [13, 80, 27],      // Enter, P, Escape
    mute:   [77],              // M (Mute)
  });

  // Set the key events on the body
  proliferate(body, {
      onkeydown: ControlsPipe("keydown", true),
      onkeyup: ControlsPipe("keyup", false),
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
  
  // Set UI triggers
  setMessageTriggers();
}

// Hash table for onkeydown and onkeyup
function Controls(pipes, gamepadPipes) {
  // Pipes is a listing of which actions are piped to by which character codes
  this.pipes = pipes;

  // Actions are piped to the corresponding keydown or keyup via the corresponding ControlsPipe
  var keydown = this.keydown = {
    // Left
    left: function(keys) {
      keys.run = -1;
      keys.left_down = true;
    },
    // Right
    right: function(keys) {
      keys.run = 1;
      keys.right_down = true; // independent of changes to player.keys.run
    },
    // Up / Jump
    up: function(keys) {
      keys.up = true;
      if(player.canjump &&/* !player.crouching &&*/ (player.resting || map.underwater)) {
        keys.jump = 1;
        player.canjump = keys.jumplev = 0;
        // To do: can player make a jumping sound during the spring, and during the pipe cutscenes?
        AudioPlayer.play(player.power > 1 ? "Jump Super" : "Jump Small");
        if(map.underwater) setTimeout(function() {
          player.jumping = keys.jump = false;
        }, timer * 14);
      }
    },
    // Down / Crouch
    down: function(keys) {
      keys.crouch = true;
    },
    // Sprint / Fire
    sprint: function(keys) {
      if(player.power == 3 && keys.sprint == 0 && !keys.crouch)
        player.fire();
      keys.sprint = 1;
    },
    // Pause
    pause: function(keys) {
      if(window.toggleGamePause) toggleGamePause();
      else if(paused) unpause(); else pause(true);
    },
    // Mute / Unmute
    mute: function(keys) {
      AudioPlayer.toggleMute();
    },
    // qqqqqqq
    q: function(keys) {
      if(++qcount > 28) maxlulz();
      switch(qcount) {
        case 7: lulz(); break;
        case 14: superlulz(); break;
        case 21: hyperlulz(); break;
      }
    },
    l: function(keys) {
      toggleLuigi();
    }
  };
  var keyup = this.keyup = {
    // Left
    left: function(keys) {
      keys.left_down = false;
      keys.run = keys.right_down ? 1 : 0;
    },
    // Right
    right: function(keys) {
      keys.right_down = false;
      keys.run = keys.left_down ? -1 : 0;
    },
    // Up
    up: function(keys) {
      if(!map.underwater) keys.jump = keys.up = 0;
      player.canjump = true;
    },
    // Down
    down: function(keys) {
      keys.crouch = 0;
      removeCrouch();
    },
    // Spring
    sprint: function(keys) {
      keys.sprint = 0;
    },
    // Pause (if held down)
    pause: function(keys) {
      // Pause toggles on press, never on release.
    },
  }

  var tag, codes, code, i;
  // Map each character code in pipes to the corresponding key event
  // For each tag ("up", "down"...)
  for(tag in pipes) {
    // For each array of character codes, like 38 (up) or 40 (down)
    codes = pipes[tag];
    for(i in codes) {
      code = codes[i];
      // That code redirects to the equivalent tag (38 -> "up")
      keydown[code] = keydown[tag];
      keyup[code] = keyup[tag];
    }
  }
}

// Generates a pipe to the given name
// For example, ControlsPipe("keydown") pipes to Controls.keydown
function ControlsPipe(name, strict) {
  var responses = controls[name];
  return function(event) {
    // Unlock browser audio on first user gesture
    if(window.AudioPlayer && !window.AudioPlayer.userGestureUnlocked) {
      window.AudioPlayer.userGestureUnlocked = true;
      if(AudioPlayer.resume) AudioPlayer.resume();
    }

    var code = (typeof(event) == "number") ? event : (event.which || event.keyCode || event.control);

    // Prevent default scrolling for space, arrows
    if(event && event.preventDefault && (code == 32 || (code >= 37 && code <= 40))) {
      event.preventDefault();
    }

    if(window.eduLocked && eduLocked()) return;
    if(code === 13 || code === 80 || code === 27) {
      if(name === "keydown" && !event.repeat) controls.keydown.pause(player.keys);
      return;
    }
    if((strict && ((player && player.dead) || window.paused)) || window.nokeys) return;

    // If there is a known response to this character code, do it
    if(responses[code])
      responses[code](player.keys);
    else mlog(name, "Could not", name, code);

    // Record this in the history
    window.gamehistory[gamecount] = [keydown, code];
  };
}

function keydown(event) {
  if((player && player.dead) || window.paused || window.nokeys) return;
  var responses = controls["keydown"];
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) === "object" || event.which)
    event = event.which;
  if(responses[event])
      responses[event](player.keys);

  window.gamehistory[gamecount] = [keydown, event];
}

function keyup(event) {
  if(window.nokeys) return;
  var responses = controls["keyup"];
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) === "object" || event.which)
    event = event.which;
  if(responses[event])
      responses[event](player.keys);

  window.gamehistory[gamecount] = [keyup, event];
}

function contextmenu(event) {
  if(event.preventDefault)
    event.preventDefault();
}

function mousedown(event) {
  // Right click
  if(event.which == 3) {
    if(paused) unpause();
    else if((!window.editor) || (!editing && !editor.playing)) pause(true);
    if(event.preventDefault)
      event.preventDefault()
  }
}

function scriptKeys(oldhistory) {
  var i, entry;
  for(i in oldhistory) {
    entry = oldhistory[i];
    TimeHandler.addEvent(entry[0], i, entry[1]);
    TimeHandler.addEvent(function() { alert(entry[0].name + ", " + entry[1]) }, i);
  }
}


function lulz(options, timer) {
  player.star = true;
  options = options || [Goomba];
  timer = timer || 7;
  TimeHandler.addEventInterval(function() {
    if(characters.length > 210) return;
    var lul = new Thing(options[randInt(options.length)], randBoolJS(), randBoolJS());
    lul.yvel = random() * -unitsizet4;
    lul.xvel = lul.speed = random() * unitsizet2 * randSign();
    addThing(lul, (32 * random() + 128) * unitsize, (88 * random()) * unitsize);
  }, timer, Infinity);
}
function superlulz() {
  lulz([Goomba, Koopa, Beetle, HammerBro, Lakitu, Podoboo, Blooper]);
}
function hyperlulz() {
  lulz([Bowser], 21);
}
function maxlulz() {
  // Sigh....
  // window.palette = arrayShuffle(window.palette, 1);
  // clearAllSprites(true);
  TimeHandler.addEventInterval(function(arr) {
      setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}

//Function to map a new key to a new action
function mapKeyToControl(action, keyCode) {
  
  //check if this mapping already exists
  if(window.controls.pipes[action].indexOf(keyCode) != -1) {
    return;
  }
  
  //add the new key to the current mapping
  window.controls.pipes[action].push(keyCode);
  var newPipes = window.controls.pipes;
  
  //Update the controls of the game
  window.controls = new Controls(newPipes);
  //Update the links between events and the game
  proliferate(body, {
      onkeydown: ControlsPipe("keydown", true),
      onkeyup: ControlsPipe("keyup", false),
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
}

/* Triggers (from a UI)
*/
function setMessageTriggers() {
  // Commands will be sent in by these codes
  var command_codes = {
    setMap: triggerSetMap,
    startEditor: function() { loadEditor(); },
    toggleOption: function(data) { 
      var name = "toggle" + data.option;
      console.log(name, window[name]);
      if(window[name]) window[name]();
      else log("Could not toggle", name);
    },
	setKey: function(data) {
	  mapKeyToControl(data.action, data.keyCode);
	}
  };
  
  // When a message is received, send it to the appropriate command code
  window.addEventListener("message", function(event) {
    if(event.source !== window || event.origin !== location.origin || !event.data) return;
    var data = event.data,
        type = data.type;
    // If the type is known, do it
    if(command_codes[type])
      command_codes[type](data);
    // Otherwise complain
    else {
      console.log("Unknown event type received:", type, ".\n", data);
    }
  });
}

// The UI has requested a map change
function triggerSetMap(data) {
  clearPlayerStats();
  setMap.apply(this, data.map || []);
  setLives(3);
}

