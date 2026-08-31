/* =========================================================
   PARADOX143 — CINEMÁTICAS DEL ACTO I

   No añade cartas nuevas.
   Convierte momentos importantes ya existentes en pequeñas
   escenas cinematográficas antes de presentar su carta.
========================================================= */

(() => {
  'use strict';

  const QUEUE=[];
  let current=null;
  let layer=null;
  let frameTimer=0;
  let readyTimer=0;

  const SCENES={
    'act1-fireflies':{
      theme:'fireflies',
      mark:'✦',
      cats:[],
      prop:null,
      frames:[
        'las lucecitas dejaron de huir por un momento...',
        'parecían estrellas demasiado pequeñas para quedarse en el cielo.',
        'y durante unos segundos el Claro brilló solamente para nosotros ♡'
      ]
    },

    'act1-tuluz-treasure':{
      theme:'tuluz',
      mark:'◇',
      cats:['cat_orange_happy.png'],
      prop:'toy_yarn.png',
      frames:[
        'Tuluz salió corriendo antes de que pudiera preguntarle qué estaba buscando...',
        'dio media vuelta al refugio por una cosita diminuta.',
        'para él era un tesoro. supongo que eso era suficiente para que también lo fuera para nosotros ♡'
      ]
    },

    'act1-mewo-awake':{
      theme:'mewo',
      mark:'☾',
      cats:['mewo_idle.png'],
      prop:null,
      frames:[
        'esa noche Mewo simplemente no quería mimir.',
        'probamos comida, mimitos y quedarnos cerquita...',
        'al final quizá solo necesitaba saber que alguien todavía estaba ahí ♡'
      ]
    },

    'act1-yarn-trail':{
      theme:'yarn',
      mark:'∞',
      cats:['cat_orange_happy.png'],
      prop:'toy_yarn.png',
      frames:[
        'el hilo atravesó el jardín como si alguien hubiera dibujado un camino sin preguntar.',
        'Tuluz lo miró como si aquel desastre fuera una obra maestra.',
        'creo que volverá a hacerlo >w<' 
      ]
    },

    'act1-midnight-flower':{
      theme:'flower',
      mark:'❀',
      cats:[],
      prop:null,
      frames:[
        'la flor esperó a que el cielo estuviera lleno de estrellas...',
        'entonces abrió poquito a poquito.',
        'como si hubiera guardado una luz que solo quería enseñarnos esta noche ♡'
      ]
    },

    'act1-cat-picnic':{
      theme:'picnic',
      mark:'♡',
      cats:['mewo_idle.png','cat_gray_happy.png','cat_orange_happy.png'],
      prop:'food_bowl.png',
      frames:[
        'no era una gran celebración.',
        'solo comida, juguetes y tres gatitos haciendo lo que se les daba la gana...',
        'pero se sintió exactamente como uno de esos momentos que quisiera guardar ♡'
      ]
    },

    'act1-our-charm':{
      theme:'charm',
      mark:'✧',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'lo colgamos sin hacer demasiado ruido.',
        'una cosita pequeña elegida por ti.',
        'ahora cada vez que volvamos habrá algo en este refugio que recuerde que tú también ayudaste a construirlo ♡'
      ]
    },

    'act1-new-nook':{
      theme:'nook',
      mark:'✦',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'las hojas se movieron donde antes parecía terminar el Claro...',
        'detrás había espacio.',
        'tal vez este pequeño lugar todavía no terminó de crecer con nosotros ♡'
      ]
    },

    'act1-marie-place':{
      theme:'marie',
      mark:'♡',
      cats:['cat_gray_sleep.png'],
      prop:'pillow_base_square.png',
      frames:[
        'Marie volvió al mismo rincón otra vez.',
        'dio una vuelta pequeñita y se acomodó como si siempre hubiera pertenecido ahí.',
        'creo que ya eligió su lugar ♡'
      ]
    },

    'act1-tuluz-place':{
      theme:'tuluz-place',
      mark:'✦',
      cats:['cat_orange_happy.png'],
      prop:'toy_ball.png',
      frames:[
        'Tuluz también encontró un sitio favorito.',
        'casualmente queda muy cerca de todo lo que puede tirar, perseguir o robar >w<',
        'sí... definitivamente es su lugar.'
      ]
    },

    'act1-mewo-place':{
      theme:'mewo-place',
      mark:'🐾',
      cats:['mewo_idle.png'],
      prop:null,
      frames:[
        'Mewo puede irse al campo, acercarse a la canasta o volver aquí cuando quiera.',
        'pero incluso ella terminó escogiendo un pequeño rincón al cual regresar.',
        'supongo que tener libertad también significa poder elegir dónde volver ♡'
      ]
    },

    'act1-home-light':{
      theme:'light',
      mark:'✦',
      cats:['mewo_idle.png','cat_gray_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'encendimos una lucecita y el refugio cambió apenas un poquito.',
        'no ilumina todo el bosque.',
        'solo lo suficiente para recordarnos dónde volver ♡'
      ]
    },

    'act1-night-home':{
      theme:'night',
      mark:'☾',
      cats:['mewo_sleep.png','cat_gray_sleep.png','cat_orange_sleep.png'],
      prop:null,
      frames:[
        'Tuluz dejó de correr.',
        'Marie encontró dónde mimir. Mewo se quedó cerquita.',
        'y sin que ocurriera nada extraordinario... el refugio se sintió completamente lleno ♡'
      ]
    }
  };

  function ensure(){
    if(layer) return;

    layer=document.createElement('div');
    layer.id='act1Cinematic';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`
      <div class="act1CineAtmosphere">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      <div class="act1CineStage">
        <div id="act1CineVisual">
          <div id="act1CineCats"></div>
          <img id="act1CineProp" alt="">
          <div id="act1CineFlower"><i></i><i></i><i></i></div>
          <div id="act1CineLantern">✦</div>
        </div>

        <span id="act1CineMark">♡</span>
        <p id="act1CineText"></p>
      </div>

      <button id="act1CineContinue" type="button">guardar carta ♡</button>
    `;

    document.body.appendChild(layer);

    document.getElementById('act1CineContinue')?.addEventListener('click',finish);
  }

  function queued(id){
    return current===id || QUEUE.includes(id);
  }

  function enqueue(id){
    if(!SCENES[id] || queued(id)) return false;
    QUEUE.push(id);
    playNext();
    return true;
  }

  function playNext(){
    if(current || !QUEUE.length) return;

    /*
      No ponemos una cinematográfica detrás de una carta
      que todavía se está leyendo.
    */
    if(
      document.getElementById('letterReader')
        ?.classList.contains('show')
    ){
      setTimeout(playNext,700);
      return;
    }

    start(QUEUE.shift());
  }

  function start(id){
    const scene=SCENES[id];
    if(!scene) return;

    ensure();
    current=id;

    clearTimeout(frameTimer);
    clearTimeout(readyTimer);

    document.body.classList.add('act1-cinematic-open');

    layer.dataset.theme=scene.theme;
    layer.classList.add('show');
    layer.setAttribute('aria-hidden','false');

    const mark=document.getElementById('act1CineMark');
    const text=document.getElementById('act1CineText');
    const cats=document.getElementById('act1CineCats');
    const prop=document.getElementById('act1CineProp');
    const cont=document.getElementById('act1CineContinue');

    mark.textContent=scene.mark;
    cats.innerHTML=(scene.cats||[]).map((src,i)=>`<img src="${src}" alt="" style="--i:${i}">`).join('');

    if(scene.prop){
      prop.src=scene.prop;
      prop.classList.add('show');
    }else{
      prop.removeAttribute('src');
      prop.classList.remove('show');
    }

    cont.classList.remove('ready');

    let i=0;
    const showFrame=()=>{
      if(current!==id) return;

      text.classList.remove('visible');
      void text.offsetWidth;
      text.textContent=scene.frames[i];
      text.classList.add('visible');
      i++;

      if(i<scene.frames.length){
        frameTimer=setTimeout(showFrame,3100);
      }else{
        readyTimer=setTimeout(()=>cont.classList.add('ready'),1900);
      }
    };

    setTimeout(showFrame,650);
  }

  function finish(){
    if(!current) return;

    const finished=current;
    current=null;

    clearTimeout(frameTimer);
    clearTimeout(readyTimer);

    layer?.classList.remove('show');
    layer?.setAttribute('aria-hidden','true');
    document.body.classList.remove('act1-cinematic-open');

    /*
      CORRECCIÓN IMPORTANTE:
      al pulsar "guardar carta ♡" la carta se añade AHORA
      MISMO a paradox143_letters_v1 mediante la API oficial
      de letters.js. Por eso el contador 53/79 sí aumenta.
    */
    try{
      window.ParadoxLetters?.collect?.(finished,false);
      window.ParadoxBasket2?.refresh?.();
    }catch(_){}

    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-act1-cinematic-finished',
          {detail:{id:finished}}
        )
      );
    }catch(_){}

    /*
      Después de guardarla la abrimos para que pueda leerse.
      Ya aparece como guardada, sin segundo botón ni patita.
    */
    setTimeout(()=>{
      try{
        window.ParadoxLetters?.open?.(finished,false);
      }catch(_){}
    },240);

    setTimeout(playNext,900);
  }

  window.addEventListener(
    'paradox-act1-earned',
    event=>{
      const id=event.detail?.id;
      enqueue(id);
    }
  );

  /*
    RECUPERACIÓN:
    Si con el parche anterior una cinematográfica ya ocurrió
    pero su carta quedó en "earned" sin entrar al contador,
    la detectamos y la volvemos a presentar una sola vez.
  */
  function recoverPendingCinematics(){
    try{
      const life=
        JSON.parse(
          localStorage.getItem(
            'paradox143_act1_life_v1'
          ) || '{}'
        );

      const letters=
        new Set(
          JSON.parse(
            localStorage.getItem(
              'paradox143_letters_v1'
            ) || '[]'
          )
        );

      const earned=
        Array.isArray(life.earned)
          ? life.earned
          : [];

      earned.forEach(id=>{
        if(
          SCENES[id] &&
          !letters.has(id)
        ){
          enqueue(id);
        }
      });
    }catch(_){}
  }

  setTimeout(
    recoverPendingCinematics,
    2600
  );

  window.ParadoxAct1Cinematics={
    play:enqueue,
    scenes:Object.keys(SCENES),
    recover:recoverPendingCinematics
  };
})();
