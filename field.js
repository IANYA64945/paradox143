function makeGroundGlow(){
  const c=document.createElement('canvas'); c.width=160; c.height=42;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(80,21,0,80,21,80);
  gr.addColorStop(0,'rgba(255,232,129,.28)');
  gr.addColorStop(.25,'rgba(176,255,130,.24)');
  gr.addColorStop(.55,'rgba(91,224,112,.12)');
  gr.addColorStop(1,'rgba(55,170,85,0)');
  g.fillStyle=gr; g.fillRect(0,0,160,42); return c;
}

function buildFlowerFrames(atlas){
  flowerFrames=[]; plainFrames=[];
  for(let f=0;f<3;f++){
    const simple=document.createElement('canvas'); simple.width=100; simple.height=192;
    const sg=simple.getContext('2d'); sg.drawImage(atlas,f*100,0,100,192,0,0,100,192); plainFrames.push(simple);
    const c=document.createElement('canvas'); c.width=166; c.height=192;
    const g=c.getContext('2d');
    const halo=g.createRadialGradient(83,43,2,83,43,57);
    halo.addColorStop(0,'rgba(255,247,177,.98)');
    halo.addColorStop(.16,'rgba(255,209,116,.78)');
    halo.addColorStop(.37,'rgba(255,151,126,.54)');
    halo.addColorStop(.58,'rgba(255,116,190,.30)');
    halo.addColorStop(.80,'rgba(246,94,181,.11)');
    halo.addColorStop(1,'rgba(246,94,181,0)');
    g.fillStyle=halo; g.fillRect(20,0,126,108);
    g.drawImage(atlas,f*100,0,100,192,33,0,100,192); flowerFrames.push(c);
  }
}

function buildSky(){
  skyCanvas=document.createElement('canvas');
  skyCanvas.width=Math.max(1,Math.round(W*DPR)); skyCanvas.height=Math.max(1,Math.round(H*DPR));
  const s=skyCanvas.getContext('2d'); s.setTransform(DPR,0,0,DPR,0,0);
  const portrait=H>W;
  const bg=s.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#030713');
  bg.addColorStop(.22,'#081a31');
  bg.addColorStop(portrait?.46:.41,'#103451');
  bg.addColorStop(portrait?.61:.52,'#0d2a3e');
  bg.addColorStop(portrait?.72:.64,'#0a1d16');
  bg.addColorStop(1,'#040906');
  s.fillStyle=bg; s.fillRect(0,0,W,H);

  const haloY=portrait?H*.34:H*.38;
  const halo=s.createRadialGradient(W*.5,haloY,0,W*.5,haloY,Math.max(W,H)*.44);
  halo.addColorStop(0,'rgba(65,114,164,.20)');
  halo.addColorStop(.48,'rgba(32,72,105,.08)');
  halo.addColorStop(1,'rgba(20,45,70,0)');
  s.fillStyle=halo; s.fillRect(0,0,W,H*.76);

  const starCount=VERY_LOW?18:(MEDIUM?30:42);
  s.fillStyle='#edf5ff';
  for(let i=0;i<starCount;i++){
    s.globalAlpha=.28+hash(i*4.3)*.56;
    s.beginPath(); s.arc(hash(i*7.1)*W,hash(i*11.3)*H*.34,.55+hash(i*3.2)*.85,0,Math.PI*2); s.fill();
  }
  s.globalAlpha=1;

  const mx=portrait?W*.82:W*.88, my=portrait?H*.10:H*.13;
  const mr=clamp(Math.min(W,H)*.055,15,29);
  const moon=s.createRadialGradient(mx-mr*.25,my-mr*.25,1,mx,my,mr);
  moon.addColorStop(0,'#fffef5'); moon.addColorStop(.58,'#e8eeff'); moon.addColorStop(1,'#aeb9d8');
  s.fillStyle=moon; s.beginPath(); s.arc(mx,my,mr,0,Math.PI*2); s.fill();
}

