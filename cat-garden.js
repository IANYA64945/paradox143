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
    activeToy:'ball',
    toyUses:0,
    scratcherUses:0,
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


  function saveHome(patch={}){
    const next={
      ...home(),
      ...patch
    };

    try{
      localStorage.setItem(
        HOME_KEY,
        JSON.stringify(next)
      );
    }catch(_){}

    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-mewo-home-change',
          {detail:next}
        )
      );
    }catch(_){}

    return next;
  }


  let gardenMoodOverride=null;
  let gardenMoodTimer=0;
  let propTimer=0;

  let gardenActivity=null;
  let gardenActivityTimer=0;
  let gardenNoticeTimer=0;


  function setGardenMood(
    mood,
    text,
    duration=3200
  ){
    gardenMoodOverride=[
      mood,
      text
    ];

    clearTimeout(
      gardenMoodTimer
    );

    syncGarden();

    gardenMoodTimer=
      setTimeout(
        ()=>{
          gardenMoodOverride=null;
          syncGarden();
        },
        duration
      );
  }


  function showGardenNotice(
    text,
    duration=2800
  ){

    clearTimeout(
      gardenNoticeTimer
    );

    weatherNote.textContent=text;
    weatherNote.classList.add(
      'special'
    );

    gardenNoticeTimer=
      setTimeout(
        ()=>{
          weatherNote.classList.remove(
            'special'
          );
          syncGarden();
        },
        duration
      );
  }


  function showGardenProp(
    src,
    duration=2600
  ){
    clearTimeout(
      propTimer
    );

    mewoPropImg.src=src;
    mewoProp.classList.add(
      'show'
    );
    mewoProp.setAttribute(
      'aria-hidden',
      'false'
    );

    propTimer=
      setTimeout(
        ()=>{
          mewoProp.classList.remove(
            'show'
          );
          mewoProp.setAttribute(
            'aria-hidden',
            'true'
          );
        },
        duration
      );
  }


  function startGardenActivity(
    name,
    duration=3900
  ){

    clearTimeout(
      gardenActivityTimer
    );

    gardenActivity=name;

    syncGarden();

    gardenActivityTimer=
      setTimeout(
        ()=>{
          gardenActivity=null;
          syncGarden();
        },
        duration
      );
  }


  function stopGardenActivity(){

    clearTimeout(
      gardenActivityTimer
    );

    gardenActivity=null;

    syncGarden();
  }


  function makeGardenBurst(
    kind='heart'
  ){
    const chars=
      kind==='play'
        ? ['✦','·','✦','♡']
        : kind==='feed'
          ? ['♡','✦','·']
          : ['♡','♡','✦','·'];

    const burst=
      document.createElement(
        'div'
      );

    burst.className=
      `catGardenBurst ${kind}`;

    chars.forEach(
      (char,index)=>{
        const bit=
          document.createElement(
            'span'
          );

        bit.textContent=char;

        bit.style.setProperty(
          '--i',
          index
        );

        burst.appendChild(
          bit
        );
      }
    );

    mewoSpot.appendChild(
      burst
    );

    setTimeout(
      ()=>burst.remove(),
      1200
    );
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
      <button id="catGardenMewoTouch" type="button" aria-label="Interactuar con Mewo">
        <img id="catGardenMewo" src="mewo_idle.png" alt="Mewo">
      </button>

      <div id="catGardenMewoMood"></div>
    </div>

    <div id="catGardenMewoProp" aria-hidden="true">
      <img id="catGardenMewoPropImg" alt="">
    </div>

    <div id="catGardenCareActions" aria-label="Actividades con Mewo">
      <button type="button" data-care="pet">♡ MIMITOS</button>
      <button type="button" data-care="play">● JUGAR</button>
      <button type="button" data-care="feed">◇ COMER</button>
      <button type="button" data-care="sleep">zZ DORMIR</button>
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
      <button
        id="catGardenScratcherUse"
        type="button"
        aria-label="Usar rascador"
      >
        <img id="catGardenScratcher" alt="">
        <img
          id="catGardenScratcherToy"
          src="scratcher_toy.png"
          alt=""
        >
      </button>

      <div id="catGardenScratcherHint"></div>
    </div>

    <div
      id="catGardenToyShelf"
      aria-label="Juguetes de Mewo"
    >
      <button
        type="button"
        data-garden-toy="ball"
        aria-label="Pelotita"
      >
        <img src="toy_ball.png" alt="">
      </button>

      <button
        type="button"
        data-garden-toy="fish"
        aria-label="Pececito"
      >
        <img src="toy_fish.png" alt="">
      </button>

      <button
        type="button"
        data-garden-toy="yarn"
        aria-label="Ovillo"
      >
        <img src="toy_yarn.png" alt="">
      </button>
    </div>

    <div id="catGardenActions">
      <button id="catGardenCraftBtn" type="button">🧵 TALLER</button>
      <button id="catGardenMoveMewoBtn" type="button">🐈 ¿DÓNDE ESTÁ MEWO?</button>
    </div>
  `;
  document.body.appendChild(garden);

  const backBtn=garden.querySelector('#catGardenBack');
  const mewoSpot=garden.querySelector('#catGardenMewoSpot');
  const mewoTouch=garden.querySelector('#catGardenMewoTouch');
  const mewoImg=garden.querySelector('#catGardenMewo');
  const mewoMood=garden.querySelector('#catGardenMewoMood');
  const mewoProp=garden.querySelector('#catGardenMewoProp');
  const mewoPropImg=garden.querySelector('#catGardenMewoPropImg');
  const careActions=garden.querySelector('#catGardenCareActions');
  const mewoAway=garden.querySelector('#catGardenMewoAway');
  const pillowImg=garden.querySelector('#catGardenPillow');

  const scratcherZone=
    garden.querySelector(
      '#catGardenScratcherZone'
    );

  const scratcherUse=
    garden.querySelector(
      '#catGardenScratcherUse'
    );

  const scratcherImg=
    garden.querySelector(
      '#catGardenScratcher'
    );

  const scratcherToy=
    garden.querySelector(
      '#catGardenScratcherToy'
    );

  const scratcherHint=
    garden.querySelector(
      '#catGardenScratcherHint'
    );

  const toyShelf=
    garden.querySelector(
      '#catGardenToyShelf'
    );

  const weatherNote=garden.querySelector('#catGardenWeatherNote');
  const craftBtn=garden.querySelector('#catGardenCraftBtn');
  const whereBtn=garden.querySelector('#catGardenMoveMewoBtn');

  /* =====================================================
     SPRITES Y ESTADOS
  ===================================================== */

  /*
    IMPORTANTE:
    Mewo conserva SIEMPRE el mismo cuerpo/silueta.
    Los estados se comunican mediante símbolos externos,
    texto y animaciones, no cambiando el sprite del cuerpo.
  */
  const MEWO_STABLE_SPRITE='mewo_idle.png';

  const MOODS={
    idle:MEWO_STABLE_SPRITE,
    happy:MEWO_STABLE_SPRITE,
    sleep:MEWO_STABLE_SPRITE,
    play:MEWO_STABLE_SPRITE,
    eat:MEWO_STABLE_SPRITE,
    confused:MEWO_STABLE_SPRITE,
    love:MEWO_STABLE_SPRITE
  };

  function activeWeather(){
    return window.MAGIC_AMBIENT_ACTIVE || null;
  }

  function currentMood(){
    const h=home();
    const w=activeWeather();
    const now=Date.now();

    if(gardenMoodOverride){
      return gardenMoodOverride;
    }

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


  const GARDEN_TOYS={
    ball:{
      src:'toy_ball.png',
      text:'✦ Mewo persigue la pelotita por el claro.'
    },

    fish:{
      src:'toy_fish.png',
      text:'♡ Mewo empuja el pececito con la nariz.'
    },

    yarn:{
      src:'toy_yarn.png',
      text:'⌁ Mewo juega con el ovillo sin soltarlo.'
    }
  };


  function syncFieldMewo(){
    const layer=document.getElementById('mewoHomeLayer');
    if(!layer) return;

    const st=state();
    const hide=st.unlocked && st.mewoLocation==='garden';
    layer.style.display=hide ? 'none' : '';

    /*
      No cambiamos el src del Mewo del campo.
      Antes cat-garden y mewo-event competían por el mismo
      sprite cada pocos segundos y eso provocaba el cambio
      constante de tamaño.
    */
    const residentImg=document.getElementById('mewoResidentImg');
    if(residentImg && !hide){
      residentImg.src=MEWO_STABLE_SPRITE;
    }
  }

  function syncGarden(){
    const st=state();
    const h=home();

    pawBtn.classList.toggle('visible',Boolean(st.unlocked));

    const here=isResident() && st.mewoLocation==='garden';
    mewoSpot.classList.toggle('show',here);
    careActions.classList.toggle('show',here);
    mewoAway.classList.toggle('show',isResident() && !here);

    if(!here){
      mewoProp.classList.remove('show');
      mewoProp.setAttribute('aria-hidden','true');
    }

    const [mood,text]=currentMood();

    if(here){
      mewoImg.src=MEWO_STABLE_SPRITE;
      mewoMood.textContent=text;
      mewoSpot.dataset.mood=mood;
    }else{
      mewoSpot.dataset.mood='';
    }

    const psrc=pillowSource(st.activePillow);
    pillowImg.src=psrc;
    pillowImg.classList.toggle('show',Boolean(psrc));

    /*
      Mewo se mueve físicamente según lo que está haciendo.
      Siempre mantiene el mismo sprite/cuerpo.
    */
    const sleepingOnPillow=
      Boolean(
        here &&
        psrc &&
        mood==='sleep' &&
        !gardenActivity
      );

    mewoSpot.classList.toggle(
      'using-pillow',
      sleepingOnPillow
    );

    mewoSpot.classList.toggle(
      'using-scratcher',
      Boolean(
        here &&
        gardenActivity==='scratcher'
      )
    );

    mewoSpot.classList.toggle(
      'using-toy',
      Boolean(
        here &&
        gardenActivity?.startsWith(
          'toy-'
        )
      )
    );

    const weather=activeWeather();

    mewoSpot.classList.toggle(
      'weather-shelter',
      Boolean(
        here &&
        !gardenActivity &&
        !sleepingOnPillow &&
        weather==='storm'
      )
    );

    mewoSpot.classList.toggle(
      'weather-watch',
      Boolean(
        here &&
        !gardenActivity &&
        !sleepingOnPillow &&
        weather==='stars'
      )
    );


    const scratcherStage=
      Number(
        st.scratcherStage||0
      );

    const ssrc=
      scratcherSource(
        scratcherStage
      );

    scratcherImg.src=ssrc;

    scratcherImg.classList.toggle(
      'show',
      Boolean(ssrc)
    );

    scratcherZone.classList.toggle(
      'complete',
      scratcherStage>=4
    );

    scratcherUse.disabled=
      scratcherStage<=0;

    scratcherHint.textContent=
      scratcherStage>=4
        ? 'tócalo para que Mewo juegue ♡'
        : scratcherStage>0
          ? `construcción ${scratcherStage}/4`
          : 'aún no construido';

    scratcherToy.classList.toggle(
      'show',
      Boolean(
        scratcherStage>=4 &&
        gardenActivity==='scratcher'
      )
    );


    toyShelf.classList.toggle(
      'show',
      scratcherStage>=4
    );

    toyShelf.classList.toggle(
      'disabled',
      !here
    );

    toyShelf
      .querySelectorAll(
        '[data-garden-toy]'
      )
      .forEach(
        button=>{
          button.classList.toggle(
            'active',
            button.dataset.gardenToy===
              (
                st.activeToy ||
                'ball'
              )
          );
        }
      );

    garden.dataset.weather=weather||'normal';

    const notes={
      storm:'⚡ Afuera hay tormenta. Aquí dentro están protegidos.',
      rain:'◇ La lluvia cae fuera del claro protegido.',
      snow:'❄ La nieve queda afuera; el refugio sigue cálido.',
      fog:'◌ La neblina rodea el bosque.',
      stars:'✦ Desde aquí también se ven las estrellas.',
      normal:'☾ El claro está tranquilo.'
    };
    if(
      !weatherNote.classList.contains(
        'special'
      )
    ){
      weatherNote.textContent=
        notes[weather]||
        notes.normal;
    }

    syncFieldMewo();
  }

  /* =====================================================
     INTERACCIONES DIRECTAS CON MEWO EN EL JARDÍN
  ===================================================== */

  function playWithGardenToy(
    toyId
  ){

    const st=state();

    if(
      !isResident() ||
      st.mewoLocation!=='garden'
    ){
      showGardenNotice(
        '🐾 Mewo no está en el jardín ahora mismo.'
      );
      return;
    }


    if(
      Number(
        st.scratcherStage||0
      )<4
    ){
      showGardenNotice(
        '🪵 Termina primero el rascador para abrir su rincón de juguetes.'
      );
      return;
    }


    const toy=
      GARDEN_TOYS[toyId];

    if(!toy){
      return;
    }


    const h=home();
    const now=Date.now();

    save({
      activeToy:toyId,
      toyUses:
        Number(
          st.toyUses||0
        )+1
    });

    saveHome({
      lastPlay:now,
      sleepUntil:0,
      residentPlays:
        Number(
          h.residentPlays||0
        )+1
    });


    startGardenActivity(
      `toy-${toyId}`,
      4300
    );

    showGardenProp(
      toy.src,
      3800
    );

    makeGardenBurst(
      'play'
    );

    setGardenMood(
      'play',
      toy.text,
      4300
    );


    try{
      window.ParadoxStats
        ?.inc
        ?.(
          'gardenToyUses'
        );
    }catch(_){}
  }


  function useGardenScratcher(){

    const st=state();

    if(
      Number(
        st.scratcherStage||0
      )<4
    ){
      showGardenNotice(
        `🪵 El rascador todavía está en construcción (${Number(st.scratcherStage||0)}/4).`
      );
      return;
    }


    if(
      !isResident() ||
      st.mewoLocation!=='garden'
    ){
      showGardenNotice(
        '🐾 Mewo está junto a la canasta. Podrá usarlo cuando vuelva.'
      );
      return;
    }


    const h=home();
    const now=Date.now();

    save({
      scratcherUses:
        Number(
          st.scratcherUses||0
        )+1
    });

    saveHome({
      lastPlay:now,
      sleepUntil:0,
      residentPlays:
        Number(
          h.residentPlays||0
        )+1
    });


    startGardenActivity(
      'scratcher',
      5000
    );

    makeGardenBurst(
      'play'
    );

    setGardenMood(
      'play',
      '✦ Mewo trepa, rasca y juega un rato en su rascador.',
      5000
    );


    try{
      window.ParadoxStats
        ?.inc
        ?.(
          'scratcherUses'
        );
    }catch(_){}
  }


  function careMewo(
    action
  ){
    const st=state();

    if(
      !isResident() ||
      st.mewoLocation!=='garden'
    ){
      return;
    }

    const h=home();
    const now=Date.now();

    if(action==='pet'){
      saveHome({
        lastPet:now,
        sleepUntil:0,
        residentPets:
          Number(h.residentPets||0)+1
      });

      makeGardenBurst('heart');

      setGardenMood(
        'love',
        'prrrrr... ♡ Mewo se acercó para recibir mimitos.',
        3600
      );

      try{
        window.ParadoxStats
          ?.inc
          ?.('mewoPetSessions');
      }catch(_){}

      return;
    }


    if(action==='play'){

      if(
        Number(
          st.scratcherStage||0
        )>=4
      ){

        const toyIds=
          Object.keys(
            GARDEN_TOYS
          );

        const currentIndex=
          Math.max(
            0,
            toyIds.indexOf(
              st.activeToy||
              'ball'
            )
          );

        const nextToy=
          toyIds[
            (
              currentIndex+1
            )%
            toyIds.length
          ];

        playWithGardenToy(
          nextToy
        );

        return;
      }


      saveHome({
        lastPlay:now,
        sleepUntil:0,
        residentPlays:
          Number(h.residentPlays||0)+1
      });

      startGardenActivity(
        'toy-ball',
        3900
      );

      showGardenProp(
        'toy_ball.png',
        3100
      );

      makeGardenBurst('play');

      setGardenMood(
        'play',
        '✦ Mewo persigue la pelotita por el claro.',
        3900
      );

      try{
        window.ParadoxStats
          ?.inc
          ?.('mewoPlaySessions');
      }catch(_){}

      return;
    }


    if(action==='feed'){
      saveHome({
        lastFeed:now,
        sleepUntil:0,
        residentFeeds:
          Number(h.residentFeeds||0)+1
      });

      showGardenProp(
        'food_bowl.png',
        3300
      );

      makeGardenBurst('feed');

      setGardenMood(
        'eat',
        'ñam... ♡ Mewo está comiendo tranquila.',
        4000
      );

      try{
        window.ParadoxStats
          ?.inc
          ?.('mewoFeedSessions');
      }catch(_){}

      return;
    }


    if(action==='sleep'){
      const alreadySleeping=
        Number(h.sleepUntil||0)>now;

      if(alreadySleeping){
        saveHome({
          sleepUntil:0,
          lastPet:now
        });

        makeGardenBurst('heart');

        setGardenMood(
          'happy',
          '♡ Mewo abrió los ojitos al sentirte cerca.',
          3300
        );

        return;
      }

      saveHome({
        sleepUntil:
          now+
          90*1000
      });

      setGardenMood(
        'sleep',
        'zZ... Mewo se acomodó para dormir un rato.',
        4200
      );
    }
  }


  careActions.addEventListener(
    'click',
    event=>{
      const btn=
        event
          .target
          .closest(
            '[data-care]'
          );

      if(!btn){
        return;
      }

      careMewo(
        btn.dataset.care
      );
    }
  );


  scratcherUse.addEventListener(
    'click',
    useGardenScratcher
  );


  toyShelf.addEventListener(
    'click',
    event=>{

      const button=
        event
          .target
          .closest(
            '[data-garden-toy]'
          );

      if(!button){
        return;
      }

      playWithGardenToy(
        button.dataset.gardenToy
      );
    }
  );


  mewoTouch.addEventListener(
    'click',
    ()=>{
      const h=home();

      if(
        Number(h.sleepUntil||0)>
        Date.now()
      ){
        careMewo('sleep');
        return;
      }

      careMewo('pet');
    }
  );


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
    stopGardenActivity();

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
      runner.src=MEWO_STABLE_SPRITE;
      document.body.appendChild(runner);

      invitation.classList.add('leaving');

      /*
        El desplazamiento se anima sin sustituir el cuerpo.
        Así Mewo mantiene exactamente la misma silueta.
      */
      const walkFrames=setInterval(()=>{
        runner.classList.toggle('step');
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
