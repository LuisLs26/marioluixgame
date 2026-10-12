const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 await page.locator('.edu-close').click();
 assert.equal(await page.evaluate(()=>paused),false);
 // Exercise actual collection hooks; prove simulation stays frozen while answering.
 await page.evaluate(()=>{hitCoin(player,new Thing(Coin));eduFlush();});
 assert.equal(await page.evaluate(()=>paused),true);
 const before=await page.evaluate(()=>({time:data.time.amount,x:player.left,ticks:TimeHandler.getTime()}));
 await page.waitForTimeout(150);
 assert.deepEqual(await page.evaluate(()=>({time:data.time.amount,x:player.left,ticks:TimeHandler.getTime()})),before);
 await page.locator('.edu-option[data-answer="0"]').click();
 assert.match(await page.locator('#edu-feedback').textContent(),/Correcto/);
 await page.locator('#edu-continue').click();
 await page.evaluate(()=>{const item=new Thing(Mushroom);collideFriendly(player,item);eduFlush();});
 assert.match(await page.locator('#edu-title').textContent(),/Crece/);
 await page.locator('.edu-option[data-answer="1"]').click();
 assert.match(await page.locator('#edu-feedback').textContent(),/incorrecta/);
 await page.locator('#edu-continue').click();
 await page.evaluate(()=>{scoreEnemyStomp(new Thing(Koopa));eduFlush();});
 assert.equal(await page.evaluate(()=>eduLocked()),false);
 await page.evaluate(()=>{scoreEnemyFire(new Thing(Goomba));scoreEnemyStar(new Thing(Koopa));eduTrigger('enemigo');eduFlush();});
 assert.equal(await page.evaluate(()=>eduLocked()),false);
 // Pause must remain after release; opposite directions must not get stuck.
 await page.keyboard.press('p'); assert.equal(await page.evaluate(()=>paused),true);
 await page.locator('.edu-close').click();
 await page.keyboard.down('a');await page.keyboard.down('d');await page.keyboard.up('d');
 assert.equal(await page.evaluate(()=>player.keys.run),-1);await page.keyboard.up('a');
 // All bundled levels must load without exceptions.
 await page.evaluate(()=>{for(let w=1;w<=8;w++)for(let l=1;l<=4;l++){setMap(w,l);pause();}setMap(1,1);pause();});
 // Fixed physics: one second must advance 60 ticks at each refresh rate.
 const timing=await page.evaluate(()=>{
  const originals=[maintainSolids,maintainCharacters,maintainPlayer,refillCanvas,eduFlush,QuadsKeeper.determineAllQuadrants,TimeHandler.handleEvents,requestAnimationFrame];
  let ticks=0;maintainSolids=maintainCharacters=maintainPlayer=refillCanvas=eduFlush=QuadsKeeper.determineAllQuadrants=function(){};TimeHandler.handleEvents=function(){ticks++;};requestAnimationFrame=function(){return 0;};
  let result={};[30,60,120,144].forEach(hz=>{ticks=0;paused=false;last_frame_time=1000;physicsAccumulator=0;for(let i=1;i<=hz;i++)upkeep(1000+i*1000/hz);result[hz]=ticks;});
  [maintainSolids,maintainCharacters,maintainPlayer,refillCanvas,eduFlush,QuadsKeeper.determineAllQuadrants,TimeHandler.handleEvents,requestAnimationFrame]=originals;paused=true;return result;
 });assert.deepEqual(timing,{'30':60,'60':60,'120':60,'144':60});
 // Drawing must not drop to 30 FPS because physics and display are out of phase.
 const drawn=await page.evaluate(()=>{
  pause();const originalRAF=requestAnimationFrame, originalDraw=refillCanvas;
  requestAnimationFrame=()=>0;let renders=0;refillCanvas=()=>{renders++;};
  paused=false;last_frame_time=1000;nextRenderTime=1000+1000/60;physicsAccumulator=0;
  let t=1000;for(let i=0;i<60;i++){t+=i%2?1000/30-16.5:16.5;upkeep(t);}
  pause();requestAnimationFrame=originalRAF;refillCanvas=originalDraw;
  return renders;
 });assert.equal(drawn,60);
 // Simulated standard controller, disconnection, and modal navigation.
 await page.evaluate(()=>{window.testPad={index:0,connected:true,id:'Test PS standard',mapping:'standard',axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};navigator.getGamepads=()=>[window.testPad];unpause();});
 await page.evaluate(()=>testPad.axes[0]=1);await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>player.keys.run),1);
 await page.evaluate(()=>testPad.connected=false);await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>player.keys.run),0);
 await page.evaluate(()=>{testPad.connected=true;testPad.axes[0]=0;gainCoin();eduFlush();});await page.waitForTimeout(50);
 await page.evaluate(()=>testPad.buttons[0].pressed=true);await page.waitForTimeout(80);assert.equal(await page.locator('#edu-continue').isVisible(),true);
 await page.evaluate(()=>testPad.buttons[0].pressed=false);await page.waitForTimeout(50);await page.evaluate(()=>testPad.buttons[0].pressed=true);await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>eduLocked()),false);
 await page.evaluate(()=>{testPad.connected=false;});
 // Report measured frame rate separately from deterministic speed checks.
 await page.waitForTimeout(3500);
 console.log('FPS observado:',await page.locator('#fps_counter').textContent());
 console.log('Pruebas: monedas y hongos, enemigos sin preguntas, acierto/error, pausa, 32 niveles, física 30/60/120/144 Hz, mando y desconexión.');
 assert.deepEqual(errors,[]);
 await page.evaluate(()=>{gainCoin();eduFlush();});await page.screenshot({path:path.resolve(__dirname,'../question-preview.png')});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.resolve(__dirname,'../mobile-preview.png')});
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
