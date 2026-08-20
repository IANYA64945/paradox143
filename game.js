/* =====================================================
   MINIJUEGO DE PÉTALOS
===================================================== */
function resizeGame(){
  gameW=window.innerWidth;
  gameH=window.innerHeight;
  gameDPR=Math.min(window.devicePixelRatio||1,1.6);
  gameCanvas.width=Math.max(1,Math.round(gameW*gameDPR));
  gameCanvas.height=Math.max(1,Math.round(gameH*gameDPR));
  gameCanvas.style.width=gameW+'px';
  gameCanvas.style.height=gameH+'px';
  gctx.setTransform(gameDPR,0,0,gameDPR,0,0);
  const portrait=gameH>gameW;
  arena=portrait
    ?{x:gameW*.08,y:gameH*.20,w:gameW*.84,h:gameH*.62}
    :{x:gameW*.18,y:gameH*.16,w:gameW*.64,h:gameH*.68};
  heart.r=clamp(Math.min(gameW,gameH)*.020,8,11);
  if(!gameRunning){heart.x=arena.x+arena.w*.5;heart.y=arena.y+arena.h*.72}
  clampHeart();
}

function clampHeart(){
  heart.x=clamp(heart.x,arena.x+heart.r,arena.x+arena.w-heart.r);
  heart.y=clamp(heart.y,arena.y+heart.r,arena.y+arena.h-heart.r);
}

function resetGame(){
  resizeGame();
  gameHP=3;
  gameProjectiles=[];
  gameInvulnUntil=0;
  gameSpawn=0;
  heart.x=arena.x+arena.w*.5;
  heart.y=arena.y+arena.h*.72;
  updateGameHud(1,GAME_DURATION);
}

function startPetalGame(){
  challengePanel.classList.add('hidden');
  losePanel.classList.add('hidden');
  finalLetter.classList.remove('show');
  gameCanvas.classList.add('show');
  gameHud.classList.add('show');
  resetGame();
  gameRunning=true;
  gameStart=performance.now();
  gameLast=gameStart;
  gameRAF=requestAnimationFrame(gameLoop);
}

startGameBtn.addEventListener('click',startPetalGame);
retryGameBtn.addEventListener('click',startPetalGame);
playAgainBtn.addEventListener('click',startPetalGame);

function updateGameHud(phase,seconds){
  phaseText.textContent='FASE '+phase;
  /* Oculta desde la derecha 0, 1, 2 o 3 corazones. */
  livesCover.style.width=((3-gameHP)/3*100)+'%';
  timeText.textContent=Math.max(0,Math.ceil(seconds))+' s';
}

function spawnProjectile(phase){
  const r=phase===1?7:(phase===2?8:9);
  let x,y,vx,vy;
  const speed=phase===1?115:(phase===2?150:185);

  if(phase===1){
    x=arena.x+Math.random()*arena.w;
    y=arena.y-r-6;
    vx=(Math.random()-.5)*35;
    vy=speed*(.8+Math.random()*.4);
  }else if(phase===2){
    if(Math.random()<.5){
      x=Math.random()<.5?arena.x-r-6:arena.x+arena.w+r+6;
      y=arena.y+Math.random()*arena.h;
      vx=(x<arena.x?1:-1)*speed*(.85+Math.random()*.35);
      vy=(Math.random()-.5)*70;
    }else{
      x=arena.x+Math.random()*arena.w;
      y=arena.y-r-6;
      vx=(Math.random()-.5)*85;
      vy=speed;
    }
  }else{
    const edge=Math.floor(Math.random()*4);
    if(edge===0){x=arena.x-r;y=arena.y+Math.random()*arena.h}
    else if(edge===1){x=arena.x+arena.w+r;y=arena.y+Math.random()*arena.h}
    else if(edge===2){x=arena.x+Math.random()*arena.w;y=arena.y-r}
    else{x=arena.x+Math.random()*arena.w;y=arena.y+arena.h+r}
    const dx=heart.x-x,dy=heart.y-y,len=Math.hypot(dx,dy)||1;
    vx=dx/len*speed;vy=dy/len*speed;
  }
  gameProjectiles.push({x,y,vx,vy,r,rot:Math.random()*Math.PI,spin:(Math.random()-.5)*4});
}