function buildRows(){
  const portrait=H>W;
  let base,farCount;
  if(portrait){
    farCount=7;
    base=[
      {bottom:72,w:5,h:9,density:48,opacity:.012,speed:.07,grassH:6,grassOpacity:0,glow:false},
      {bottom:69,w:7,h:12,density:43,opacity:.028,speed:.10,grassH:8,grassOpacity:0,glow:false},
      {bottom:66,w:9,h:16,density:38,opacity:.055,speed:.14,grassH:10,grassOpacity:.01,glow:false},
      {bottom:63,w:11,h:20,density:34,opacity:.10,speed:.18,grassH:13,grassOpacity:.035,glow:false},
      {bottom:60,w:14,h:26,density:30,opacity:.18,speed:.23,grassH:17,grassOpacity:.08,glow:false},
      {bottom:56,w:17,h:32,density:27,opacity:.29,speed:.29,grassH:23,grassOpacity:.18,glow:true},
      {bottom:52,w:21,h:40,density:24,opacity:.43,speed:.36,grassH:30,grassOpacity:.32,glow:true},
      {bottom:48,w:25,h:48,density:22,opacity:.56,speed:.43,grassH:36,grassOpacity:.48,glow:true},
      {bottom:44,w:30,h:58,density:20,opacity:.66,speed:.50,grassH:44,grassOpacity:.59,glow:true},
      {bottom:39,w:36,h:69,density:18,opacity:.75,speed:.58,grassH:52,grassOpacity:.68,glow:true},
      {bottom:34,w:43,h:83,density:16,opacity:.82,speed:.66,grassH:60,grassOpacity:.75,glow:true},
      {bottom:28,w:51,h:98,density:14,opacity:.88,speed:.74,grassH:69,grassOpacity:.81,glow:true},
      {bottom:21,w:60,h:115,density:12,opacity:.93,speed:.82,grassH:78,grassOpacity:.87,glow:true},
      {bottom:14,w:70,h:134,density:10,opacity:.97,speed:.91,grassH:88,grassOpacity:.92,glow:true},
      {bottom:7,w:82,h:157,density:8,opacity:1,speed:.98,grassH:98,grassOpacity:.95,glow:true},
      {bottom:1,w:94,h:180,density:7,opacity:1,speed:1.04,grassH:108,grassOpacity:.97,glow:true}
    ];
  }else{
    farCount=5;
    base=[
      {bottom:58,w:5,h:10,density:72,opacity:.012,speed:.07,grassH:6,grassOpacity:0,glow:false},
      {bottom:55,w:7,h:13,density:62,opacity:.030,speed:.10,grassH:8,grassOpacity:0,glow:false},
      {bottom:52,w:9,h:17,density:54,opacity:.070,speed:.15,grassH:12,grassOpacity:.035,glow:false},
      {bottom:49,w:12,h:23,density:47,opacity:.15,speed:.22,grassH:19,grassOpacity:.12,glow:false},
      {bottom:46,w:15,h:29,density:43,opacity:.28,speed:.29,grassH:25,grassOpacity:.28,glow:true},
      {bottom:43,w:18,h:35,density:42,opacity:.48,speed:.38,grassH:32,grassOpacity:.60,glow:true},
      {bottom:40,w:21,h:40,density:38,opacity:.64,speed:.43,grassH:36,grassOpacity:.70,glow:true},
      {bottom:37,w:24,h:46,density:35,opacity:.69,speed:.48,grassH:40,grassOpacity:.73,glow:true},
      {bottom:34,w:28,h:53,density:32,opacity:.74,speed:.54,grassH:45,grassOpacity:.76,glow:true},
      {bottom:31,w:32,h:61,density:29,opacity:.79,speed:.60,grassH:50,grassOpacity:.79,glow:true},
      {bottom:27,w:37,h:70,density:27,opacity:.84,speed:.66,grassH:56,grassOpacity:.82,glow:true},
      {bottom:23,w:42,h:80,density:24,opacity:.88,speed:.72,grassH:62,grassOpacity:.85,glow:true},
      {bottom:19,w:48,h:91,density:22,opacity:.92,speed:.78,grassH:68,grassOpacity:.87,glow:true},
      {bottom:14,w:54,h:103,density:20,opacity:.95,speed:.84,grassH:76,grassOpacity:.90,glow:true},
      {bottom:9,w:61,h:116,density:18,opacity:.98,speed:.91,grassH:84,grassOpacity:.92,glow:true},
      {bottom:4,w:69,h:132,density:16,opacity:1,speed:1,grassH:94,grassOpacity:.95,glow:true}
    ];
  }

  const sizeScale=portrait?clamp(W/390,.82,1.12):clamp(H/390,.86,1.15);
  rows=base.map((a,i)=>{
    const spacing=W/a.density;
    const idealW=a.w*sizeScale, idealH=a.h*sizeScale;
    const w=Math.min(idealW,spacing*1.13);
    const h=idealH*(w/idealW);
    return{
      baseY:H*(1-a.bottom/100),w,h,spacing,speed:a.speed,alpha:a.opacity,
      phase:(i%2?.50:0)+(hash(i*19.3)-.5)*.10,index:i,
      grassH:a.grassH*sizeScale,grassAlpha:a.grassOpacity,
      horizon:i<farCount,glow:a.glow
    };
  });
}

