/* =========================================================
   PARADOX143 — CONVIVENCIA DE LA FAMILIA · ETAPA 1

   Mewo + Marie + Tuluz

   OBJETIVOS:
   - que el refugio se sienta vivo incluso sin eventos grandes
   - Marie: tranquila, cariñosa y dormilona
   - Tuluz: juguetón, inquieto y curioso
   - Mewo sigue siendo la gata principal
   - los tres reaccionan entre sí y al clima
   - 6 momentos especiales desbloquean 6 cartitas

   IMPORTANTE:
   Marie y Tuluz siguen existiendo SOLO dentro del Claro.
========================================================= */

(() => {
  'use strict';

  const KEY=
    'paradox143_refuge_family_life_v1';

  const PENDING_KEY=
    'paradox143_family_letters_pending_v1';


  const DEFAULT={
    createdAt:0,

    gardenOpens:0,
    familyMoments:0,

    moreSeen:false,
    pillowSeen:false,
    letSleepSeen:false,
    siblingsSeen:false,
    closeSeen:false,
    fullSeen:false,

    randomScenes:0,
    tuluzToyScenes:0,
    tuluzScratcherScenes:0,
    marieSleepScenes:0,
    marieCuddleScenes:0,

    lastSceneAt:0
  };


  const FAMILY_LETTERS=[
    'family-more',
    'family-pillow',
    'family-let-sleep',
    'family-siblings',
    'family-close',
    'family-full'
  ];


  const FAMILY_STATE_KEY=
    'paradox143_refuge_family_v1';


  let garden=null;
  let mewoSpot=null;
  let grayBtn=null;
  let orangeBtn=null;
  let grayImg=null;
  let orangeImg=null;
  let letterDrop=null;
  let letterCount=null;

  let openTimer=0;
  let lifeTimer=0;
  let weatherTimer=0;
  let sceneTimer=0;
  let cleanupTimer=0;

  let sceneRunning=false;
  let currentScene=null;
  let previousWeather=null;


  function loadJSON(
    key,
    fallback
  ){

    try{

      const raw=
        localStorage.getItem(
          key
        );

      if(!raw){
        return fallback;
      }

      const parsed=
        JSON.parse(raw);

      return (
        parsed &&
        typeof parsed==='object'
      )
        ? parsed
        : fallback;

    }

    catch(_){

      return fallback;
    }
  }


  function saveJSON(
    key,
    value
  ){

    try{

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    }

    catch(_){}
  }


  function load(){

    const value=
      loadJSON(
        KEY,
        {}
      );

    const next={
      ...DEFAULT,
      ...value
    };


    if(!next.createdAt){

      next.createdAt=
        Date.now();

      saveJSON(
        KEY,
        next
      );
    }


    return next;
  }


  function save(
    patch={}
  ){

    const next={
      ...load(),
      ...patch
    };

    saveJSON(
      KEY,
      next
    );

    return next;
  }


  function familyState(){

    return {
      grayArrived:false,
      orangeArrived:false,
      ...loadJSON(
        FAMILY_STATE_KEY,
        {}
      )
    };
  }


  function gardenState(){

    try{

      return (
        window.ParadoxCatGarden
          ?.getState
          ?.()
      ) || {};

    }

    catch(_){

      return {};
    }
  }


  function isGardenOpen(){

    return Boolean(
      garden &&
      garden.classList.contains(
        'show'
      )
    );
  }


  function arrivalEventRunning(){

    return Boolean(
      document.body.classList.contains(
        'refuge-arrival-event-open'
      )
      ||
      window.ParadoxRefugeArrivalEvents
        ?.isRunning
        ?.()
    );
  }


  function workshopOpen(){

    const overlay=
      document.getElementById(
        'catCraftOverlay'
      );

    return Boolean(
      overlay &&
      overlay.classList.contains(
        'show'
      )
    );
  }


  function bothNewCatsHere(){

    const st=
      familyState();

    return Boolean(
      st.grayArrived &&
      st.orangeArrived
    );
  }


  function mewoIsHere(){

    const st=
      gardenState();

    return Boolean(
      document.getElementById(
        'catGardenMewoSpot'
      )
      ?.classList
      .contains(
        'show'
      )
      ||
      st.mewoLocation==='garden'
    );
  }


  function allThreeHere(){

    return Boolean(
      bothNewCatsHere() &&
      mewoIsHere()
    );
  }


  function canRunScene(){

    return Boolean(
      isGardenOpen() &&
      bothNewCatsHere() &&
      !sceneRunning &&
      !arrivalEventRunning() &&
      !workshopOpen()
    );
  }


  function ensureDOM(){

    garden=
      document.getElementById(
        'catGarden'
      );

    if(!garden){
      return false;
    }


    mewoSpot=
      document.getElementById(
        'catGardenMewoSpot'
      );

    grayBtn=
      document.getElementById(
        'refugeGrayCat'
      );

    orangeBtn=
      document.getElementById(
        'refugeOrangeCat'
      );

    grayImg=
      document.getElementById(
        'refugeGrayCatImg'
      );

    orangeImg=
      document.getElementById(
        'refugeOrangeCatImg'
      );


    if(
      !document.getElementById(
        'refugeFamilyLetterDrop'
      )
    ){

      letterDrop=
        document.createElement(
          'button'
        );

      letterDrop.id=
        'refugeFamilyLetterDrop';

      letterDrop.type=
        'button';

      letterDrop.setAttribute(
        'aria-label',
        'Recuerdo de la familia'
      );

      letterDrop.innerHTML=`
        <span class="familyLetterEnvelope">
          <span>♡</span>
        </span>

        <span class="familyLetterSpark">
          ✦
        </span>

        <small id="refugeFamilyLetterCount"></small>
      `;


      garden.appendChild(
        letterDrop
      );


      letterDrop.addEventListener(
        'click',
        openNextFamilyLetter
      );
    }


    letterDrop=
      document.getElementById(
        'refugeFamilyLetterDrop'
      );

    letterCount=
      document.getElementById(
        'refugeFamilyLetterCount'
      );


    return Boolean(
      grayBtn &&
      orangeBtn
    );
  }


  /* =====================================================
     CARTITAS DE CONVIVENCIA
  ===================================================== */

  function loadPending(){

    const arr=
      loadJSON(
        PENDING_KEY,
        []
      );

    return Array.isArray(arr)
      ? arr.filter(
          id=>
            FAMILY_LETTERS
              .includes(id)
        )
      : [];
  }


  function hasLetter(
    id
  ){

    try{

      return Boolean(
        window.ParadoxLetters
          ?.has
          ?.(
            id
          )
      );

    }

    catch(_){

      return false;
    }
  }


  function cleanPending(){

    const next=
      loadPending()
        .filter(
          id=>
            !hasLetter(id)
        );

    saveJSON(
      PENDING_KEY,
      next
    );

    return next;
  }


  function refreshLetterDrop(){

    if(!letterDrop){
      return;
    }


    const pending=
      cleanPending();


    letterDrop.classList.toggle(
      'show',
      pending.length>0
    );


    letterCount.textContent=
      pending.length>1
        ? `+${pending.length-1}`
        : '';
  }


  function queueLetter(
    id
  ){

    if(
      !FAMILY_LETTERS
        .includes(id)
      ||
      hasLetter(id)
    ){
      return false;
    }


    const pending=
      loadPending();


    if(
      pending.includes(id)
    ){
      return false;
    }


    pending.push(id);

    saveJSON(
      PENDING_KEY,
      pending
    );


    refreshLetterDrop();


    showSceneNote(
      '💌 apareció una nueva cartita de la familia...',
      3500
    );


    return true;
  }


  function openNextFamilyLetter(){

    const pending=
      cleanPending();

    const id=
      pending[0];


    if(!id){

      refreshLetterDrop();
      return;
    }


    try{

      window.ParadoxLetters
        ?.open
        ?.(
          id,
          true
        );

    }

    catch(_){}
  }


  window.addEventListener(
    'paradox-letter-collected',
    event=>{

      const id=
        event
          ?.detail
          ?.id;


      if(
        !FAMILY_LETTERS
          .includes(id)
      ){
        return;
      }


      const next=
        loadPending()
          .filter(
            value=>
              value!==id
          );

      saveJSON(
        PENDING_KEY,
        next
      );

      refreshLetterDrop();
    }
  );


  /* =====================================================
     AYUDAS VISUALES
  ===================================================== */

  function showSceneNote(
    message,
    duration=3200
  ){

    if(!garden){
      return;
    }


    let note=
      document.getElementById(
        'refugeFamilyLifeNote'
      );


    if(!note){

      note=
        document.createElement(
          'div'
        );

      note.id=
        'refugeFamilyLifeNote';

      garden.appendChild(
        note
      );
    }


    note.textContent=
      message;

    note.classList.remove(
      'show'
    );

    void note.offsetWidth;

    note.classList.add(
      'show'
    );


    clearTimeout(
      cleanupTimer
    );


    cleanupTimer=
      setTimeout(
        ()=>{
          note.classList.remove(
            'show'
          );
        },
        duration
      );
  }


  function burst(
    target,
    symbols=[
      '♡',
      '✦'
    ]
  ){

    if(!target){
      return;
    }


    const cloud=
      document.createElement(
        'span'
      );

    cloud.className=
      'refugeFamilyBurst';


    symbols.forEach(
      (
        symbol,
        index
      )=>{

        const bit=
          document.createElement(
            'i'
          );

        bit.textContent=
          symbol;

        bit.style.setProperty(
          '--i',
          index
        );

        cloud.appendChild(
          bit
        );
      }
    );


    target.appendChild(
      cloud
    );


    setTimeout(
      ()=>cloud.remove(),
      1500
    );
  }


  function clearSceneClasses(){

    if(!garden){
      return;
    }


    [
      'family-scene-three',
      'family-scene-pillow',
      'family-scene-let-sleep',
      'family-scene-siblings',
      'family-scene-close',
      'family-scene-tuluz-toy',
      'family-scene-tuluz-scratcher',
      'family-scene-marie-sleep',
      'family-scene-marie-cuddle',
      'family-weather-storm',
      'family-weather-snow'
    ].forEach(
      cls=>
        garden.classList.remove(
          cls
        )
    );
  }


  function setMarieMood(
    mood,
    duration=5200
  ){

    try{

      window.ParadoxRefugeFamily
        ?.grayMood
        ?.(
          mood,
          duration
        );

    }

    catch(_){}
  }


  function setTuluzMood(
    mood,
    duration=5200
  ){

    try{

      window.ParadoxRefugeFamily
        ?.orangeMood
        ?.(
          mood,
          duration
        );

    }

    catch(_){}
  }


  function mewoMood(
    mood
  ){

    if(!mewoSpot){
      return;
    }


    mewoSpot.dataset.mood=
      mood;


    const label=
      document.getElementById(
        'catGardenMewoMood'
      );


    if(!label){
      return;
    }


    const text={
      sleep:'zZ...',
      love:'♡',
      happy:'✦',
      play:'!!'
    }[mood];


    if(text){
      label.textContent=text;
    }
  }


  /* =====================================================
     MOTOR DE ESCENAS
  ===================================================== */

  function beginScene(
    name,
    duration=9000
  ){

    if(!canRunScene()){
      return false;
    }


    sceneRunning=true;
    currentScene=name;


    clearSceneClasses();


    garden.classList.add(
      `family-scene-${name}`
    );


    const st=load();


    save({
      randomScenes:
        Number(
          st.randomScenes||0
        )+1,

      familyMoments:
        Number(
          st.familyMoments||0
        )+1,

      lastSceneAt:
        Date.now()
    });


    clearTimeout(
      sceneTimer
    );


    sceneTimer=
      setTimeout(
        endScene,
        duration
      );


    return true;
  }


  function endScene(){

    clearTimeout(
      sceneTimer
    );


    clearSceneClasses();


    sceneRunning=false;
    currentScene=null;


    try{

      window.ParadoxRefugeFamily
        ?.render
        ?.();

      window.ParadoxCatGarden
        ?.refresh
        ?.();

    }

    catch(_){}
  }


  /* =====================================================
     6 MOMENTOS ESPECIALES + 6 CARTAS
  ===================================================== */

  function sceneNowMore(){

    if(
      !allThreeHere() ||
      !beginScene(
        'three',
        11000
      )
    ){
      return false;
    }


    setMarieMood(
      'happy',
      10000
    );

    setTuluzMood(
      'happy',
      10000
    );

    mewoMood(
      'happy'
    );


    burst(
      grayBtn,
      ['♡','✦','♡']
    );

    burst(
      orangeBtn,
      ['✦','♡','✦']
    );


    showSceneNote(
      '♡ por primera vez los tres están juntos en el refugio',
      4300
    );


    const st=load();

    save({
      moreSeen:true
    });

    queueLetter(
      'family-more'
    );


    return true;
  }


  function sceneNoRoom(){

    const gs=
      gardenState();

    if(
      !allThreeHere() ||
      !gs.activePillow ||
      !beginScene(
        'pillow',
        12000
      )
    ){
      return false;
    }


    setMarieMood(
      'sleep',
      11000
    );

    mewoMood(
      'sleep'
    );

    setTuluzMood(
      'confused',
      7000
    );


    showSceneNote(
      'zZ ...parece que esa almohada ya no alcanza para todos >w<',
      4700
    );


    const st=load();

    save({
      pillowSeen:true
    });

    queueLetter(
      'family-pillow'
    );


    return true;
  }


  function sceneLetHerSleep(){

    if(
      !beginScene(
        'let-sleep',
        12000
      )
    ){
      return false;
    }


    setMarieMood(
      'sleep',
      11000
    );

    setTuluzMood(
      'happy',
      5200
    );


    burst(
      orangeBtn,
      ['!','✦','!']
    );


    showSceneNote(
      'Tuluz... déjala mimir 😭',
      4200
    );


    setTimeout(
      ()=>{

        if(
          sceneRunning &&
          currentScene==='let-sleep'
        ){

          setTuluzMood(
            'confused',
            5200
          );

          burst(
            orangeBtn,
            ['?','?']
          );
        }

      },
      5200
    );


    const st=load();

    save({
      letSleepSeen:true
    });

    queueLetter(
      'family-let-sleep'
    );


    return true;
  }


  function sceneSiblings(){

    if(
      !beginScene(
        'siblings',
        11000
      )
    ){
      return false;
    }


    setMarieMood(
      'love',
      10000
    );

    setTuluzMood(
      'love',
      10000
    );


    burst(
      grayBtn,
      ['♡','♡']
    );

    burst(
      orangeBtn,
      ['♡','✦']
    );


    showSceneNote(
      '♡ Marie y Tuluz se quedaron juntitos',
      4200
    );


    const st=load();

    save({
      siblingsSeen:true
    });

    queueLetter(
      'family-siblings'
    );


    return true;
  }


  function sceneEveryoneClose(){

    if(
      !allThreeHere() ||
      !beginScene(
        'close',
        13000
      )
    ){
      return false;
    }


    setMarieMood(
      'sleep',
      12000
    );

    setTuluzMood(
      'sleep',
      12000
    );

    mewoMood(
      'sleep'
    );


    showSceneNote(
      '☾ por un ratito nadie quiso hacer nada... solo quedarse cerquita',
      5000
    );


    const st=load();

    save({
      closeSeen:true
    });

    queueLetter(
      'family-close'
    );


    return true;
  }


  function sceneRefugeFull(){

    if(
      !allThreeHere() ||
      !beginScene(
        'three',
        13500
      )
    ){
      return false;
    }


    setMarieMood(
      'love',
      12000
    );

    setTuluzMood(
      'happy',
      12000
    );

    mewoMood(
      'love'
    );


    burst(
      grayBtn,
      ['♡','✦','♡']
    );

    burst(
      orangeBtn,
      ['♡','✦','♡']
    );

    burst(
      mewoSpot,
      ['♡','♡','✦']
    );


    showSceneNote(
      '⌂ el refugio ya no se siente vacío nunca más ♡',
      5200
    );


    save({
      fullSeen:true
    });

    queueLetter(
      'family-full'
    );


    return true;
  }


  function tryMilestoneScene(){

    if(
      !canRunScene()
    ){
      return false;
    }


    const st=load();


    /*
      1) Los tres juntos.
    */
    if(
      !st.moreSeen &&
      allThreeHere()
    ){
      return sceneNowMore();
    }


    /*
      2) Dos gatos intentando usar la almohada.
    */
    if(
      st.moreSeen &&
      !st.pillowSeen &&
      Number(
        st.gardenOpens||0
      )>=2 &&
      gardenState().activePillow &&
      allThreeHere()
    ){
      return sceneNoRoom();
    }


    /*
      3) Tuluz molesta a Marie dormida.
    */
    if(
      st.pillowSeen &&
      !st.letSleepSeen &&
      Number(
        st.gardenOpens||0
      )>=3
    ){
      return sceneLetHerSleep();
    }


    /*
      4) Marie y Tuluz juntos.
    */
    if(
      st.letSleepSeen &&
      !st.siblingsSeen &&
      Number(
        st.gardenOpens||0
      )>=4
    ){
      return sceneSiblings();
    }


    /*
      5) Los tres descansando.
    */
    if(
      st.siblingsSeen &&
      !st.closeSeen &&
      Number(
        st.gardenOpens||0
      )>=5 &&
      allThreeHere()
    ){
      return sceneEveryoneClose();
    }


    /*
      6) Hito avanzado del refugio.
    */
    if(
      st.moreSeen &&
      st.pillowSeen &&
      st.letSleepSeen &&
      st.siblingsSeen &&
      st.closeSeen &&
      !st.fullSeen &&
      Number(
        st.familyMoments||0
      )>=5 &&
      Number(
        st.gardenOpens||0
      )>=6 &&
      allThreeHere()
    ){
      return sceneRefugeFull();
    }


    return false;
  }


  /* =====================================================
     VIDA COTIDIANA DESPUÉS DE LOS HITOS
  ===================================================== */

  function sceneMarieSleep(){

    if(
      !beginScene(
        'marie-sleep',
        9000
      )
    ){
      return false;
    }


    setMarieMood(
      'sleep',
      8500
    );


    const st=load();

    save({
      marieSleepScenes:
        Number(
          st.marieSleepScenes||0
        )+1
    });


    return true;
  }


  function sceneMarieCuddle(){

    if(
      !allThreeHere() ||
      !beginScene(
        'marie-cuddle',
        9000
      )
    ){
      return false;
    }


    setMarieMood(
      'cuddle',
      8500
    );

    mewoMood(
      'love'
    );


    burst(
      grayBtn,
      ['♡','♡']
    );


    const st=load();

    save({
      marieCuddleScenes:
        Number(
          st.marieCuddleScenes||0
        )+1
    });


    return true;
  }


  function sceneTuluzToy(){

    if(
      !beginScene(
        'tuluz-toy',
        8500
      )
    ){
      return false;
    }


    setTuluzMood(
      'happy',
      8000
    );


    const prop=
      document.getElementById(
        'catGardenMewoProp'
      );

    const propImg=
      document.getElementById(
        'catGardenMewoPropImg'
      );


    if(
      prop &&
      propImg
    ){

      const toys=[
        'toy_ball.png',
        'toy_fish.png',
        'toy_yarn.png'
      ];

      propImg.src=
        toys[
          Math.floor(
            Math.random()*
            toys.length
          )
        ];

      prop.classList.add(
        'show',
        'family-prop'
      );


      setTimeout(
        ()=>{
          prop.classList.remove(
            'show',
            'family-prop'
          );
        },
        7200
      );
    }


    const st=load();

    save({
      tuluzToyScenes:
        Number(
          st.tuluzToyScenes||0
        )+1
    });


    return true;
  }


  function sceneTuluzScratcher(){

    const gs=
      gardenState();


    if(
      Number(
        gs.scratcherStage||0
      )<4
      ||
      !beginScene(
        'tuluz-scratcher',
        9000
      )
    ){
      return false;
    }


    setTuluzMood(
      'happy',
      8500
    );


    const toy=
      document.getElementById(
        'catGardenScratcherToy'
      );


    toy?.classList.add(
      'show'
    );


    setTimeout(
      ()=>{
        toy?.classList.remove(
          'show'
        );
      },
      7600
    );


    const st=load();

    save({
      tuluzScratcherScenes:
        Number(
          st.tuluzScratcherScenes||0
        )+1
    });


    return true;
  }


  function runRandomLife(){

    if(
      !canRunScene()
    ){
      return;
    }


    if(
      tryMilestoneScene()
    ){
      return;
    }


    const options=[
      sceneMarieSleep,
      sceneTuluzToy,
      sceneMarieSleep,
      sceneTuluzToy,
      sceneSiblings
    ];


    if(allThreeHere()){

      options.push(
        sceneMarieCuddle
      );
    }


    if(
      Number(
        gardenState()
          .scratcherStage||0
      )>=4
    ){

      options.push(
        sceneTuluzScratcher
      );
    }


    const selected=
      options[
        Math.floor(
          Math.random()*
          options.length
        )
      ];


    selected?.();
  }


  /* =====================================================
     CLIMA Y CONVIVENCIA
  ===================================================== */

  function syncWeather(){

    if(
      !isGardenOpen() ||
      !bothNewCatsHere() ||
      arrivalEventRunning()
    ){
      return;
    }


    const weather=
      window.MAGIC_AMBIENT_ACTIVE ||
      'normal';


    if(
      weather===previousWeather
    ){
      return;
    }


    previousWeather=
      weather;


    garden.classList.remove(
      'family-weather-storm',
      'family-weather-snow'
    );


    if(weather==='storm'){

      garden.classList.add(
        'family-weather-storm'
      );

      setMarieMood(
        'confused',
        7000
      );

      setTuluzMood(
        'confused',
        7000
      );


      if(allThreeHere()){
        mewoMood(
          'confused'
        );
      }


      showSceneNote(
        '⚡ con los truenos, todos prefieren quedarse un poquito más cerca',
        4000
      );
    }


    else if(weather==='snow'){

      garden.classList.add(
        'family-weather-snow'
      );

      setMarieMood(
        'sleep',
        7600
      );

      setTuluzMood(
        'sleep',
        7600
      );


      if(allThreeHere()){
        mewoMood(
          'sleep'
        );
      }


      showSceneNote(
        '❄ hace frío afuera... aquí dentro se juntaron para guardar calor',
        4200
      );
    }
  }


  /* =====================================================
     CICLO DE VIDA DEL JARDÍN
  ===================================================== */

  function onOpen(){

    if(!ensureDOM()){
      return;
    }


    const st=load();


    save({
      gardenOpens:
        Number(
          st.gardenOpens||0
        )+1
    });


    refreshLetterDrop();


    /*
      Damos tiempo a que el jardín termine sus propias
      animaciones antes de iniciar convivencia.
    */
    clearTimeout(
      openTimer
    );


    openTimer=
      setTimeout(
        ()=>{

          if(
            canRunScene()
          ){
            tryMilestoneScene();
          }

        },
        8500
      );


    clearInterval(
      lifeTimer
    );


    lifeTimer=
      setInterval(
        runRandomLife,
        29000
      );


    clearInterval(
      weatherTimer
    );


    weatherTimer=
      setInterval(
        syncWeather,
        4000
      );


    previousWeather=null;
    syncWeather();
  }


  function onClose(){

    clearTimeout(
      openTimer
    );

    clearInterval(
      lifeTimer
    );

    clearInterval(
      weatherTimer
    );

    clearTimeout(
      sceneTimer
    );


    endScene();

    previousWeather=null;
  }


  window.addEventListener(
    'paradox-cat-garden-open',
    onOpen
  );


  window.addEventListener(
    'paradox-cat-garden-close',
    onClose
  );


  window.addEventListener(
    'paradox-refuge-family-change',
    ()=>{
      ensureDOM();
      refreshLetterDrop();
    }
  );


  /*
    Inicialización tolerante al orden de carga.
  */
  const init=
    setInterval(
      ()=>{

        if(ensureDOM()){

          clearInterval(
            init
          );

          refreshLetterDrop();


          if(isGardenOpen()){
            onOpen();
          }
        }

      },
      500
    );


  /* API para pruebas futuras. */
  window.ParadoxRefugeFamilyLife={
    getState:load,

    reset(){
      localStorage.removeItem(
        KEY
      );

      localStorage.removeItem(
        PENDING_KEY
      );

      refreshLetterDrop();
    },

    play(scene){

      const map={
        three:sceneNowMore,
        pillow:sceneNoRoom,
        letSleep:sceneLetHerSleep,
        siblings:sceneSiblings,
        close:sceneEveryoneClose,
        full:sceneRefugeFull,
        marieSleep:sceneMarieSleep,
        marieCuddle:sceneMarieCuddle,
        tuluzToy:sceneTuluzToy,
        tuluzScratcher:sceneTuluzScratcher
      };

      return map[scene]?.();
    }
  };

})();
