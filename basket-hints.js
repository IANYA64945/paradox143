/* =========================================================
   CANASTA — ZONA DE PISTAS
   Pistas contextuales, indirectas, estilo guía.
========================================================= */
(() => {
  'use strict';
  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const ADV_KEY='paradox143_act1_adventures_v1';
  const GROWTH_KEY='paradox143_act1_growth_v1';
  let hintIndex=0,lastPool=[];

  function json(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){return {};}}
  function have(){try{const a=JSON.parse(localStorage.getItem(LETTER_KEY)||'[]');return new Set(Array.isArray(a)?a:[]);}catch(_){return new Set();}}
  function missing(set,id){return !set.has(id);}

  function pool(){
    const h=have(), l=json(LIFE_KEY), a=json(ADV_KEY), g=json(GROWTH_KEY), p=[];

    // Momentos 44–55
    if(missing(h,'act1-five-minutes')) p.push('Hay lugares que no esconden nada hasta que dejas de intentar encontrar algo y simplemente te quedas un rato.');
    if(missing(h,'act1-tuluz-ball')) p.push('Tuluz se mueve mucho, pero sus juguetes no siempre consiguen seguirle el ritmo. Mira bien el suelo del Claro.');
    if(missing(h,'act1-marie-trail')) p.push('Marie no suele dejar huellitas porque sí. Si ves una, quizá haya otra un poquito más adelante.');
    if(missing(h,'act1-fireflies')) p.push('Algunas lucecitas del Claro parecen demasiado bajas para ser estrellas.');
    if(missing(h,'act1-after-rain')) p.push('Cuando termina la lluvia no todo vuelve a la normalidad de inmediato. A veces el suelo guarda un poquito del cielo.');
    if(missing(h,'act1-save-toy')) p.push('Cuando llueve fuerte, quizá convenga mirar los bordes del refugio antes de acomodarse dentro.');
    if(missing(h,'act1-fallen-star')) p.push('El campo es infinito por una razón. Hay cosas que no caen cerca de donde empezaste.');
    if(missing(h,'act1-field-loop')&&h.has('act1-fallen-star')) p.push('Después de caminar muchísimo, algunos lugares empiezan a sentirse conocidos aunque jurarías no haber estado ahí.');
    if(missing(h,'act1-our-tulip')&&l.fallenStarDone&&l.fieldLoopDone) p.push('Ya recorriste bastante este campo. Quizá sea hora de dejar algo tuyo entre tantos tulipanes.');
    if(missing(h,'act1-three-sleep')) p.push('Los tres no siempre coinciden para dormir. Cuando ocurra, tal vez sea mejor no despertarlos demasiado rápido.');

    // Aventuras 56–67
    if(missing(h,'act1-tuluz-treasure')) p.push('Cuando Tuluz parece estar buscando algo, normalmente significa que él mismo lo perdió.');
    if(missing(h,'act1-marie-guide')) p.push('Marie camina despacio. Si alguna vez parece esperar que la sigas, no tengas prisa.');
    if(missing(h,'act1-mewo-awake')) p.push('A veces Mewo no necesita una sola cosa. Un poco de compañía puede tener muchas formas.');
    if(missing(h,'act1-star-home')) p.push('No todas las estrellas quieren quedarse en el campo. Algunas parecen estar intentando subir otra vez.');
    if(missing(h,'act1-yarn-trail')) p.push('Un ovillo ordenado es sospechoso cuando Tuluz anda cerca.');
    if(missing(h,'act1-rain-rescue')) p.push('Si la lluvia o la tormenta te encuentra dentro del Claro, revisa qué quedó afuera.');
    if(missing(h,'act1-tall-tulips')) p.push('Los tulipanes no tienen exactamente la misma altura en todos los rincones lejanos.');
    if(missing(h,'act1-midnight-flower')) p.push('Hay una flor que parece preferir las noches en las que el cielo está especialmente lleno de estrellas.');
    if(missing(h,'act1-two-paths')) p.push('Si Marie y Tuluz quieren ir en direcciones distintas, elegir uno no significa perder al otro.');
    if(missing(h,'act1-cat-picnic')) p.push('Tres gatitos, comida y juguetes. A veces no hace falta una ocasión especial para organizar algo pequeño.');
    if(missing(h,'act1-our-charm')) p.push('Después de varias aventuras, el refugio quizá esté listo para que elijas un detallito que se quede allí.');

    // Hogar 68–79
    if(missing(h,'act1-new-nook')) p.push('Ese borde del Claro parece menos cerrado de lo que era antes. Quizá las hojas estén escondiendo espacio, no un secreto.');
    if(missing(h,'act1-second-pillow')&&g.nook) p.push('Una sola almohada era suficiente cuando el refugio estaba más vacío. Ya no estoy tan seguro.');
    if(missing(h,'act1-toy-box')&&g.pillow2) p.push('Tuluz ha conseguido repartir sus juguetes por medio jardín. Tal vez deberían tener un sitio propio.');
    if(missing(h,'act1-water-bowl')&&g.toyBox) p.push('Hay comida en el refugio. Algo igual de sencillo todavía parece faltar cerca del comedero.');
    if(missing(h,'act1-marie-place')&&g.pillow2) p.push('Marie empieza a volver al mismo rincón con demasiada frecuencia para que sea casualidad.');
    if(missing(h,'act1-tuluz-place')&&g.toyBox) p.push('Si quisieras encontrar a Tuluz rápidamente, probablemente mirarías cerca de aquello con lo que puede jugar.');
    if(missing(h,'act1-mewo-place')&&g.water) p.push('Mewo puede ir y venir, pero incluso quien tiene todo el campo puede terminar teniendo un rincón favorito.');
    if(missing(h,'act1-flowers-grew')&&l.specialTulip) p.push('¿Hace cuánto no vuelves a mirar el tulipán que plantaste tú?');
    if(missing(h,'act1-home-light')&&g.nook) p.push('Un hogar se siente distinto cuando hay una lucecita encendida antes de que llegues.');
    if(missing(h,'act1-night-home')&&[g.nook,g.pillow2,g.toyBox,g.water,g.mariePlace,g.tuluzPlace,g.mewoPlace,g.flowers,g.lantern].filter(Boolean).length>=6) p.push('Tal vez ya construiste suficiente por hoy. Podrías quedarte en el refugio y ver cómo termina una noche normal.');
    if(missing(h,'act1-look-grown')&&g.night) p.push('Cuando ves un lugar todos los días es difícil notar cuánto cambió. A veces hay que mirarlo como si fuera la primera vez.');
    if(missing(h,'act1-here-we-live')&&h.size>=70) p.push('El Claro ya tiene muchas cosas. Quizá lo que falta no sea construir algo más, sino darte cuenta de qué se convirtió.');

    // Si no hay nada disponible o todo está completo
    if(!p.length){
      if(h.size>=79) p.push('Por ahora el pequeño mundo no parece pedir nada. Tal vez solo quiera que vuelvas de vez en cuando ♡');
      else p.push('No todo aparece por hacer algo específico. Cambia de clima, visita el Claro, camina por el campo y vuelve otro día.');
    }
    return p;
  }

  function install(){
    const panel=document.getElementById('basket2Panel'); if(!panel||document.getElementById('basket2Hints')) return !!panel;
    const tabs=document.getElementById('basket2CategoryTabs'); if(!tabs) return false;
    const box=document.createElement('section'); box.id='basket2Hints'; box.innerHTML=`
      <button id="basket2HintsToggle" type="button" aria-expanded="false">
        <span>?</span><div><strong>PISTAS DEL PEQUEÑO MUNDO</strong><small>una ayudita sin decirte exactamente qué hacer</small></div><b>+</b>
      </button>
      <div id="basket2HintsBody" aria-hidden="true">
        <div class="basket2GuideMark">✦</div>
        <p id="basket2HintText"></p>
        <button id="basket2NextHint" type="button">otra pista</button>
      </div>`;
    panel.insertBefore(box,tabs);
    const toggle=document.getElementById('basket2HintsToggle'), body=document.getElementById('basket2HintsBody');
    toggle.addEventListener('click',()=>{const open=box.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));body.setAttribute('aria-hidden',String(!open));if(open)showHint(true);});
    document.getElementById('basket2NextHint').addEventListener('click',()=>showHint(false));
    return true;
  }

  function showHint(reset){
    const p=pool(); if(reset||JSON.stringify(p)!==JSON.stringify(lastPool)){hintIndex=0;lastPool=p;}
    const text=document.getElementById('basket2HintText'); if(!text)return; text.classList.remove('show');void text.offsetWidth;text.textContent=p[hintIndex%p.length];text.classList.add('show');hintIndex=(hintIndex+1)%p.length;
  }

  const boot=setInterval(()=>{if(install()){clearInterval(boot);}},250);
  window.addEventListener('paradox-letter-collected',()=>setTimeout(()=>{if(document.getElementById('basket2Hints')?.classList.contains('open'))showHint(true);},100));
})();