function drawGroundBase(){
  const portrait=H>W;
  const horizon=portrait?H*.28:H*.405;
  const floor=ctx.createLinearGradient(0,horizon,0,H);
  floor.addColorStop(0,'rgba(13,40,35,.16)');
  floor.addColorStop(.10,'rgba(16,42,25,.55)');
  floor.addColorStop(.25,'#0d2415');
  floor.addColorStop(.60,'#08160d');
  floor.addColorStop(1,'#030805');
  ctx.fillStyle=floor; ctx.fillRect(0,horizon,W,H-horizon);
}

function drawGrassBand(grass,row){
  if(row.grassAlpha<=.005)return;
  const th=row.grassH;
  const tw=th*(grass.width/grass.height);
  const y=row.baseY+th*.08;
  const off=mod(worldX*(row.speed*.72),tw);
  ctx.globalAlpha=row.grassAlpha*.72;
  for(let x=-tw*2+off;x<W+tw*2;x+=tw){ctx.drawImage(grass,x,y-th,tw,th)}
  ctx.globalAlpha=1;
}

function drawTulip(row,j,x,time){
  const seed=j*31.71+row.index*173.9;
  const depth=row.index/Math.max(1,rows.length-1);
  const jitter=(hash(seed)-.5)*row.spacing*.10;
  const vertical=(hash(seed+9)-.5)*row.h*.035;

  const stormActive=
    !!window.MAGIC_STORM_ACTIVE;

  const stormIntensity=
    stormActive
    ? Math.max(
        0,
        Number(
          window.MAGIC_STORM_INTENSITY
          || 1
        )
      )
    : 0;

  const normalSway=
    (VERY_LOW||row.horizon)
    ? 0
    : Math.sin(time*.00110+seed)*row.w*.012;

  /*
    Durante la tormenta los tallos se inclinan
    con ráfagas mucho más fuertes.
  */
  const stormSway=
    (
      stormActive &&
      !row.horizon
    )
    ? (
        Math.sin(
          time*.0105 +
          seed*.39
        )
        *
        row.w
        *
        .105
        *
        stormIntensity
      )
    : 0;

  const xx=
    x+
    jitter+
    normalSway+
    stormSway;

  const yy=
    row.baseY+
    vertical;


  /*
    Algunos tulipanes cercanos son derribados
    durante la tormenta.

    No desaparece todo el campo:
    son huecos dispersos y tallos rotos.
  */

  if(
    stormActive &&
    !row.horizon &&
    row.index>=Math.max(0,rows.length-7)
  ){

    const damage=
      Math.max(
        0,
        Math.min(
          .40,
          Number(
            window.MAGIC_STORM_DAMAGE
            || 0
          )
        )
      );

    const chance=
      damage*
      (
        .34+
        depth*.84
      );


    if(
      hash(seed+771.9)<
      chance
    ){

      const lean=
        (
          hash(seed+80)-.5
        )
        *
        row.w*
        .90;

      const brokenH=
        row.h*
        (
          .28+
          hash(seed+91)*.20
        );


      ctx.globalAlpha=
        row.alpha*.72;

      ctx.strokeStyle=
        'rgba(79,122,57,.88)';

      ctx.lineWidth=
        Math.max(
          1,
          row.w*.055
        );

      ctx.beginPath();

      ctx.moveTo(
        xx,
        yy
      );

      ctx.lineTo(
        xx+lean,
        yy-brokenH
      );

      ctx.stroke();


      /*
        Pétalos caídos.
      */

      ctx.fillStyle=
        'rgba(235,151,184,.82)';

      const petal=
        Math.max(
          1.4,
          row.w*.07
        );

      ctx.fillRect(
        xx+
        lean+
        row.w*.08,
        yy-
        brokenH+
        row.h*.05,
        petal*1.7,
        petal
      );

      ctx.fillRect(
        xx+
        lean-
        row.w*.16,
        yy-
        brokenH+
        row.h*.09,
        petal*1.4,
        petal*.9
      );


      ctx.globalAlpha=1;

      return;
    }
  }


  if(!row.horizon){
    ctx.globalAlpha=row.alpha*(.08+.17*depth);
    ctx.drawImage(groundGlow,xx-row.w*.90,yy-row.h*.025,row.w*1.80,Math.max(6,row.h*.22));
  }

  if(!row.glow){
    ctx.globalAlpha=row.alpha;
    ctx.drawImage(plainFrames[currentFrame],xx-row.w*.5,yy-row.h,row.w,row.h);
    ctx.globalAlpha=1; return;
  }

  const scale=row.h/192, compW=166*scale;
  ctx.globalAlpha=row.alpha;
  ctx.drawImage(flowerFrames[currentFrame],xx-compW*.5,yy-row.h,compW,row.h);
  ctx.globalAlpha=1;
}