function drawHeart(x,y,r,alpha=1){
  gctx.save();
  gctx.globalAlpha=alpha;
  gctx.imageSmoothingEnabled=false;

  /* El fondo negro del sprite desaparece con SCREEN. */
  if(playerHeartImg.complete && playerHeartImg.naturalWidth){
    const size=r*5.2;
    gctx.globalCompositeOperation='screen';
    gctx.drawImage(
      playerHeartImg,
      x-size*.5,
      y-size*.5,
      size,
      size
    );
    gctx.globalCompositeOperation='source-over';
  }else{
    /* Respaldo por si la imagen todavía no cargó. */
    gctx.fillStyle='#f39ae4';
    const p=Math.max(2,Math.round(r*.42));
    const cells=[
      [-2,-2],[-1,-3],[0,-2],[1,-3],[2,-2],
      [-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[3,-1],
      [-2,0],[-1,0],[0,0],[1,0],[2,0],
      [-1,1],[0,1],[1,1],[0,2]
    ];
    cells.forEach(([cx,cy])=>gctx.fillRect(Math.round(x+cx*p),Math.round(y+cy*p),p,p));
  }

  gctx.restore();
}

function drawPetal(p){
  gctx.save();
  gctx.translate(p.x,p.y);
  gctx.rotate(p.rot);
  gctx.beginPath();
  gctx.ellipse(0,0,p.r*.62,p.r*1.25,0,0,Math.PI*2);
  gctx.fillStyle='rgba(255,150,194,.92)';
  gctx.shadowColor='rgba(255,130,186,.95)';
  gctx.shadowBlur=12;
  gctx.fill();
  gctx.restore();
}

/* Marco de arena construido con MUCHOS píxeles pequeños. */
function pixelTone(i){
  const tones=['#ffd0ee','#f4afd9','#eb8fca','#d977b7'];
  return tones[Math.abs(i)%tones.length];
}

function drawTinyPixelHeart(cx,cy,px){
  const shape=[
    [-2,-1],[-1,-2],[0,-1],[1,-2],[2,-1],
    [-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],
    [-2,1],[-1,1],[0,1],[1,1],[2,1],
    [-1,2],[0,2],[1,2],[0,3]
  ];
  gctx.fillStyle='#f5abd9';
  shape.forEach(([x,y])=>gctx.fillRect(Math.round(cx+x*px),Math.round(cy+y*px),px,px));
}

function drawPixelArenaFrame(){
  gctx.save();
  gctx.imageSmoothingEnabled=false;

  const px=clamp(Math.floor(Math.min(gameW,gameH)/130),3,6);
  const step=px;
  const x0=Math.round(arena.x/px)*px;
  const y0=Math.round(arena.y/px)*px;
  const x1=Math.round((arena.x+arena.w)/px)*px;
  const y1=Math.round((arena.y+arena.h)/px)*px;

  /* Muchos cuadritos para que el margen se vea claramente pixelado. */
  let k=0;
  for(let x=x0;x<=x1;x+=step){
    gctx.fillStyle=pixelTone(k++);
    gctx.fillRect(x,y0,px,px);
    gctx.fillRect(x,y0+px,px,px);
    gctx.fillStyle=pixelTone(k+2);
    gctx.fillRect(x,y1-px,px,px);
    gctx.fillRect(x,y1,px,px);
  }
  for(let y=y0;y<=y1;y+=step){
    gctx.fillStyle=pixelTone(k++);
    gctx.fillRect(x0,y,px,px);
    gctx.fillRect(x0+px,y,px,px);
    gctx.fillStyle=pixelTone(k+1);
    gctx.fillRect(x1-px,y,px,px);
    gctx.fillRect(x1,y,px,px);
  }

  /* Tres corazones pequeños como el marco de referencia. */
  const hp=Math.max(2,px-1);
  drawTinyPixelHeart(x0+px*.5,y0+arena.h*.34,hp);
  drawTinyPixelHeart(x0+px*.5,y0+arena.h*.68,hp);
  drawTinyPixelHeart(x0+arena.w*.78,y1-px*.5,hp);

  gctx.restore();
}

function gameLoop(now){
  if(!gameRunning)return;
  const dt=Math.min(.034,(now-gameLast)/1000);
  gameLast=now;
  const elapsed=(now-gameStart)/1000;
  const left=GAME_DURATION-elapsed;
  const phase=elapsed<8?1:(elapsed<16?2:3);

  const dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0);
  const dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);
  if(dx||dy){
    const len=Math.hypot(dx,dy)||1;
    heart.x+=dx/len*heart.speed*dt;
    heart.y+=dy/len*heart.speed*dt;
    clampHeart();
  }

  const interval=phase===1?.42:(phase===2?.29:.19);
  gameSpawn+=dt;
  while(gameSpawn>=interval){gameSpawn-=interval;spawnProjectile(phase)}

  for(let i=gameProjectiles.length-1;i>=0;i--){
    const p=gameProjectiles[i];
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;
    if(p.x<arena.x-80||p.x>arena.x+arena.w+80||p.y<arena.y-80||p.y>arena.y+arena.h+80){
      gameProjectiles.splice(i,1);continue;
    }
    if(now>gameInvulnUntil&&Math.hypot(p.x-heart.x,p.y-heart.y)<p.r+heart.r*.72){
      gameHP--;
      gameInvulnUntil=now+900;
      gameProjectiles.splice(i,1);
      if(gameHP<=0){finishGame(false);return}
    }
  }

  gctx.setTransform(gameDPR,0,0,gameDPR,0,0);
  gctx.clearRect(0,0,gameW,gameH);

  const shade=gctx.createRadialGradient(gameW*.5,gameH*.48,10,gameW*.5,gameH*.48,Math.max(gameW,gameH)*.75);
  shade.addColorStop(0,'rgba(15,20,37,.18)');
  shade.addColorStop(1,'rgba(0,0,0,.48)');
  gctx.fillStyle=shade;gctx.fillRect(0,0,gameW,gameH);

  drawPixelArenaFrame();

  gameProjectiles.forEach(drawPetal);
  const blink=now<gameInvulnUntil?(Math.floor(now/90)%2?.28:1):1;
  drawHeart(heart.x,heart.y,heart.r,blink);
  updateGameHud(phase,left);

  if(left<=0){finishGame(true);return}
  gameRAF=requestAnimationFrame(gameLoop);
}

