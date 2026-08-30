/* =========================================================
   PARADOX143 — JARDÍN DE GATOS 1.0

   Pantalla separada y protegida del clima.
   Mewo puede elegir estar en el jardín o junto a la canasta.
========================================================= */

(() => {
  'use strict';

  const GARDEN_KEY='paradox143_cat_garden_v1';
  const HOME_KEY='paradox143_mewo_home_v1';

  const DEFAULT_STATE={
    unlocked:false,
    followOffered:false,
    firstPillowAt:0,
    mewoLocation:'basket',
    activePillow:null,
    scratcherStage:0,
    discoveredAt:0
  };

  function loadJSON(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      const value=raw?JSON.parse(raw):null;
      return value&&typeof value==='object' ? value : fallback;
    }catch(_){ return fallback; }
  }

  function state(){
    return {...DEFAULT_STATE,...loadJSON(GARDEN_KEY,{})};
  }

  function save(patch={}){
    const next={...state(),...patch};
    try{ localStorage.setItem(GARDEN_KEY,JSON.stringify(next)); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('paradox-cat-garden-change',{detail:next})); }catch(_){}
    return next;
  }

  function home(){
    return loadJSON(HOME_KEY,{resident:false,lastFeed:0,lastPlay:0,lastPet:0,sleepUntil:0,pillowMade:false});
  }

  function isResident(){
    return Boolean(home().resident);
  }

  /* =====================================================
     DOM
  ===================================================== */

  const pawBtn=document.createElement('button');
  pawBtn.id='catGardenPawBtn';
  pawBtn.type='button';
  pawBtn.setAttribute('aria-label','Abrir jardín de gatos');
  pawBtn.innerHTML='<img src="btn_paw_garden.png" alt="">';
  document.body.appendChild(pawBtn);

  const garden=document.createElement('section');
  garden.id='catGarden';
  garden.setAttribute('aria-hidden','true');
  garden.innerHTML=`
    <div class="catGardenBackdrop"></div>
    <div class="catGardenVignette"></div>

    <button id="catGardenBack" type="button" aria-label="Volver al campo">
      <img src="btn_paw_back.png" alt="">
    </button>

    <div id="catGardenWeatherNote" aria-live="polite"></div>

    <div id="catGardenMewoSpot">
      <img id="catGardenMewo" src="mewo_idle.png" alt="Mewo">
      <div id="catGardenMewoMood"></div>
    </div>

    <div id="catGardenMewoAway">
      <span>🐾</span>
      <p>Mewo está descansando junto a la canasta.</p>
    </div>

    <div id="catGardenBedZone">
      <img class="catGardenBedShadow" src="mewo_bed_shadow.png" alt="">
      <img class="catGardenBedBase" src="mewo_bed_base.png" alt="">
      <img id="catGardenPillow" alt="">
    </div>

    <div id="catGardenScratcherZone">
      <img id="catGardenScratcher" alt="">
    </div>

    <div id="catGardenActions">
      <button id="catGardenCraftBtn" type="button">🧵 TALLER</button>
      <button id="catGardenMoveMewoBtn" type="button">🐈 ¿DÓNDE ESTÁ MEWO?</button>
    </div>
  `;
  document.body.appendChild(garden);

  const backBtn=garden.querySelector('#catGardenBack');
  const mewoSpot=garden.querySelector('#catGardenMewoSpot');
  const mewoImg=garden.querySelector('#catGardenMewo');
  const mewoMood=garden.querySelector('#catGardenMewoMood');
  const mewoAway=garden.querySelector('#catGardenMewoAway');
  const pillowImg=garden.querySelector('#catGardenPillow');
  const scratcherImg=garden.querySelector('#catGardenScratcher');
  const weatherNote=garden.querySelector('#catGardenWeatherNote');
  const craftBtn=garden.querySelector('#catGardenCraftBtn');
  const whereBtn=garden.querySelector('#catGardenMoveMewoBtn');

  /* =====================================================
     SPRITES Y ESTADOS
  ===================================================== */

  const MOODS={
    idle:'mewo_idle.png',
    happy:'mewo_happy.png',
    sleep:'mewo_sleep.png',
    play:'mewo_play.png',
    eat:'mewo_eat.png',
    confused:'mewo_confused.png',
    love:'mewo_love.png'
  };

  function activeWeather(){
    return window.MAGIC_AMBIENT_ACTIVE || null;
  }

  function currentMood(){
    const h=home();
    const w=activeWeather();
    const now=Date.now();

    if(w==='storm') return ['confused','Los truenos se oyen lejos. Mewo prefiere quedarse bajo techo.'];
    if(w==='fog') return ['confused','Mewo mira con curiosidad la neblina entre los árboles.'];
    if(w==='snow') return ['sleep','Hace frío afuera. Mewo se acurruca en su rincón.'];
    if(w==='rain') return ['idle','Mewo escucha la lluvia desde el refugio.'];
    if(w==='stars') return ['happy','Mewo se queda mirando los destellos del cielo ♡'];

    if(Number(h.sleepUntil||0)>now) return ['sleep','zZ... está descansando.'];
    if(now-Number(h.lastFeed||now)>8*60*1000) return ['eat','Mewo parece estar pensando en comida.'];
    if(now-Number(h.lastPlay||now)>6*60*1000) return ['play','Mewo tiene ganas de jugar.'];
    if(now-Number(h.lastPet||now)>5*60*1000) return ['love','Mewo se acercó buscando mimitos ♡'];
    return ['happy','Mewo está tranquila en su jardín ♡'];
  }

  function pillowSource(id){
    return id==='huella' ? 'pillow_huella.png'
      : id==='luna' ? 'pillow_luna.png'
      : id==='estrellas' ? 'pillow_estrellas.png'
      : '';
  }

  function scratcherSource(stage){
    if(stage>=4) return 'scratcher_full.png';
    if(stage===3) return 'scratcher_stage3.png';
    if(stage===2) return 'scratcher_stage2.png';
    if(stage===1) return 'scratcher_stage1.png';
    return '';
  }

  function syncFieldMewo(){
    const layer=document.getElementById('mewoHomeLayer');
    if(!layer) return;

    const st=state();
    const hide=st.unlocked && st.mewoLocation==='garden';
    layer.style.display=hide ? 'none' : '';

    const residentImg=document.getElementById('mewoResidentImg');
    if(residentImg && !hide){
      const [mood]=currentMood();
      residentImg.src=MOODS[mood]||MOODS.idle;
    }
  }

  function syncGarden(){
    const st=state();
    const h=home();

    pawBtn.classList.toggle('visible',Boolean(st.unlocked));

    const here=isResident() && st.mewoLocation==='garden';
    mewoSpot.classList.toggle('show',here);
    mewoAway.classList.toggle('show',isResident() && !here);

    if(here){
      const [mood,text]=currentMood();
      mewoImg.src=MOODS[mood]||MOODS.idle;
      mewoMood.textContent=text;
    }

    const psrc=pillowSource(st.activePillow);
    pillowImg.src=psrc;
    pillowImg.classList.toggle('show',Boolean(psrc));

    const ssrc=scratcherSource(Number(st.scratcherStage||0));
    scratcherImg.src=ssrc;
    scratcherImg.classList.toggle('show',Boolean(ssrc));

    const weather=activeWeather();
    garden.dataset.weather=weather||'normal';

    const notes={
      storm:'⚡ Afuera hay tormenta. Aquí dentro están protegidos.',
      rain:'◇ La lluvia cae fuera del claro protegido.',
      snow:'❄ La nieve queda afuera; el refugio sigue cálido.',
      fog:'◌ La neblina rodea el bosque.',
      stars:'✦ Desde aquí también se ven las estrellas.',
      normal:'☾ El claro está tranquilo.'
    };
    weatherNote.textContent=notes[weather]||notes.normal;

    syncFieldMewo();
  }

  /* =====================================================
     ENTRAR / SALIR
  ===================================================== */

  function openGarden(){
    if(!state().unlocked) return false;
    document.body.classList.add('cat-garden-open');
    garden.classList.add('show');
    garden.setAttribute('aria-hidden','false');
    syncGarden();
    try{ window.dispatchEvent(new CustomEvent('paradox-cat-garden-open')); }catch(_){}
    return true;
  }

  function closeGarden(){
    garden.classList.remove('show');
    garden.setAttribute('aria-hidden','true');
    document.body.classList.remove('cat-garden-open');
    syncFieldMewo();
    try{ window.dispatchEvent(new CustomEvent('paradox-cat-garden-close')); }catch(_){}
  }

  pawBtn.addEventListener('click',openGarden);
  backBtn.addEventListener('click',closeGarden);

  craftBtn.addEventListener('click',()=>{
    window.dispatchEvent(new CustomEvent('paradox-open-cat-crafting'));
  });

  whereBtn.addEventListener('click',()=>{
    const st=state();
    if(!isResident()){
      mewoAway.querySelector('p').textContent='Mewo todavía no vive aquí.';
      mewoAway.classList.add('show');
      return;
    }

    const here=st.mewoLocation==='garden';
    if(here){
      mewoMood.textContent='Mewo eligió pasar este rato en el jardín ♡';
    }else{
      mewoAway.querySelector('p').textContent='Mewo eligió descansar junto a la canasta. Volverá cuando quiera ♡';
      mewoAway.classList.add('show');
    }
  });

  /* =====================================================
     MEWO TE PIDE SEGUIRLA
  ===================================================== */

  let invitation=null;

  function showInvitation(){
    if(invitation || state().unlocked) return;

    save({followOffered:true,mewoLocation:'garden'});

    invitation=document.createElement('div');
    invitation.id='mewoFollowInvitation';
    invitation.innerHTML=`
      <div class="mewoFollowCard">
        <img src="mewo_follow_hint.png" alt="">
        <strong>Mewo quiere que la sigas...</strong>
        <small>Parece que quiere enseñarte un lugar que encontró entre los árboles.</small>
        <button type="button">Seguir a Mewo ♡</button>
      </div>
    `;
    document.body.appendChild(invitation);

    invitation.querySelector('button').addEventListener('click',()=>{
      const runner=document.createElement('img');
      runner.id='mewoFollowRunner';
      runner.src='mewo_follow_1.png';
      document.body.appendChild(runner);

      invitation.classList.add('leaving');

      let frame=1;
      const walkFrames=setInterval(()=>{
        frame=frame===1?2:1;
        runner.src=`mewo_follow_${frame}.png`;
      },180);

      setTimeout(()=>runner.classList.add('run'),50);

      setTimeout(()=>{
        clearInterval(walkFrames);
        save({unlocked:true,discoveredAt:Date.now(),mewoLocation:'garden'});
        invitation?.remove();
        invitation=null;
        runner.remove();
        syncGarden();
        openGarden();
      },2500);
    });
  }

  function checkUnlock(){
    const st=state();
    if(st.unlocked || !isResident()) return;
    if(!st.firstPillowAt) return;

    /* Un minuto real después de terminar la primera almohada. */
    if(Date.now()-Number(st.firstPillowAt)>=60000){
      showInvitation();
    }
  }

  /* =====================================================
     MEWO ELIGE DÓNDE PASAR EL RATO
  ===================================================== */

  function chooseMewoPlace(){
    const st=state();
    if(!st.unlocked || !isResident() || garden.classList.contains('show')) return;
    if(window.MAGIC_SPECIAL_PENDING) return;

    const next=Math.random()<.52 ? 'garden' : 'basket';
    save({mewoLocation:next});
    syncGarden();
  }

  setInterval(checkUnlock,5000);
  setInterval(chooseMewoPlace,150000);
  setInterval(syncGarden,2500);

  window.addEventListener('paradox-mewo-home-change',syncGarden);
  window.addEventListener('paradox-cat-garden-change',syncGarden);
  document.addEventListener('paradox-stats-changed',syncGarden);

  window.ParadoxCatGarden={
    getState:state,
    save,
    unlock(){
      save({unlocked:true,discoveredAt:Date.now()});
      syncGarden();
    },
    open:openGarden,
    close:closeGarden,
    setMewoLocation(location){
      if(!['basket','garden'].includes(location)) return;
      save({mewoLocation:location});
      syncGarden();
    },
    refresh:syncGarden
  };

  syncGarden();
  checkUnlock();
})();