function drawDistanceMist(){
  const portrait=H>W;
  const top=portrait?H*.24:H*.375;
  const bottom=portrait?H*.52:H*.585;
  const mist=ctx.createLinearGradient(0,top,0,bottom);
  if(portrait){
    mist.addColorStop(0,'rgba(7,23,38,.88)');
    mist.addColorStop(.18,'rgba(9,30,43,.67)');
    mist.addColorStop(.38,'rgba(11,38,43,.43)');
    mist.addColorStop(.62,'rgba(12,39,35,.18)');
    mist.addColorStop(.82,'rgba(10,32,24,.06)');
    mist.addColorStop(1,'rgba(9,27,18,0)');
  }else{
    mist.addColorStop(0,'rgba(10,35,51,.72)');
    mist.addColorStop(.22,'rgba(12,43,49,.52)');
    mist.addColorStop(.46,'rgba(13,44,40,.29)');
    mist.addColorStop(.70,'rgba(11,36,28,.10)');
    mist.addColorStop(1,'rgba(9,28,18,0)');
  }
  ctx.fillStyle=mist; ctx.fillRect(0,top,W,bottom-top);
}

function render(grass){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(skyCanvas,0,0,skyCanvas.width,skyCanvas.height,0,0,W,H);
  drawGroundBase();
  const now=performance.now();
  let lastHorizon=-1;
  for(let i=0;i<rows.length;i++)if(rows[i].horizon)lastHorizon=i;

  for(let r=0;r<rows.length;r++){
    const row=rows[r];
    drawGrassBand(grass,row);
    const phase=row.phase*row.spacing;
    const off=mod(worldX*row.speed+phase,row.spacing);
    const start=-row.spacing*2+off;
    const count=Math.ceil(W/row.spacing)+5;
    for(let j=0;j<count;j++){
      const x=start+j*row.spacing+row.spacing*.5;
      drawTulip(row,j+r*101,x,now);
    }
    if(r===lastHorizon)drawDistanceMist();
  }

  const fg=ctx.createLinearGradient(0,H*.84,0,H);
  fg.addColorStop(0,'rgba(5,14,8,0)'); fg.addColorStop(1,'rgba(3,8,5,.25)');
  ctx.fillStyle=fg; ctx.fillRect(0,H*.84,W,H*.16);
}

function schedule(grass){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;render(grass)})}

function resize(grass){
  W=Math.max(1,app.clientWidth); H=Math.max(1,app.clientHeight);
  let targetDpr,maxPixels;
  if(VERY_LOW){targetDpr=.92;maxPixels=520000}
  else if(MEDIUM){targetDpr=1.05;maxPixels=920000}
  else{targetDpr=Math.min(window.devicePixelRatio||1,1.30);maxPixels=1350000}
  const allowed=Math.sqrt(maxPixels/(W*H));
  DPR=clamp(Math.min(targetDpr,allowed),.80,1.30);
  canvas.width=Math.max(1,Math.round(W*DPR)); canvas.height=Math.max(1,Math.round(H*DPR));
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  buildSky(); buildRows(); schedule(grass);
}

function startInertia(grass){
  cancelAnimationFrame(inertiaRAF); let previous=performance.now();
  function step(now){
    if(drag)return;
    const dt=Math.min(32,now-previous); previous=now;
    velocity*=Math.pow(.925,dt/16.67);
    if(Math.abs(velocity)<.07){velocity=0;return}
    worldX+=velocity*(dt/16.67); schedule(grass); inertiaRAF=requestAnimationFrame(step);
  }
  inertiaRAF=requestAnimationFrame(step);
}
