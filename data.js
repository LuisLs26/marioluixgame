/* Data.js */
// A few functions to store and display ~persistent data
// "use strict";

// window.data stores the references to data and elements
function resetData() {
  // Make sure there's no data display already
  var check = document.getElementById("data_display");
  if(check && check.parentNode)
    check.parentNode.removeChild(check);
  
  if(!window.data) {
    window.data = new Data();
    // setDataDisplay();
  }
}
// Keeps information displayed on the screen
function Data() {
  this.playerpower = 1;
  this.traveled = this.traveledold = 0; // only used for random
  this.scorelevs = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];
  this.score = new DataObject(0, 6, "SCORE");
  this.time = new DataObject(350, 3, "TIME");
  this.world = new DataObject(0, 0, "WORLD");
  this.coins = new DataObject(0, 0, "COINS");
  this.lives = new DataObject(3, 1, "LIVES");
  this.time.dir = -1;
  this.scoreold = 0;
}

// Keeps a reference to the actual HTML element on display
function DataObject(amount, length, name) {
  this.amount = amount;
  this.length = length;
  this.name = name;
  this.element = createElement("td", {className: "indisplay"});
}

// Sets up the data display on the screen
function setDataDisplay() {
  var display = createElement("table", {
            id: "data_display",
            className: "display",
            style: {
              width: "100%"
            }}),
      elems = ["score", "coins", "world", "time", "lives"];
  body.appendChild(display);
  data.display = display;
  for(var i in elems) {
    display.appendChild(data[elems[i]].element);
    updateDataElement(data[elems[i]]);
  }
  body.appendChild(data.display);
}

// Getting rid of the display simply means removing it from body
function clearDataDisplay() {
  var display = document.getElementById("data_display") || window.data_display;
  if(display && display.parentNode) display.parentNode.removeChild(display);
}

function toggleLuigi() {
  window.luigi = !window.luigi;
  localStorage.luigi = window.luigi;
  window.player.title = (window.luigi) ? "Luigi" : "Mario";
  setThingSprite(window.player);
}

// Starts the interval of updating data time
// 1 game second is about 25*16.667=416.675ms
function startDataTime() {
  TimeHandler.addEventInterval(updateDataTime, 25, Infinity, data.time);
}
function updateDataTime(me) {
  // If the time direction isn't up (random map), check for timing
  if(me.dir != 1) {
    if(me.amount == 100) playCurrentThemeHurry(); 
    else if(me.amount <= 0) killPlayer(player, true);
  }
  // If time is still enabled, change it by 1
  if(!notime) {
    map.time = me.amount += me.dir;
    updateDataElement(me);
  }
}

// Updates a typical DataObject to its value
function updateDataElement(me) {
  var text = me.name + "<br />" + (me.amount == "Infinity" ? "Inf" : me.amount);
  me.element.innerHTML = text;
  /*if(text.length > 14) me.element.style.width = "490px";
  else */me.element.style.width = "";
}


function score(me, amount, appears) {
  // Don't do negative values
  if(amount <= 0) return;
  // If it's in the form 'score(X)', return 'score(player, x)'
  if(arguments.length == 1) return score(player, me);
  // Keep the high score in localStorage, why not.
  data.score.amount += amount;
  localStorage.highscore = Math.max(Number(localStorage.highscore) || 0, data.score.amount);
  // If it appears, add the element
  if(appears) {
    var text = addText(amount, me.left, me.top);
    text.yvel = -unitsized4;
    TimeHandler.addEvent(killScore, 49, text);
  }
  // Award lives on crossing score thresholds without discarding total score.
  var previous = data.score.amount - amount;
  var earned = Math.floor(data.score.amount / 10000) - Math.floor(previous / 10000);
  if(earned > 0) gainLife(earned);
  updateDataElement(data.score);
}
function killScore(text) {
  if(text && text.parentNode)
    text.parentNode.removeChild(text);
  killNormal(text);
  deleteThing(text, texts, texts.indexOf(text));
}

function findScore(lev) {
  if(lev < data.scorelevs.length) return data.scorelevs[lev];
  gainLife();
  return -1;
}

function gainLife(num, nosound) {
  data.lives.amount += typeof(num) == "number" ? num : 1;
  if(!nosound) AudioPlayer.play("Gain Life");
  updateDataElement(data.lives);
}

function setLives(num) {
  data.lives.amount = Number(num);
  updateDataElement(data.lives);
}

function storePlayerStats() {
  data.playerpower = player.power;
}
function clearPlayerStats() {
  data.playerpower = player.power = 1;
}
