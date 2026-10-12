const assert=require('node:assert/strict'),path=require('node:path');const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await page.locator('.edu-close').click();
 const ending=await page.evaluate(()=>{
  pause();setMap(1,1);pause();AudioPlayer.toggleMute();
  // Simulate a browser where Stage Clear never produces an ended event.
  AudioPlayer.addEventImmediate=function(){throw Error('Progress must not wait for audio');};
  const pre=area.presolids.find(p=>p.object.title==='FlagDetector');
  if(!pre)throw Error('Flag detector missing');
  scrollWindow(pre.xloc*unitsize-gamescreen.unitwidth*.65);spawnMap();
  const flag=solids.find(s=>s.title==='FlagDetector');
  if(!flag)throw Error('Flag not spawned');
  setLeft(player,flag.pole.left-player.unitwidth);setBottom(player,flag.pole.top+unitsizet16);
  FlagCollision(player,flag);
  const raf=requestAnimationFrame;requestAnimationFrame=()=>0;paused=false;last_frame_time=1000;physicsAccumulator=0;
  let i=0;while(currentmap[0]===1&&currentmap[1]===1&&i<1500){upkeep(1000+(++i)*1000/60);}
  requestAnimationFrame=raf;pause();
  return {world:currentmap.slice(),steps:i,keys:nokeys};
 });console.log('Bandera → castillo → siguiente nivel con audio bloqueado:',ending);assert.deepEqual(ending.world,[1,2]);assert.ok(ending.steps<1500);
 // Actual controller navigation must change focus, support hold/repeat and not
 // auto-answer when a question opens while jump is held.
 await page.evaluate(()=>{setMap(1,1);window.testPad={index:0,connected:true,id:'Test PS',axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};navigator.getGamepads=()=>[testPad];});await page.waitForTimeout(80);
 await page.evaluate(()=>{testPad.buttons[0].pressed=true;gainCoin();eduFlush();});await page.waitForTimeout(120);assert.equal(await page.locator('#edu-continue').isVisible(),false);
 await page.evaluate(()=>testPad.buttons[0].pressed=false);await page.waitForTimeout(80);
 const first=await page.locator('.edu-option.selected').textContent();await page.evaluate(()=>testPad.buttons[13].pressed=true);await page.waitForTimeout(80);assert.notEqual(await page.locator('.edu-option.selected').textContent(),first);
 await page.waitForTimeout(400);const repeated=await page.locator('.edu-option.selected').textContent();assert.notEqual(repeated,first);
 await page.evaluate(()=>testPad.buttons[13].pressed=false);await page.waitForTimeout(60);await page.evaluate(()=>testPad.axes[0]=-1);await page.waitForTimeout(60);assert.notEqual(await page.locator('.edu-option.selected').textContent(),repeated);
 await page.evaluate(()=>{testPad.axes[0]=0;testPad.buttons[0].pressed=true;});await page.waitForTimeout(80);assert.equal(await page.locator('#edu-continue').isVisible(),true);
 await page.screenshot({path:path.resolve(__dirname,'../question-preview.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.resolve(__dirname,'../mobile-preview.png')});
 assert.deepEqual(errors,[]);console.log('Mando: navegación, repetición, confirmación y protección contra salto retenido verificadas.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