function finishGame(win){
  gameRunning=false;
  cancelAnimationFrame(gameRAF);
  gameCanvas.classList.remove('show');
  gameHud.classList.remove('show');
  if(win){
    finalLetter.classList.add('show');
    if(!bgMusic.paused)bgMusic.volume=.35;
  }else{
    losePanel.classList.remove('hidden');
  }
}

window.addEventListener('keydown',e=>{keys[e.key]=true;if(gameRunning&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()},{passive:false});
window.addEventListener('keyup',e=>{keys[e.key]=false});

function moveHeartToPointer(e){
  const rect=gameCanvas.getBoundingClientRect();
  heart.x=e.clientX-rect.left;
  heart.y=e.clientY-rect.top;
  clampHeart();
}

gameCanvas.addEventListener('pointerdown',e=>{if(!gameRunning)return;gamePointer=true;gameCanvas.setPointerCapture?.(e.pointerId);moveHeartToPointer(e)});
gameCanvas.addEventListener('pointermove',e=>{if(gameRunning&&gamePointer)moveHeartToPointer(e)});
gameCanvas.addEventListener('pointerup',e=>{gamePointer=false;try{gameCanvas.releasePointerCapture?.(e.pointerId)}catch(_){}});
gameCanvas.addEventListener('pointercancel',()=>{gamePointer=false});
window.addEventListener('resize',()=>{if(gameOverlay.classList.contains('show'))resizeGame()});
