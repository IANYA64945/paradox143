/* =========================================================
   PARCHE MÁGICO DEL CAMPO

   El arrastre ya no sirve solamente para mover el campo:
   ahora también cuenta como "exploración".

   Al explorar suficiente distancia, aparecen eventos:
   - lluvia de estrellas
   - neblina
   - lluvia
   - tormenta (último evento especial)

   No interfiere con el movimiento original del campo.
========================================================= */

(() => {

  const fieldApp = document.getElementById('app');

  if (!fieldApp) return;


  /* =====================================================
     CAPA VISUAL
  ===================================================== */

  const layer = document.createElement('div');
  layer.id = 'magicAmbientLayer';

  const twinkles = document.createElement('div');
  twinkles.id = 'magicTwinkles';

  const fog = document.createElement('div');
  fog.id = 'magicFog';
  fog.innerHTML = `
    <div class="magicFogBank"></div>
    <div class="magicFogBank"></div>
    <div class="magicFogBank"></div>
  `;

  const weatherCanvas = document.createElement('canvas');
  weatherCanvas.id = 'magicWeatherCanvas';

  const stormShade = document.createElement('div');
  stormShade.id = 'magicStormShade';

  const lightning = document.createElement('div');
  lightning.id = 'magicLightning';

  layer.appendChild(twinkles);
  layer.appendChild(fog);
  layer.appendChild(stormShade);
  layer.appendChild(weatherCanvas);
  layer.appendChild(lightning);

  document.body.appendChild(layer);


  /* =====================================================
     ESTRELLAS TITILANTES
  ===================================================== */

  function buildTwinkles() {

    twinkles.innerHTML = '';

    const mobile =
      window.matchMedia('(max-width:600px)').matches;

    const count =
      mobile ? 22 : 36;

    for (let i = 0; i < count; i++) {

      const star =
        document.createElement('span');

      star.className =
        'magicTwinkleStar' +
        (Math.random() > .79 ? ' big' : '');

      star.style.left =
        `${3 + Math.random() * 94}%`;

      star.style.top =
        `${4 + Math.random() * 88}%`;

      star.style.setProperty(
        '--twinkle-time',
        `${3.2 + Math.random() * 4.8}s`
      );

      star.style.setProperty(
        '--twinkle-delay',
        `${-Math.random() * 6}s`
      );

      twinkles.appendChild(star);
    }
  }

  buildTwinkles();


  /* =====================================================
     CANASTA: BADGE + CARTITA VOLANDO
  ===================================================== */

  const basket =
    document.getElementById('letterBasketBtn');

  const basketCount =
    document.getElementById('basketCount');

  let previousBasketCount =
    basketCount
      ? Number(basketCount.textContent) || 0
      : 0;


  function pulseBadge() {

    if (!basketCount) return;

    basketCount.classList.remove('badgePop');

    void basketCount.offsetWidth;

    basketCount.classList.add('badgePop');
  }


  function flyLetterToBasket() {

    if (!basket) return;

    if (
      document.body.classList.contains(
        'intro-active'
      )
    ) {
      return;
    }

    const basketRect =
      basket.getBoundingClientRect();

    let startX =
      window.innerWidth * .50;

    let startY =
      window.innerHeight * .45;


    /*
      Si hay una carta abierta,
      sale desde la carta.
    */

    const reader =
      document.querySelector(
        '#letterReader.show .readerPaper'
      );

    if (reader) {

      const r =
        reader.getBoundingClientRect();

      startX =
        r.left +
        r.width * .5;

      startY =
        r.top +
        r.height * .62;
    }


    const fly =
      document.createElement('span');

    fly.className =
      'magicCollectionFly';

    fly.style.left =
      `${startX}px`;

    fly.style.top =
      `${startY}px`;

    document.body.appendChild(fly);


    const endX =
      basketRect.left +
      basketRect.width * .55;

    const endY =
      basketRect.top +
      basketRect.height * .55;


    const anim =
      fly.animate(

        [
          {
            transform:
              'translate(-50%,-50%) scale(.72) rotate(-7deg)',
            opacity:0
          },

          {
            offset:.14,
            transform:
              'translate(-50%,-50%) scale(1.10) rotate(3deg)',
            opacity:1
          },

          {
            offset:.62,
            transform:
              `translate(${(endX-startX)*.62}px,${(endY-startY)*.48 - 55}px) scale(.92) rotate(10deg)`,
            opacity:1
          },

          {
            transform:
              `translate(${endX-startX}px,${endY-startY}px) scale(.32) rotate(-5deg)`,
            opacity:.15
          }
        ],

        {
          duration:880,
          easing:
            'cubic-bezier(.20,.68,.24,1)',
          fill:'forwards'
        }

      );


    anim.onfinish =
      () => {

        fly.remove();

        pulseBadge();

        basket.classList.remove('pulse');

        void basket.offsetWidth;

        basket.classList.add('pulse');
      };
  }


  if (basketCount) {

    const countObserver =
      new MutationObserver(() => {

        const current =
          Number(
            basketCount.textContent
          ) || 0;


        if (
          current >
          previousBasketCount
        ) {

          flyLetterToBasket();
        }


        previousBasketCount =
          current;

      });


    countObserver.observe(
      basketCount,
      {
        childList:true,
        characterData:true,
        subtree:true
      }
    );

  }


  /* =====================================================
     LUNA: PARTÍCULAS EXTRA AL TERCER CLIC
  ===================================================== */

  const moon =
    document.getElementById('moonHotspot');


  function moonParticleBurst() {

    if (!moon) return;

    const rect =
      moon.getBoundingClientRect();

    const cx =
      rect.left +
      rect.width*.5;

    const cy =
      rect.top +
      rect.height*.5;


    const count =
      window.innerWidth < 600
      ? 13
      : 19;


    for (
      let i=0;
      i<count;
      i++
    ) {

      const p =
        document.createElement('span');

      p.className =
        'magicMoonParticle' +
        (
          Math.random()>.55
          ? ' diamond'
          : ''
        );


      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        35 +
        Math.random()*78;


      p.style.left =
        `${cx}px`;

      p.style.top =
        `${cy}px`;


      p.style.setProperty(
        '--particle-x',
        `${Math.cos(angle)*distance}px`
      );

      p.style.setProperty(
        '--particle-y',
        `${Math.sin(angle)*distance}px`
      );

      p.style.setProperty(
        '--particle-life',
        `${.85 + Math.random()*.85}s`
      );

      p.style.setProperty(
        '--particle-delay',
        `${Math.random()*.15}s`
      );


      document.body.appendChild(p);


      setTimeout(
        ()=>p.remove(),
        2100
      );
    }
  }


  if (moon) {

    let wasAwakened =
      moon.classList.contains(
        'awakened'
      );


    const moonObserver =
      new MutationObserver(() => {

        const awakened =
          moon.classList.contains(
            'awakened'
          );


        if (
          awakened &&
          !wasAwakened
        ) {

          moonParticleBurst();
        }


        wasAwakened =
          awakened;

      });


    moonObserver.observe(
      moon,
      {
        attributes:true,
        attributeFilter:['class']
      }
    );

  }



  /* =====================================================
     CARTAS SECRETAS DE LOS EVENTOS AMBIENTALES

     Cada evento genera UN elemento especial:
     - lluvia de estrellas -> estrella brillante
     - neblina            -> luz cálida
     - lluvia             -> gota brillante
     - tormenta           -> tulipán que sigue en pie

     El elemento especial suelta una carta.
  ===================================================== */

  const WEATHER_STORAGE_KEY =
    'paradox143_letters_v1';

  const WEATHER_LETTERS = {

    stars:{
      id:'weather-stars',
      title:'Carta de la lluvia de estrellas',
      mark:'✦',
      hint:'✦ Hay una estrella que brilla distinto...',
      text:'cada deseo que llegue a tener lo usare para tener la posibilidad de estar cerca de ti.. cerca de la estrellita mas brillante tu..'
    },

    fog:{
      id:'weather-fog',
      title:'Carta de la neblina',
      mark:'♡',
      hint:'♡ Hay una pequeña luz cálida dentro de la neblina...',
      text:'aun en la oscuridad mas profunda pordria verte y sentirte como siempre mi calida amada'
    },

    rain:{
      id:'weather-rain',
      title:'Carta de la lluvia',
      mark:'◇',
      hint:'◇ Una gota brilla diferente a todas las demás...',
      text:'sea cual sea el clima te acopañare frio o calor me es igual si es a tu lado..'
    },

    storm:{
      id:'weather-storm',
      title:'Carta de la tormenta',
      mark:'⚡',
      hint:'⚡ Entre la tormenta, un tulipán todavía sigue en pie...',
      text:'aunque todo fuera mal yo volveria contigo una y otra vez para volver a intentarlo porque un momento contigo vale mas que una historia completa con cualquiera...'
    }

  };


  let activeSpecialType=null;
  let activeSpecialTarget=null;
  let activeSpecialLetter=null;
  let activeSpecialResolved=true;


  const specialLayer =
    document.createElement(
      'div'
    );

  specialLayer.id =
    'magicSpecialLayer';

  layer.appendChild(
    specialLayer
  );


  const specialHint =
    document.createElement(
      'div'
    );

  specialHint.id =
    'magicSpecialHint';

  document.body.appendChild(
    specialHint
  );


  function readWeatherSaved(){

    try{

      const raw =
        localStorage.getItem(
          WEATHER_STORAGE_KEY
        );

      const arr =
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


  function writeWeatherSaved(
    arr
  ){

    try{

      localStorage.setItem(
        WEATHER_STORAGE_KEY,
        JSON.stringify(
          [...new Set(arr)]
        )
      );

    }
    catch(_){}
  }


  function hasWeatherLetter(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return false;
    }

    return readWeatherSaved()
      .includes(
        data.id
      );
  }


  function syncWeatherBasketCount(){

    const count =
      document.getElementById(
        'basketCount'
      );

    if(!count){
      return;
    }

    count.textContent =
      String(
        new Set(
          readWeatherSaved()
        ).size
      );
  }


  function showSpecialHint(
    text
  ){

    specialHint.textContent =
      text;

    specialHint.classList.remove(
      'show'
    );

    void specialHint.offsetWidth;

    specialHint.classList.add(
      'show'
    );

    clearTimeout(
      showSpecialHint.timer
    );

    showSpecialHint.timer =
      setTimeout(
        ()=>{
          specialHint.classList.remove(
            'show'
          );
        },
        4300
      );
  }


  function openWeatherLetter(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    const reader =
      document.getElementById(
        'letterReader'
      );

    const mark =
      document.getElementById(
        'readerMark'
      );

    const title =
      document.getElementById(
        'readerTitle'
      );

    const text =
      document.getElementById(
        'readerText'
      );

    const keep =
      document.getElementById(
        'readerKeep'
      );


    if(
      reader &&
      mark &&
      title &&
      text
    ){

      mark.textContent =
        data.mark;

      title.textContent =
        data.title;

      text.textContent =
        data.text;

      if(keep){
        keep.style.display =
          'none';
      }

      reader.classList.add(
        'show'
      );

    }
    else{

      alert(
        data.text
      );
    }


    const saved =
      readWeatherSaved();

    if(
      !saved.includes(
        data.id
      )
    ){

      saved.push(
        data.id
      );

      writeWeatherSaved(
        saved
      );

      syncWeatherBasketCount();

      const basket =
        document.getElementById(
          'letterBasketBtn'
        );

      if(basket){

        basket.classList.remove(
          'pulse'
        );

        void basket.offsetWidth;

        basket.classList.add(
          'pulse'
        );
      }
    }


    activeSpecialResolved=true;
    activeSpecialType=null;

    injectWeatherLettersIntoBasket();
  }


  function injectWeatherLettersIntoBasket(){

    const list =
      document.getElementById(
        'basketLetters'
      );

    if(!list){
      return;
    }


    /*
      letters.js reconstruye la lista.
      Quitamos nuestras entradas antiguas
      antes de volver a insertarlas.
    */

    list
      .querySelectorAll(
        '.basketLetterItem[data-weather-letter]'
      )
      .forEach(
        item=>item.remove()
      );


    const saved =
      readWeatherSaved();


    for(
      const [
        type,
        data
      ]
      of Object.entries(
        WEATHER_LETTERS
      )
    ){

      if(
        !saved.includes(
          data.id
        )
      ){
        continue;
      }


      const empty =
        list.querySelector(
          '.basketEmpty'
        );

      if(empty){
        empty.remove();
      }


      const item =
        document.createElement(
          'button'
        );

      item.className =
        'basketLetterItem';

      item.type =
        'button';

      item.dataset.weatherLetter =
        type;


      item.innerHTML =
        `
          <span class="basketLetterMark">${data.mark}</span>
          <span>
            <strong>${data.title}</strong>
            <small>Toca para volver a leerla</small>
          </span>
        `;


      item.addEventListener(
        'click',
        ()=>{

          const overlay =
            document.getElementById(
              'basketOverlay'
            );

          if(overlay){
            overlay.classList.remove(
              'show'
            );
          }

          openWeatherLetter(
            type
          );
        }
      );


      list.appendChild(
        item
      );
    }


    syncWeatherBasketCount();
  }


  const weatherBasket =
    document.getElementById(
      'letterBasketBtn'
    );


  if(weatherBasket){

    weatherBasket.addEventListener(
      'click',
      ()=>{

        setTimeout(
          ()=>{
            injectWeatherLettersIntoBasket();
            syncWeatherBasketCount();
          },
          0
        );

      }
    );
  }


  function removeActiveSpecial(){

    if(activeSpecialTarget){

      activeSpecialTarget.remove();

      activeSpecialTarget=null;
    }
  }


  function makeEventLetter(
    type,
    startX,
    startY
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    if(activeSpecialLetter){

      activeSpecialLetter.remove();
    }


    const letter =
      document.createElement(
        'button'
      );

    letter.className =
      'weatherEventLetter';

    letter.type =
      'button';

    letter.setAttribute(
      'aria-label',
      data.title
    );


    letter.innerHTML =
      `
        <span class="weatherEnvelope"></span>
        <span class="weatherEnvelopeSeal">${data.mark}</span>
        <span class="weatherEnvelopeSpark">✦</span>
      `;


    const landingX =
      Math.max(
        72,
        Math.min(
          window.innerWidth-72,
          startX +
          (
            Math.random()-.5
          )*120
        )
      );


    const landingY =
      Math.max(
        window.innerHeight*.61,
        Math.min(
          window.innerHeight*.79,
          startY +
          130
        )
      );


    letter.style.left =
      `${startX}px`;

    letter.style.top =
      `${startY}px`;

    letter.style.setProperty(
      '--eventLetterX',
      `${landingX-startX}px`
    );

    letter.style.setProperty(
      '--eventLetterY',
      `${landingY-startY}px`
    );


    specialLayer.appendChild(
      letter
    );


    activeSpecialLetter =
      letter;


    requestAnimationFrame(
      ()=>{

        letter.classList.add(
          'drop'
        );
      }
    );


    setTimeout(
      ()=>{

        letter.classList.add(
          'ready'
        );

        showSpecialHint(
          '💌 Cayó una cartita...'
        );

      },
      1050
    );


    letter.addEventListener(
      'click',
      ()=>{

        if(
          !letter.classList.contains(
            'ready'
          )
        ){
          return;
        }


        letter.remove();

        activeSpecialLetter=null;

        openWeatherLetter(
          type
        );
      }
    );

  }


  function activateSpecialTarget(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    /*
      Si ya encontró esa carta en otra visita,
      el evento sigue siendo visual pero ya
      no vuelve a duplicar la carta.
    */

    if(
      hasWeatherLetter(
        type
      )
    ){

      activeSpecialResolved=true;
      activeSpecialType=null;

      return;
    }


    removeActiveSpecial();


    activeSpecialResolved=false;
    activeSpecialType=type;


    const target =
      document.createElement(
        'button'
      );

    target.type =
      'button';

    target.className =
      `weatherSpecial weatherSpecial-${type}`;

    target.setAttribute(
      'aria-label',
      data.hint
    );


    if(
      type === 'stars'
    ){

      target.innerHTML =
        '<span class="specialStarCore">✦</span>';

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${10 + Math.random()*20}%`;
    }


    else if(
      type === 'fog'
    ){

      target.innerHTML =
        '<span class="specialFogCore">♡</span>';

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${42 + Math.random()*18}%`;
    }


    else if(
      type === 'rain'
    ){

      target.innerHTML =
        '<span class="specialRainCore"></span>';

      target.style.left =
        `${16 + Math.random()*68}%`;

      target.style.top =
        `${36 + Math.random()*22}%`;
    }


    else if(
      type === 'storm'
    ){

      target.innerHTML =
        `
          <span class="specialStormTulip"></span>
          <span class="specialStormBolt">⚡</span>
        `;

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${63 + Math.random()*12}%`;
    }


    specialLayer.appendChild(
      target
    );


    activeSpecialTarget =
      target;


    showSpecialHint(
      data.hint
    );


    target.addEventListener(
      'click',
      e=>{

        e.preventDefault();
        e.stopPropagation();


        const rect =
          target.getBoundingClientRect();


        const x =
          rect.left +
          rect.width*.5;

        const y =
          rect.top +
          rect.height*.5;


        target.classList.add(
          'found'
        );


        setTimeout(
          ()=>{

            target.remove();

            if(
              activeSpecialTarget ===
              target
            ){
              activeSpecialTarget=null;
            }


            makeEventLetter(
              type,
              x,
              y
            );

          },
          400
        );

      }
    );

  }


  function spawnSpecialForEvent(
    type
  ){

    const delay =

      type === 'storm'
      ? 3000

      : (
          type === 'stars'
          ? 1300
          : 1800
        );


    setTimeout(
      ()=>{

        activateSpecialTarget(
          type
        );

      },
      delay
    );
  }


  /* =====================================================
     WEATHER CANVAS
  ===================================================== */

  const weatherCtx =
    weatherCanvas.getContext(
      '2d',
      {
        alpha:true,
        desynchronized:true
      }
    );


  let weatherDpr=1;
  let weatherW=1;
  let weatherH=1;

  let weatherRAF=0;
  let drops=[];

  let activeEvent=null;
  let eventEndingTimer=0;

  let lightningTimers=[];


  function resizeWeather() {

    weatherW =
      Math.max(
        1,
        window.innerWidth
      );

    weatherH =
      Math.max(
        1,
        window.innerHeight
      );


    weatherDpr =
      Math.min(
        window.devicePixelRatio || 1,
        1.25
      );


    weatherCanvas.width =
      Math.round(
        weatherW *
        weatherDpr
      );

    weatherCanvas.height =
      Math.round(
        weatherH *
        weatherDpr
      );


    weatherCanvas.style.width =
      `${weatherW}px`;

    weatherCanvas.style.height =
      `${weatherH}px`;


    weatherCtx.setTransform(
      weatherDpr,
      0,
      0,
      weatherDpr,
      0,
      0
    );
  }

  resizeWeather();


  /* =====================================================
     LLUVIA
  ===================================================== */

  function createRain(
    heavy=false
  ) {

    drops=[];


    const mobile =
      window.innerWidth < 600;


    const count =
      heavy

      ? (
          mobile
          ? 175
          : 275
        )

      : (
          mobile
          ? 62
          : 105
        );


    for (
      let i=0;
      i<count;
      i++
    ) {

      drops.push({

        x:
          Math.random() *
          (
            weatherW + 120
          ),

        y:
          Math.random() *
          weatherH,

        len:
          heavy
          ? 20 + Math.random()*22
          : 8 + Math.random()*12,

        speed:
          heavy
          ? 23 + Math.random()*17
          : 10 + Math.random()*9,

        drift:
          heavy
          ? -8.6
          : -3.4,

        alpha:
          heavy
          ? .40 + Math.random()*.42
          : .20 + Math.random()*.28

      });
    }
  }


  function drawRain() {

    weatherCtx.clearRect(
      0,
      0,
      weatherW,
      weatherH
    );


    weatherCtx.lineWidth =
      activeEvent === 'storm'
      ? 1.25
      : 1;


    for (
      const d
      of drops
    ) {

      weatherCtx.strokeStyle =
        `rgba(186,214,232,${d.alpha})`;


      weatherCtx.beginPath();

      weatherCtx.moveTo(
        d.x,
        d.y
      );

      weatherCtx.lineTo(
        d.x + d.drift,
        d.y + d.len
      );

      weatherCtx.stroke();


      d.x +=
        d.drift*.30;

      d.y +=
        d.speed;


      if (
        d.y >
        weatherH + 30
      ) {

        d.y =
          -30;

        d.x =
          Math.random() *
          (
            weatherW + 100
          );
      }


      if (
        d.x < -80
      ) {

        d.x =
          weatherW + 60;
      }

    }


    weatherRAF =
      requestAnimationFrame(
        drawRain
      );
  }


  function startRain(
    heavy=false
  ) {

    createRain(
      heavy
    );


    weatherCanvas.classList.add(
      'show'
    );


    cancelAnimationFrame(
      weatherRAF
    );


    drawRain();
  }


  function stopRain() {

    weatherCanvas.classList.remove(
      'show'
    );


    cancelAnimationFrame(
      weatherRAF
    );


    weatherRAF=0;


    setTimeout(
      ()=>{

        weatherCtx.clearRect(
          0,
          0,
          weatherW,
          weatherH
        );

      },
      700
    );
  }


  /* =====================================================
     LLUVIA DE ESTRELLAS
  ===================================================== */

  function shootingStarEvent() {

    const amount =
      window.innerWidth < 600
      ? 7
      : 11;


    for (
      let i=0;
      i<amount;
      i++
    ) {

      const s =
        document.createElement(
          'span'
        );

      s.className =
        'magicShootingStar';


      s.style.left =
        `${-5 + Math.random()*74}%`;

      s.style.top =
        `${2 + Math.random()*28}%`;


      s.style.setProperty(
        '--shoot-x',
        `${240 + Math.random()*360}px`
      );

      s.style.setProperty(
        '--shoot-y',
        `${135 + Math.random()*230}px`
      );

      s.style.setProperty(
        '--shoot-time',
        `${.85 + Math.random()*.95}s`
      );

      s.style.setProperty(
        '--shoot-delay',
        `${Math.random()*3.7}s`
      );

      s.style.setProperty(
        '--tail',
        `${55 + Math.random()*95}px`
      );


      layer.appendChild(s);


      setTimeout(
        ()=>s.remove(),
        5900
      );
    }

  }


  /* =====================================================
     NEBLINA
  ===================================================== */

  function startFog() {

    fog.classList.add(
      'show'
    );
  }


  function stopFog() {

    fog.classList.remove(
      'show'
    );
  }


  /* =====================================================
     TORMENTA — EVENTO FINAL ESPECIAL
  ===================================================== */

  function clearLightningTimers() {

    for (
      const t
      of lightningTimers
    ) {

      clearTimeout(t);
    }


    lightningTimers=[];
  }


  function makeLightning() {

    lightning.classList.remove(
      'flash'
    );

    void lightning.offsetWidth;

    lightning.classList.add(
      'flash'
    );


    /*
      Cada relámpago hace más fuerte
      el daño temporal en los tulipanes.
    */

    if(
      window.MAGIC_STORM_ACTIVE
    ){

      window.MAGIC_STORM_DAMAGE =
        Math.min(
          .34,
          (
            window.MAGIC_STORM_DAMAGE
            || .12
          )
          +
          .045
        );


      try{

        fieldApp.animate(

          [
            {transform:'translateX(0)'},
            {transform:'translateX(-3px)'},
            {transform:'translateX(3px)'},
            {transform:'translateX(-2px)'},
            {transform:'translateX(0)'}
          ],

          {
            duration:330,
            easing:'steps(5,end)'
          }

        );

      }
      catch(_){}
    }
  }


  function scheduleLightning() {

    clearLightningTimers();


    const times =
      [
         900 + Math.random()*500,
        2300 + Math.random()*500,
        4200 + Math.random()*650,
        6500 + Math.random()*650,
        9000 + Math.random()*700,
       11600 + Math.random()*650
      ];


    for (
      const time
      of times
    ) {

      lightningTimers.push(

        setTimeout(
          makeLightning,
          time
        )

      );
    }

  }


  /* =====================================================
     CONTROL DE EVENTOS
  ===================================================== */

  let eventSequence=
    [
      'stars',
      'fog',
      'rain'
    ];


  /*
    Orden aleatorio de los tres eventos suaves.
    La tormenta SIEMPRE será el cuarto / último especial.
  */

  for (
    let i=
      eventSequence.length-1;

    i>0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i+1)
      );


    [
      eventSequence[i],
      eventSequence[j]
    ] =
    [
      eventSequence[j],
      eventSequence[i]
    ];
  }


  eventSequence.push(
    'storm'
  );


  let eventIndex=0;

  let exploration=0;

  let nextExplorationGoal =
    850 +
    Math.random()*700;

  let lastEventAt=0;


  function busyScene() {

    if (
      document.body.classList.contains(
        'intro-active'
      )
    ) {
      return true;
    }


    const game =
      document.getElementById(
        'gameOverlay'
      );


    if (
      game &&
      game.classList.contains(
        'show'
      )
    ) {
      return true;
    }


    /*
      No lanzar clima nuevo justo
      mientras Mewo está siendo atrapada.
    */

    const mewo =
      document.getElementById(
        'mewoCat'
      );


    if (
      mewo &&
      mewo.classList.contains(
        'show'
      ) &&
      !mewo.classList.contains(
        'leaving'
      )
    ) {
      return true;
    }


    return false;
  }


  function startAmbientEvent(
    type
  ) {

    if (
      activeEvent ||
      busyScene() ||
      document.hidden
    ) {

      return false;
    }


    activeEvent=
      type;

    lastEventAt=
      Date.now();


    clearTimeout(
      eventEndingTimer
    );


    let duration=6000;


    if (
      type === 'stars'
    ) {

      shootingStarEvent();

      duration=5600;
    }


    else if (
      type === 'fog'
    ) {

      startFog();

      duration=8500;
    }


    else if (
      type === 'rain'
    ) {

      startRain(false);

      duration=8500;
    }


    else if (
      type === 'storm'
    ) {

      /*
        TORMENTA FUERTE:
        viento + lluvia intensa + rayos +
        algunos tulipanes son derribados.
      */

      window.MAGIC_STORM_ACTIVE=true;
      window.MAGIC_STORM_INTENSITY=1.25;
      window.MAGIC_STORM_DAMAGE=.11;


      stormShade.classList.add(
        'show'
      );

      startFog();

      startRain(true);

      scheduleLightning();

      duration=14500;
    }


    /*
      Cada evento esconde un objeto especial.
      Al encontrarlo suelta su cartita.
    */
    spawnSpecialForEvent(
      type
    );


    eventEndingTimer =
      setTimeout(

        ()=>{
          endAmbientEvent(type);
        },

        duration

      );


    return true;
  }


  function endAmbientEvent(
    type
  ) {

    if (
      type === 'fog'
    ) {

      stopFog();
    }


    if (
      type === 'rain'
    ) {

      stopRain();
    }


    if (
      type === 'storm'
    ) {

      clearLightningTimers();

      lightning.classList.remove(
        'flash'
      );

      stormShade.classList.remove(
        'show'
      );

      stopFog();

      stopRain();


      /*
        El campo se recupera después
        de la tormenta.
      */

      window.MAGIC_STORM_ACTIVE=false;
      window.MAGIC_STORM_INTENSITY=0;

      setTimeout(
        ()=>{
          window.MAGIC_STORM_DAMAGE=0;
        },
        1500
      );
    }


    activeEvent=null;


    /*
      Siguiente evento requiere otra
      exploración suficiente.
    */

    exploration=0;

    nextExplorationGoal =
      900 +
      Math.random()*850;


    if (
      eventIndex <
      eventSequence.length
    ) {

      /*
        eventIndex ya fue avanzado
        al empezar el evento.
      */
    }
  }


  function tryNextEvent() {

    /*
      Si apareció un objeto secreto de un evento
      y aún no abrió su cartita, el siguiente evento
      espera. Así cada clima tiene su pequeño juego.
    */

    if(
      !activeSpecialResolved
    ){

      showSpecialHint(
        'Todavía hay algo especial por encontrar...'
      );

      return false;
    }


    if (
      eventIndex >=
      eventSequence.length
    ) {

      /*
        Después de la tormenta,
        pueden volver a aparecer
        eventos suaves aleatorios,
        pero NO otra tormenta.
      */

      const soft =
        [
          'stars',
          'fog',
          'rain'
        ];


      const type =
        soft[
          Math.floor(
            Math.random() *
            soft.length
          )
        ];


      return startAmbientEvent(
        type
      );
    }


    const type =
      eventSequence[
        eventIndex
      ];


    if (
      startAmbientEvent(
        type
      )
    ) {

      eventIndex++;

      return true;
    }


    return false;
  }


  /* =====================================================
     ARRASTRAR = EXPLORAR
  ===================================================== */

  let exploring=false;
  let lastPointerX=0;


  fieldApp.addEventListener(

    'pointerdown',

    e=>{

      exploring=true;

      lastPointerX=
        e.clientX;

    },

    {
      passive:true
    }

  );


  fieldApp.addEventListener(

    'pointermove',

    e=>{

      if (
        !exploring
      ) {
        return;
      }


      const dx =
        Math.abs(
          e.clientX -
          lastPointerX
        );


      lastPointerX =
        e.clientX;


      /*
        El campo se sigue moviendo por
        main.js. Aquí SOLO contamos cuánto
        se ha explorado.
      */

      exploration +=
        Math.min(
          80,
          dx
        );


      if (
        exploration >=
        nextExplorationGoal
      ) {

        /*
          Cooldown para que no aparezcan
          eventos uno detrás de otro.
        */

        if (
          Date.now() -
          lastEventAt >
          12000
        ) {

          if (
            tryNextEvent()
          ) {

            exploration=0;
          }
        }
      }

    },

    {
      passive:true
    }

  );


  function stopExploring() {

    exploring=false;
  }


  fieldApp.addEventListener(
    'pointerup',
    stopExploring,
    {
      passive:true
    }
  );


  fieldApp.addEventListener(
    'pointercancel',
    stopExploring,
    {
      passive:true
    }
  );


  /* =====================================================
     SI SOLO MIRA EL CAMPO

     También puede aparecer magia sin arrastrar,
     pero con mucha menos frecuencia.
  ===================================================== */

  const passiveCheck =
    setInterval(

      ()=>{

        if (
          activeEvent ||
          busyScene() ||
          document.hidden
        ) {
          return;
        }


        const elapsed =
          Date.now() -
          lastEventAt;


        /*
          Si llevan bastante tiempo sin evento,
          hay una probabilidad suave.
        */

        if (
          elapsed >
          43000 &&
          Math.random() <
          .34
        ) {

          tryNextEvent();
        }

      },

      9000

    );


  /* =====================================================
     RESIZE
  ===================================================== */

  let resizeTimer=0;


  window.addEventListener(

    'resize',

    ()=>{

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(

          ()=>{

            resizeWeather();

            buildTwinkles();

          },

          160

        );

    }

  );


  window.addEventListener(

    'orientationchange',

    ()=>{

      setTimeout(

        ()=>{

          resizeWeather();

          buildTwinkles();

        },

        300

      );

    }

  );

})();
