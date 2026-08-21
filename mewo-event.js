/* =========================================================
   MEWO — EVENTO LARGO Y REPETIBLE

   1. Mewo aparece de forma aleatoria.
   2. Hay que atraparla 4 veces.
   3. Después puedes:
      - jugar
      - alimentarla
      - darle mimitos
   4. Las actividades pueden repetirse.
   5. Cuando las tres se hicieron al menos una vez,
      aparece "Dejarla descansar".
   6. Mewo se despide, deja la carta y más adelante
      puede volver a aparecer.
========================================================= */

(() => {

  const STORAGE_KEY =
    'paradox143_letters_v1';

  const MEWO_ID =
    'mewo';

  const MEWO_MESSAGE =
    'eres y seras la mejoll mama gata de todas!!';

  const MEWO_MUSIC_SRC =
    'cats_in_cold.mp3';


  let eventActive=false;
  let phase='waiting';

  let catchCount=0;
  let petCount=0;
  let playCount=0;
  let feedCount=0;

  let petting=false;
  let lastPetX=0;
  let lastPetY=0;
  let petDistance=0;

  let catX=50;
  let catY=69;

  let scheduleTimer=0;

  const careDone=
    new Set();


  /* =====================================================
     DOM
  ===================================================== */

  const layer=
    document.createElement('div');

  layer.id=
    'mewoLayer';


  const catBtn=
    document.createElement('button');

  catBtn.id=
    'mewoCat';

  catBtn.type=
    'button';

  catBtn.setAttribute(
    'aria-label',
    'Mewo'
  );

  catBtn.innerHTML=
    '<img id="mewoImg" src="mewo.png" alt="Mewo">';


  const status=
    document.createElement('div');

  status.id=
    'mewoStatus';


  const hearts=
    document.createElement('div');

  hearts.id=
    'mewoHearts';


  const carePanel=
    document.createElement('div');

  carePanel.id=
    'mewoCarePanel';

  carePanel.innerHTML=
    `
      <div class="mewoCareTitle">¿QUÉ HACEMOS CON MEWO? ♡</div>

      <div class="mewoCareButtons">

        <button
          id="mewoPlayBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>●</span>
          JUGAR
        </button>

        <button
          id="mewoFeedBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>⌁</span>
          ALIMENTAR
        </button>

        <button
          id="mewoPetBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>♡</span>
          MIMITOS
        </button>

        <button
          id="mewoRestBtn"
          class="mewoCareBtn mewoRestBtn"
          type="button"
        >
          DEJARLA DESCANSAR ♡
        </button>

      </div>
    `;


  const toy=
    document.createElement('button');

  toy.id=
    'mewoToy';

  toy.type=
    'button';

  toy.setAttribute(
    'aria-label',
    'Juguete de Mewo'
  );

  toy.innerHTML=
    '<span></span>';


  const food=
    document.createElement('button');

  food.id=
    'mewoFood';

  food.type=
    'button';

  food.setAttribute(
    'aria-label',
    'Comida de Mewo'
  );

  food.innerHTML=
    `
      <span class="mewoFoodBowl"></span>
      <span class="mewoFoodBits">•••</span>
    `;


  const letter=
    document.createElement('button');

  letter.id=
    'mewoLetter';

  letter.type=
    'button';

  letter.setAttribute(
    'aria-label',
    'Carta de Mewo'
  );

  letter.innerHTML=
    `
      <span class="mewoEnvelope"></span>
      <span class="mewoSeal">♡</span>
      <span class="mewoPaw">✦</span>
    `;


  layer.appendChild(catBtn);
  layer.appendChild(status);
  layer.appendChild(hearts);
  layer.appendChild(carePanel);
  layer.appendChild(toy);
  layer.appendChild(food);
  layer.appendChild(letter);

  document.body.appendChild(layer);


  const mewoImg=
    document.getElementById(
      'mewoImg'
    );

  const playBtn=
    document.getElementById(
      'mewoPlayBtn'
    );

  const feedBtn=
    document.getElementById(
      'mewoFeedBtn'
    );

  const petBtn=
    document.getElementById(
      'mewoPetBtn'
    );

  const restBtn=
    document.getElementById(
      'mewoRestBtn'
    );


  /* =====================================================
     SPRITE
  ===================================================== */

  function prepareMewoSprite(){

    const img=
      new Image();


    img.onload=()=>{

      try{

        const c=
          document.createElement(
            'canvas'
          );

        c.width=
          img.naturalWidth||
          img.width;

        c.height=
          img.naturalHeight||
          img.height;


        const g=
          c.getContext(
            '2d',
            {
              willReadFrequently:true
            }
          );

        g.drawImage(
          img,
          0,
          0
        );


        const data=
          g.getImageData(
            0,
            0,
            c.width,
            c.height
          );

        const p=
          data.data;


        for(
          let i=0;
          i<p.length;
          i+=4
        ){

          const light=
            (
              p[i]+
              p[i+1]+
              p[i+2]
            )/3;


          if(light>238){

            p[i+3]=0;
          }

          else if(light>175){

            p[i]=0;
            p[i+1]=0;
            p[i+2]=0;

            p[i+3]=
              Math.max(
                0,
                Math.min(
                  255,
                  (
                    238-light
                  )*4
                )
              );
          }

          else{

            p[i]=0;
            p[i+1]=0;
            p[i+2]=0;
          }
        }


        g.putImageData(
          data,
          0,
          0
        );


        mewoImg.src=
          c.toDataURL(
            'image/png'
          );

      }
      catch(_){}
    };


    img.src=
      'mewo.png';
  }


  prepareMewoSprite();


  /* =====================================================
     CARTAS / CANASTA
  ===================================================== */

  function readSavedLetters(){

    try{

      const raw=
        localStorage.getItem(
          STORAGE_KEY
        );

      const arr=
        raw
        ? JSON.parse(raw)
        : [];

      return Array.isArray(arr)
        ? arr
        : [];
    }
    catch(_){

      return [];
    }
  }


  function saveMewoLetter(){

    const arr=
      readSavedLetters();


    if(
      !arr.includes(
        MEWO_ID
      )
    ){

      arr.push(
        MEWO_ID
      );


      try{

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(arr)
        );

      }
      catch(_){}
    }


    syncBasketCount();
    injectMewoIntoBasket();
    pulseBasket();
  }


  function hasMewoLetter(){

    return readSavedLetters()
      .includes(
        MEWO_ID
      );
  }


  function syncBasketCount(){

    const count=
      document.getElementById(
        'basketCount'
      );


    if(count){

      count.textContent=
        String(
          new Set(
            readSavedLetters()
          ).size
        );
    }
  }


  function pulseBasket(){

    const basket=
      document.getElementById(
        'letterBasketBtn'
      );


    if(!basket){
      return;
    }


    basket.classList.remove(
      'pulse'
    );

    void basket.offsetWidth;

    basket.classList.add(
      'pulse'
    );
  }


  /* =====================================================
     MÚSICA
  ===================================================== */

  function startMewoMusic(){

    if(window.ParadoxAudio){

      window.ParadoxAudio
        .playSpecial(
          MEWO_MUSIC_SRC,
          .40
        );
    }
  }


  function restoreFieldMusic(){

    if(window.ParadoxAudio){

      window.ParadoxAudio
        .restoreNormal();
    }
  }


  /* =====================================================
     MENSAJES
  ===================================================== */

  function showStatus(
    html,
    duration=3000
  ){

    status.innerHTML=
      html;

    status.classList.remove(
      'show'
    );

    void status.offsetWidth;

    status.classList.add(
      'show'
    );


    clearTimeout(
      showStatus.timer
    );


    showStatus.timer=
      setTimeout(
        ()=>{
          status.classList.remove(
            'show'
          );
        },
        duration
      );
  }


  /* =====================================================
     POSICIÓN
  ===================================================== */

  function setCatPosition(
    x,
    y
  ){

    catX=
      Math.max(
        10,
        Math.min(
          90,
          x
        )
      );

    catY=
      Math.max(
        56,
        Math.min(
          82,
          y
        )
      );


    catBtn.style.left=
      `${catX}%`;

    catBtn.style.top=
      `${catY}%`;


    hearts.style.left=
      `${catX}%`;

    hearts.style.top=
      `${catY-5}%`;
  }


  function randomPosition(){

    const portrait=
      window.innerHeight>
      window.innerWidth;


    return{

      x:
        13+
        Math.random()*74,

      y:
        portrait
        ? 59+Math.random()*18
        : 61+Math.random()*16
    };
  }


  function moveMewo(){

    let next=
      randomPosition();


    if(
      Math.abs(
        next.x-catX
      )<18
    ){

      next.x=
        next.x<50

        ? Math.min(
            88,
            next.x+27
          )

        : Math.max(
            12,
            next.x-27
          );
    }


    catBtn.classList.remove(
      'hop'
    );

    void catBtn.offsetWidth;

    catBtn.classList.add(
      'hop'
    );


    setCatPosition(
      next.x,
      next.y
    );
  }


  function setObjectPosition(
    element
  ){

    const p=
      randomPosition();


    element.style.left=
      `${p.x}%`;

    element.style.top=
      `${Math.min(80,p.y+2)}%`;
  }


  /* =====================================================
     CORAZONES
  ===================================================== */

  function makeHeartBurst(){

    hearts.innerHTML='';


    for(
      let i=0;
      i<8;
      i++
    ){

      const h=
        document.createElement(
          'span'
        );

      h.className=
        'mewoHeart';

      h.textContent=
        '♡';

      h.style.left=
        `${8+Math.random()*82}%`;

      h.style.animationDelay=
        `${Math.random()*.35}s`;


      hearts.appendChild(
        h
      );
    }


    hearts.classList.remove(
      'show'
    );

    void hearts.offsetWidth;

    hearts.classList.add(
      'show'
    );


    setTimeout(
      ()=>{
        hearts.classList.remove(
          'show'
        );
      },
      1900
    );
  }


  /* =====================================================
     CUÁNDO APARECE
  ===================================================== */

  function sceneBusy(){

    if(
      document.body.classList.contains(
        'intro-active'
      )
    ){
      return true;
    }


    const game=
      document.getElementById(
        'gameOverlay'
      );


    if(
      game &&
      game.classList.contains(
        'show'
      )
    ){
      return true;
    }


    if(
      window.MAGIC_AMBIENT_ACTIVE ||
      window.MAGIC_SPECIAL_PENDING
    ){
      return true;
    }


    const reader=
      document.getElementById(
        'letterReader'
      );


    if(
      reader &&
      reader.classList.contains(
        'show'
      )
    ){
      return true;
    }


    return false;
  }


  function scheduleMewo(
    repeat=false
  ){

    clearTimeout(
      scheduleTimer
    );


    /*
      Primera aparición:
      55 a 100 segundos.

      Después de despedirse:
      3.5 a 6.5 minutos.
    */

    const delay=
      repeat

      ? 210000+
        Math.random()*180000

      : 55000+
        Math.random()*45000;


    scheduleTimer=
      setTimeout(
        startMewoEvent,
        delay
      );
  }


  function waitForField(){

    if(
      !document.body.classList.contains(
        'intro-active'
      )
    ){

      scheduleMewo(false);

      return;
    }


    const observer=
      new MutationObserver(
        ()=>{

          if(
            !document.body.classList.contains(
              'intro-active'
            )
          ){

            observer.disconnect();

            setTimeout(
              ()=>scheduleMewo(false),
              900
            );
          }
        }
      );


    observer.observe(
      document.body,
      {
        attributes:true,
        attributeFilter:['class']
      }
    );
  }


  /* =====================================================
     INICIO
  ===================================================== */

  function resetMewoState(){

    eventActive=false;
    phase='waiting';

    catchCount=0;
    petCount=0;
    playCount=0;
    feedCount=0;

    careDone.clear();

    petting=false;

    catBtn.className='';
    catBtn.id='mewoCat';

    catBtn.style.display='';
    catBtn.classList.remove(
      'show',
      'caught',
      'loved',
      'leaving',
      'petPulse',
      'hop'
    );

    carePanel.classList.remove(
      'show'
    );

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );

    letter.classList.remove(
      'show'
    );

    letter.style.display='';

    updateCarePanel();
  }


  function startMewoEvent(){

    if(eventActive){
      return;
    }


    if(sceneBusy()){

      scheduleTimer=
        setTimeout(
          startMewoEvent,
          12000
        );

      return;
    }


    eventActive=true;
    phase='catch';

    catchCount=0;
    careDone.clear();


    const p=
      randomPosition();


    setCatPosition(
      p.x,
      p.y
    );


    catBtn.style.display='';
    catBtn.classList.add(
      'show'
    );


    startMewoMusic();


    showStatus(
      '✦ Algo se mueve entre los tulipanes... <strong>¡Mewo volvió!</strong>',
      4200
    );
  }


  /* =====================================================
     ATRAPAR
  ===================================================== */

  catBtn.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(!eventActive){
        return;
      }


      if(phase==='catch'){

        catchCount++;


        if(catchCount<4){

          showStatus(
            `¡Mewo se escapó! Atrápala otra vez ♡ &nbsp; ${catchCount}/4`,
            1900
          );

          moveMewo();

          return;
        }


        phase='care';

        catBtn.classList.add(
          'caught'
        );


        showStatus(
          '♡ ¡La atrapaste! Ahora puedes quedarte un rato con Mewo.',
          4200
        );


        setTimeout(
          showCareMenu,
          650
        );

        return;
      }


      if(phase==='pet'){

        addPet();
      }

    }
  );


  /* =====================================================
     MENÚ DE CUIDADOS
  ===================================================== */

  function updateCarePanel(){

    const mapping=[
      [
        'play',
        playBtn
      ],
      [
        'feed',
        feedBtn
      ],
      [
        'pet',
        petBtn
      ]
    ];


    for(
      const [
        key,
        btn
      ]
      of mapping
    ){

      btn.classList.toggle(
        'done',
        careDone.has(key)
      );
    }


    const allDone=
      careDone.has('play') &&
      careDone.has('feed') &&
      careDone.has('pet');


    restBtn.classList.toggle(
      'unlocked',
      allDone
    );
  }


  function showCareMenu(){

    if(!eventActive){
      return;
    }


    phase='care';

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );

    updateCarePanel();

    carePanel.classList.add(
      'show'
    );


    if(
      careDone.size===0
    ){

      showStatus(
        'Puedes <strong>jugar</strong>, <strong>alimentarla</strong> o darle <strong>mimitos</strong> ♡',
        5000
      );
    }
  }


  function completeCare(
    key,
    text
  ){

    careDone.add(
      key
    );

    makeHeartBurst();

    showStatus(
      text,
      3300
    );


    setTimeout(
      ()=>{
        showCareMenu();
      },
      800
    );
  }


  /* =====================================================
     JUGAR — ATRAPAR LA BOLITA 3 VECES
  ===================================================== */

  function startPlay(){

    phase='play';
    playCount=0;

    carePanel.classList.remove(
      'show'
    );

    setObjectPosition(
      toy
    );

    toy.classList.add(
      'show'
    );


    showStatus(
      '● Juega con Mewo: toca la bolita <strong>3 veces</strong>.',
      4200
    );
  }


  toy.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(phase!=='play'){
        return;
      }


      playCount++;


      const rect=
        toy.getBoundingClientRect();


      const px=
        (
          rect.left+
          rect.width*.5
        )/
        window.innerWidth*
        100;

      const py=
        (
          rect.top+
          rect.height*.5
        )/
        window.innerHeight*
        100;


      setCatPosition(
        Math.max(
          10,
          Math.min(
            90,
            px-5
          )
        ),
        Math.max(
          56,
          Math.min(
            82,
            py
          )
        )
      );


      catBtn.classList.remove(
        'hop'
      );

      void catBtn.offsetWidth;

      catBtn.classList.add(
        'hop'
      );


      if(playCount>=3){

        toy.classList.remove(
          'show'
        );

        completeCare(
          'play',
          'Mewo persiguió la bolita por todo el pasto ♡'
        );

        return;
      }


      setObjectPosition(
        toy
      );


      showStatus(
        `¡Otra vez! ● &nbsp; ${playCount}/3`,
        1500
      );
    }
  );


  /* =====================================================
     ALIMENTAR — 3 BOCADITOS
  ===================================================== */

  function startFeed(){

    phase='feed';
    feedCount=0;

    carePanel.classList.remove(
      'show'
    );

    setObjectPosition(
      food
    );

    food.classList.add(
      'show'
    );


    showStatus(
      '⌁ Dale de comer a Mewo: toca su platito <strong>3 veces</strong>.',
      4200
    );
  }


  food.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(phase!=='feed'){
        return;
      }


      feedCount++;


      catBtn.classList.remove(
        'petPulse'
      );

      void catBtn.offsetWidth;

      catBtn.classList.add(
        'petPulse'
      );


      if(feedCount>=3){

        food.classList.remove(
          'show'
        );

        completeCare(
          'feed',
          'ñam ñam... Mewo quedó satisfecha ♡'
        );

        return;
      }


      showStatus(
        `ñam... ♡ &nbsp; ${feedCount}/3`,
        1500
      );
    }
  );


  /* =====================================================
     MIMITOS — DESLIZAR O TOCAR 5 VECES
  ===================================================== */

  function startPet(){

    phase='pet';
    petCount=0;

    carePanel.classList.remove(
      'show'
    );


    showStatus(
      '♡ Dale mimitos deslizando el dedo sobre Mewo. <span id="mewoPetMeter">♡♡♡♡♡</span>',
      6500
    );
  }


  function addPet(){

    if(
      phase!=='pet' ||
      !eventActive
    ){
      return;
    }


    petCount=
      Math.min(
        5,
        petCount+1
      );


    catBtn.classList.remove(
      'petPulse'
    );

    void catBtn.offsetWidth;

    catBtn.classList.add(
      'petPulse'
    );


    const meter=
      document.getElementById(
        'mewoPetMeter'
      );


    if(meter){

      meter.textContent=
        '♥'.repeat(petCount)+
        '♡'.repeat(
          5-petCount
        );
    }


    if(petCount>=5){

      completeCare(
        'pet',
        'prrrrr... ♡ Mewo recibió todos sus mimitos.'
      );
    }
  }


  catBtn.addEventListener(
    'pointerdown',
    e=>{

      if(phase!=='pet'){
        return;
      }


      petting=true;

      lastPetX=e.clientX;
      lastPetY=e.clientY;

      petDistance=0;


      try{

        catBtn.setPointerCapture(
          e.pointerId
        );

      }
      catch(_){}
    }
  );


  catBtn.addEventListener(
    'pointermove',
    e=>{

      if(
        !petting ||
        phase!=='pet'
      ){
        return;
      }


      const dx=
        e.clientX-
        lastPetX;

      const dy=
        e.clientY-
        lastPetY;


      petDistance+=
        Math.hypot(
          dx,
          dy
        );


      lastPetX=
        e.clientX;

      lastPetY=
        e.clientY;


      if(petDistance>=28){

        petDistance=0;

        addPet();
      }
    }
  );


  function stopPetting(e){

    if(!petting){
      return;
    }


    petting=false;


    try{

      if(
        catBtn.hasPointerCapture(
          e.pointerId
        )
      ){

        catBtn.releasePointerCapture(
          e.pointerId
        );
      }

    }
    catch(_){}
  }


  catBtn.addEventListener(
    'pointerup',
    stopPetting
  );

  catBtn.addEventListener(
    'pointercancel',
    stopPetting
  );


  playBtn.addEventListener(
    'click',
    startPlay
  );

  feedBtn.addEventListener(
    'click',
    startFeed
  );

  petBtn.addEventListener(
    'click',
    startPet
  );


  /* =====================================================
     DESPEDIDA
  ===================================================== */

  restBtn.addEventListener(
    'click',
    ()=>{

      if(
        !careDone.has('play') ||
        !careDone.has('feed') ||
        !careDone.has('pet')
      ){
        return;
      }


      phase='leaving';

      carePanel.classList.remove(
        'show'
      );

      toy.classList.remove(
        'show'
      );

      food.classList.remove(
        'show'
      );


      catBtn.classList.remove(
        'caught',
        'petPulse'
      );

      catBtn.classList.add(
        'loved'
      );


      makeHeartBurst();


      showStatus(
        'prrrrr... ♡ Mewo está feliz. Se quedará un poquito más contigo...',
        4200
      );


      setTimeout(
        ()=>{

          const letterX=
            catX;

          const letterY=
            Math.min(
              82,
              catY+7
            );


          letter.style.left=
            `${letterX}%`;

          letter.style.top=
            `${letterY}%`;


          catBtn.classList.remove(
            'loved'
          );

          catBtn.classList.add(
            'leaving'
          );


          showStatus(
            'Mewo se va entre los tulipanes... pero antes dejó una cartita ♡',
            4200
          );


          setTimeout(
            ()=>{
              letter.classList.add(
                'show'
              );
            },
            1300
          );


          setTimeout(
            ()=>{
              catBtn.style.display=
                'none';
            },
            2500
          );

        },
        5000
      );
    }
  );


  /* =====================================================
     CARTA
  ===================================================== */

  function openMewoLetter(){

    const reader=
      document.getElementById(
        'letterReader'
      );

    const mark=
      document.getElementById(
        'readerMark'
      );

    const title=
      document.getElementById(
        'readerTitle'
      );

    const text=
      document.getElementById(
        'readerText'
      );

    const keep=
      document.getElementById(
        'readerKeep'
      );


    if(
      !reader ||
      !mark ||
      !title ||
      !text
    ){

      alert(
        MEWO_MESSAGE
      );

      saveMewoLetter();
    }

    else{

      mark.textContent='♡';

      title.textContent=
        'Una cartita de Mewo';

      text.textContent=
        MEWO_MESSAGE;


      if(keep){
        keep.style.display=
          'none';
      }


      reader.classList.add(
        'show'
      );


      saveMewoLetter();
    }


    restoreFieldMusic();


    /*
      Mewo puede regresar en esta misma visita.
      La carta no se duplica en la canasta.
    */

    eventActive=false;
    phase='waiting';

    scheduleMewo(true);
  }


  letter.addEventListener(
    'click',
    ()=>{

      letter.classList.remove(
        'show'
      );

      letter.style.display=
        'none';


      openMewoLetter();


      setTimeout(
        resetMewoState,
        700
      );
    }
  );


  /* =====================================================
     CANASTA
  ===================================================== */

  function injectMewoIntoBasket(){

    if(!hasMewoLetter()){
      return;
    }


    const list=
      document.getElementById(
        'basketLetters'
      );


    if(!list){
      return;
    }


    if(
      list.querySelector(
        '.basketLetterItem[data-letter="mewo"]'
      )
    ){

      syncBasketCount();

      return;
    }


    const empty=
      list.querySelector(
        '.basketEmpty'
      );


    if(
      empty &&
      readSavedLetters().length>0
    ){

      empty.remove();
    }


    const item=
      document.createElement(
        'button'
      );


    item.className=
      'basketLetterItem';

    item.dataset.letter=
      'mewo';

    item.type=
      'button';


    item.innerHTML=
      `
        <span class="basketLetterMark">♡</span>

        <span>
          <strong>Carta de Mewo</strong>
          <small>Toca para volver a leerla</small>
        </span>
      `;


    item.addEventListener(
      'click',
      ()=>{

        const overlay=
          document.getElementById(
            'basketOverlay'
          );


        if(overlay){

          overlay.classList.remove(
            'show'
          );
        }


        const reader=
          document.getElementById(
            'letterReader'
          );

        const mark=
          document.getElementById(
            'readerMark'
          );

        const title=
          document.getElementById(
            'readerTitle'
          );

        const text=
          document.getElementById(
            'readerText'
          );

        const keep=
          document.getElementById(
            'readerKeep'
          );


        if(
          reader &&
          mark &&
          title &&
          text
        ){

          mark.textContent='♡';

          title.textContent=
            'Una cartita de Mewo';

          text.textContent=
            MEWO_MESSAGE;


          if(keep){
            keep.style.display=
              'none';
          }


          reader.classList.add(
            'show'
          );
        }
      }
    );


    list.appendChild(
      item
    );


    syncBasketCount();
  }


  const basketBtn=
    document.getElementById(
      'letterBasketBtn'
    );


  if(basketBtn){

    basketBtn.addEventListener(
      'click',
      ()=>{

        setTimeout(
          ()=>{
            injectMewoIntoBasket();
            syncBasketCount();
          },
          0
        );
      }
    );
  }


  setTimeout(
    syncBasketCount,
    800
  );


  resetMewoState();
  waitForField();

})();
