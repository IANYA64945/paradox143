/* =========================================================
   EVENTO ALEATORIO DE MEWO
   Flujo:
   aparece -> se escapa -> la atrapas -> la acaricias
   -> se despide -> deja una cartita -> se guarda en canasta
========================================================= */

(() => {

  const STORAGE_KEY = 'paradox143_letters_v1';
  const MEWO_ID = 'mewo';
  const MEWO_MESSAGE = 'eres y seras la mejoll mama gata de todas!!';

  /* =====================================================
     MÚSICA ESPECIAL DE MEWO
     Sube el archivo con este nombre exacto:
     cats_in_cold.mp3
  ===================================================== */

  const MEWO_MUSIC_SRC = 'cats_in_cold.mp3';

  const fieldMusic = document.getElementById('bgMusic');

  let originalMusicState = null;
  let mewoMusicActive = false;
  let mewoMusicPending = false;
  let musicFadeTimer = 0;

  function fadeAudio(audio, target, duration = 650, done = null) {

    if (!audio) {
      if (done) done();
      return;
    }

    clearInterval(musicFadeTimer);

    const start = Number.isFinite(audio.volume) ? audio.volume : 0.35;
    const started = performance.now();

    musicFadeTimer = setInterval(() => {

      const t = Math.min(1, (performance.now() - started) / duration);
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));

      if (t >= 1) {
        clearInterval(musicFadeTimer);
        musicFadeTimer = 0;
        if (done) done();
      }

    }, 35);
  }

  function startMewoMusic() {

    if (!fieldMusic || mewoMusicActive) return;

    originalMusicState = {
      src: fieldMusic.getAttribute('src') || 'musica.mp3',
      time: Number.isFinite(fieldMusic.currentTime) ? fieldMusic.currentTime : 0,
      volume: Number.isFinite(fieldMusic.volume) ? fieldMusic.volume : .35,
      wasPlaying: !fieldMusic.paused
    };

    const switchTrack = () => {

      try {
        fieldMusic.pause();
        fieldMusic.setAttribute('src', MEWO_MUSIC_SRC);
        fieldMusic.load();
        fieldMusic.currentTime = 0;
        fieldMusic.volume = .02;

        const p = fieldMusic.play();

        if (p && p.then) {
          p.then(() => {
            mewoMusicActive = true;
            mewoMusicPending = false;
            fadeAudio(fieldMusic, .40, 750);
          }).catch(() => {
            /*
              Algunos celulares bloquean el cambio automático.
              Se vuelve a intentar cuando el usuario toque a Mewo.
            */
            mewoMusicPending = true;
          });
        }
        else {
          mewoMusicActive = true;
          mewoMusicPending = false;
          fadeAudio(fieldMusic, .40, 750);
        }
      }
      catch (_) {
        mewoMusicPending = true;
      }

    };

    if (!fieldMusic.paused) {
      fadeAudio(fieldMusic, 0, 520, switchTrack);
    }
    else {
      switchTrack();
    }
  }

  function retryMewoMusicFromGesture() {

    if (!mewoMusicPending || !fieldMusic) return;

    try {
      fieldMusic.setAttribute('src', MEWO_MUSIC_SRC);
      fieldMusic.load();
      fieldMusic.currentTime = 0;
      fieldMusic.volume = .05;

      fieldMusic.play().then(() => {
        mewoMusicActive = true;
        mewoMusicPending = false;
        fadeAudio(fieldMusic, .40, 650);
      }).catch(() => {});
    }
    catch (_) {}
  }

  function restoreFieldMusic() {

    if (!fieldMusic || !originalMusicState) return;

    const state = originalMusicState;

    const restore = () => {

      try {
        fieldMusic.pause();
        fieldMusic.setAttribute('src', state.src);
        fieldMusic.load();

        const setSavedTime = () => {
          try {
            fieldMusic.currentTime = state.time;
          }
          catch (_) {}
        };

        if (fieldMusic.readyState >= 1) {
          setSavedTime();
        }
        else {
          fieldMusic.addEventListener('loadedmetadata', setSavedTime, { once:true });
        }

        fieldMusic.volume = .02;

        if (state.wasPlaying) {
          const p = fieldMusic.play();

          if (p && p.then) {
            p.then(() => {
              fadeAudio(fieldMusic, state.volume, 750);
            }).catch(() => {
              fieldMusic.volume = state.volume;
            });
          }
          else {
            fadeAudio(fieldMusic, state.volume, 750);
          }
        }
        else {
          fieldMusic.volume = state.volume;
        }
      }
      catch (_) {}

      mewoMusicActive = false;
      mewoMusicPending = false;
      originalMusicState = null;
    };

    if (mewoMusicActive && !fieldMusic.paused) {
      fadeAudio(fieldMusic, 0, 600, restore);
    }
    else {
      restore();
    }
  }

  let eventStarted = false;
  let eventFinished = false;
  let catchCount = 0;
  let petCount = 0;
  let petting = false;
  let lastPetX = 0;
  let lastPetY = 0;
  let petDistance = 0;
  let catX = 50;
  let catY = 69;

  /* =====================================================
     DOM DEL EVENTO
  ===================================================== */

  const layer = document.createElement('div');
  layer.id = 'mewoLayer';

  const catBtn = document.createElement('button');
  catBtn.id = 'mewoCat';
  catBtn.type = 'button';
  catBtn.setAttribute('aria-label', 'Mewo');
  catBtn.innerHTML = '<img id="mewoImg" src="mewo.png" alt="Mewo">';

  const status = document.createElement('div');
  status.id = 'mewoStatus';

  const hearts = document.createElement('div');
  hearts.id = 'mewoHearts';

  const letter = document.createElement('button');
  letter.id = 'mewoLetter';
  letter.type = 'button';
  letter.setAttribute('aria-label', 'Carta de Mewo');
  letter.innerHTML = `
    <span class="mewoEnvelope"></span>
    <span class="mewoSeal">♡</span>
    <span class="mewoPaw">✦</span>
  `;

  layer.appendChild(catBtn);
  layer.appendChild(status);
  layer.appendChild(hearts);
  layer.appendChild(letter);
  document.body.appendChild(layer);

  const mewoImg = document.getElementById('mewoImg');

  /* =====================================================
     QUITAR FONDO BLANCO DE LA IMAGEN EN EL NAVEGADOR

     El archivo original se conserva intacto en GitHub.
  ===================================================== */

  function prepareMewoSprite() {

    const img = new Image();

    img.onload = () => {

      try {

        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;

        const g = c.getContext('2d', { willReadFrequently:true });
        g.drawImage(img, 0, 0);

        const data = g.getImageData(0, 0, c.width, c.height);
        const p = data.data;

        for (let i = 0; i < p.length; i += 4) {

          const r = p[i];
          const gg = p[i+1];
          const b = p[i+2];

          const light = (r + gg + b) / 3;

          if (light > 238) {
            p[i+3] = 0;
          }
          else if (light > 175) {
            p[i] = 0;
            p[i+1] = 0;
            p[i+2] = 0;
            p[i+3] = Math.max(0, Math.min(255, (238 - light) * 4));
          }
          else {
            p[i] = 0;
            p[i+1] = 0;
            p[i+2] = 0;
          }
        }

        g.putImageData(data, 0, 0);
        mewoImg.src = c.toDataURL('image/png');

      }
      catch (_) {
        /* Si el navegador no permite procesarla, usa la original. */
      }

    };

    img.src = 'mewo.png';
  }

  prepareMewoSprite();

  /* =====================================================
     UTILIDADES
  ===================================================== */

  function readSavedLetters() {

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }
    catch (_) {
      return [];
    }
  }

  function saveMewoLetter() {

    const arr = readSavedLetters();

    if (!arr.includes(MEWO_ID)) {
      arr.push(MEWO_ID);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      }
      catch (_) {}
    }

    syncBasketCount();
    injectMewoIntoBasket();
    pulseBasket();
  }

  function hasMewoLetter() {
    return readSavedLetters().includes(MEWO_ID);
  }

  function syncBasketCount() {

    const count = document.getElementById('basketCount');

    if (count) {
      count.textContent = String(new Set(readSavedLetters()).size);
    }
  }

  function pulseBasket() {

    const basket = document.getElementById('letterBasketBtn');

    if (!basket) return;

    basket.classList.remove('pulse');
    void basket.offsetWidth;
    basket.classList.add('pulse');
  }

  function showStatus(html, duration = 2300) {

    status.innerHTML = html;

    status.classList.remove('show');
    void status.offsetWidth;
    status.classList.add('show');

    clearTimeout(showStatus.timer);

    showStatus.timer = setTimeout(() => {
      status.classList.remove('show');
    }, duration);
  }

  function setCatPosition(x, y) {

    catX = Math.max(10, Math.min(90, x));
    catY = Math.max(56, Math.min(82, y));

    catBtn.style.left = `${catX}%`;
    catBtn.style.top = `${catY}%`;

    hearts.style.left = `${catX}%`;
    hearts.style.top = `${catY - 5}%`;
  }

  function randomPosition() {

    const portrait = window.innerHeight > window.innerWidth;

    return {
      x: 13 + Math.random() * 74,
      y: portrait
        ? 59 + Math.random() * 18
        : 61 + Math.random() * 16
    };
  }

  function moveMewo() {

    let next = randomPosition();

    /* Evita saltos demasiado pequeños. */
    if (Math.abs(next.x - catX) < 18) {
      next.x = next.x < 50
        ? Math.min(88, next.x + 27)
        : Math.max(12, next.x - 27);
    }

    catBtn.classList.remove('hop');
    void catBtn.offsetWidth;
    catBtn.classList.add('hop');

    setCatPosition(next.x, next.y);
  }

  /* =====================================================
     CORAZONES
  ===================================================== */

  function makeHeartBurst() {

    hearts.innerHTML = '';

    for (let i = 0; i < 7; i++) {

      const h = document.createElement('span');
      h.className = 'mewoHeart';
      h.textContent = '♡';

      h.style.left = `${8 + Math.random() * 82}%`;
      h.style.animationDelay = `${Math.random() * .35}s`;

      hearts.appendChild(h);
    }

    hearts.classList.remove('show');
    void hearts.offsetWidth;
    hearts.classList.add('show');

    setTimeout(() => {
      hearts.classList.remove('show');
    }, 1850);
  }

  /* =====================================================
     EMPEZAR EVENTO
  ===================================================== */

  function startMewoEvent() {

    if (eventStarted || eventFinished) return;

    /* Si el minijuego grande está abierto, espera. */
    if (
      typeof gameOverlay !== 'undefined' &&
      gameOverlay &&
      gameOverlay.classList.contains('show')
    ) {
      setTimeout(startMewoEvent, 5000);
      return;
    }

    eventStarted = true;
    catchCount = 0;
    petCount = 0;

    const p = randomPosition();
    setCatPosition(p.x, p.y);

    catBtn.classList.add('show');

    /*
      Cambia suavemente de la música normal a
      cats_in_cold.mp3 cuando aparece Mewo.
    */
    startMewoMusic();

    showStatus(
      '✦ Algo apareció entre los tulipanes... <strong>¡Es Mewo!</strong>',
      3000
    );
  }

  function scheduleRandomEvent() {

    /*
      Siempre ocurre una vez por visita,
      pero nunca sabes exactamente cuándo.
      Entre 10 y 25 segundos después de entrar al campo.
    */

    const delay =
      10000 +
      Math.random() * 15000;

    setTimeout(startMewoEvent, delay);
  }

  function waitForField() {

    if (!document.body.classList.contains('intro-active')) {
      scheduleRandomEvent();
      return;
    }

    const observer = new MutationObserver(() => {

      if (!document.body.classList.contains('intro-active')) {

        observer.disconnect();

        setTimeout(scheduleRandomEvent, 700);
      }
    });

    observer.observe(document.body, {
      attributes:true,
      attributeFilter:['class']
    });
  }

  waitForField();

  /* =====================================================
     ATRAPAR A MEWO
  ===================================================== */

  catBtn.addEventListener('click', e => {

    e.preventDefault();
    e.stopPropagation();

    if (!eventStarted || eventFinished) return;

    /*
      Si el navegador bloqueó el cambio automático de canción,
      este toque del usuario permite iniciarla.
    */
    retryMewoMusicFromGesture();

    /*
      FASE 1:
      hay que tocarla tres veces.
      En los dos primeros intentos se escapa.
    */

    if (!catBtn.classList.contains('caught')) {

      catchCount++;

      if (catchCount < 3) {

        showStatus(
          `¡Mewo se escapó! Atrápala otra vez ♡ &nbsp; ${catchCount}/3`,
          1700
        );

        moveMewo();
        return;
      }

      catBtn.classList.add('caught');

      showStatus(
        '♡ ¡La atrapaste! Ahora <strong>acaricia a Mewo</strong> deslizando el dedo sobre ella. <span id="mewoPetMeter">♡♡♡♡♡</span>',
        5000
      );

      return;
    }

    /*
      En fase de caricias, un toque suave también
      cuenta como una caricia para que sea fácil en celular.
    */

    addPet();
  });

  /* =====================================================
     ACARICIAR
  ===================================================== */

  function addPet() {

    if (
      !catBtn.classList.contains('caught') ||
      eventFinished
    ) {
      return;
    }

    petCount = Math.min(5, petCount + 1);

    catBtn.classList.remove('petPulse');
    void catBtn.offsetWidth;
    catBtn.classList.add('petPulse');

    const meter = document.getElementById('mewoPetMeter');

    if (meter) {
      meter.textContent =
        '♥'.repeat(petCount) +
        '♡'.repeat(5 - petCount);
    }

    if (petCount >= 5) {
      finishPetting();
    }
  }

  catBtn.addEventListener('pointerdown', e => {

    if (!catBtn.classList.contains('caught')) return;

    petting = true;
    lastPetX = e.clientX;
    lastPetY = e.clientY;
    petDistance = 0;

    try {
      catBtn.setPointerCapture(e.pointerId);
    }
    catch (_) {}
  });

  catBtn.addEventListener('pointermove', e => {

    if (!petting || !catBtn.classList.contains('caught')) return;

    const dx = e.clientX - lastPetX;
    const dy = e.clientY - lastPetY;
    const d = Math.hypot(dx, dy);

    petDistance += d;

    lastPetX = e.clientX;
    lastPetY = e.clientY;

    if (petDistance >= 28) {
      petDistance = 0;
      addPet();
    }
  });

  function stopPetting(e) {

    if (!petting) return;

    petting = false;

    try {
      if (catBtn.hasPointerCapture(e.pointerId)) {
        catBtn.releasePointerCapture(e.pointerId);
      }
    }
    catch (_) {}
  }

  catBtn.addEventListener('pointerup', stopPetting);
  catBtn.addEventListener('pointercancel', stopPetting);

  /* =====================================================
     DESPEDIDA
  ===================================================== */

  function finishPetting() {

    if (eventFinished) return;

    eventFinished = true;

    catBtn.classList.remove('caught', 'petPulse');
    catBtn.classList.add('loved');

    makeHeartBurst();

    showStatus(
      'prrrrr... ♡<br>Mewo parece muy feliz.',
      2200
    );

    setTimeout(() => {

      const letterX = catX;
      const letterY = Math.min(82, catY + 7);

      letter.style.left = `${letterX}%`;
      letter.style.top = `${letterY}%`;

      catBtn.classList.remove('loved');
      catBtn.classList.add('leaving');

      showStatus(
        'Mewo se va corriendo entre los tulipanes... pero dejó algo.',
        2800
      );

      setTimeout(() => {
        letter.classList.add('show');
      }, 1100);

      setTimeout(() => {
        catBtn.style.display = 'none';
      }, 2400);

    }, 1500);
  }

  /* =====================================================
     CARTA DE MEWO
  ===================================================== */

  function openMewoLetter() {

    const reader = document.getElementById('letterReader');
    const mark = document.getElementById('readerMark');
    const title = document.getElementById('readerTitle');
    const text = document.getElementById('readerText');
    const keep = document.getElementById('readerKeep');

    if (!reader || !mark || !title || !text) {
      alert(MEWO_MESSAGE);
      saveMewoLetter();
      return;
    }

    mark.textContent = '♡';
    title.textContent = 'Una cartita de Mewo';
    text.textContent = MEWO_MESSAGE;

    if (keep) {
      keep.style.display = 'none';
    }

    reader.classList.add('show');

    /*
      Al abrirla queda guardada.
    */
    saveMewoLetter();

    /*
      La escena especial de Mewo terminó.
      Volvemos suavemente a la canción normal del campo.
    */
    setTimeout(restoreFieldMusic, 900);
  }

  letter.addEventListener('click', () => {

    letter.classList.remove('show');
    letter.style.display = 'none';

    openMewoLetter();
  });

  /* =====================================================
     MOSTRAR MEWO EN LA CANASTA
  ===================================================== */

  function injectMewoIntoBasket() {

    if (!hasMewoLetter()) return;

    const list = document.getElementById('basketLetters');

    if (!list) return;

    if (
      list.querySelector(
        '.basketLetterItem[data-letter="mewo"]'
      )
    ) {
      syncBasketCount();
      return;
    }

    /*
      Si la canasta decía "vacía", quita ese mensaje.
    */
    const empty = list.querySelector('.basketEmpty');

    if (empty && readSavedLetters().length > 0) {
      empty.remove();
    }

    const item = document.createElement('button');

    item.className = 'basketLetterItem';
    item.dataset.letter = 'mewo';
    item.type = 'button';

    item.innerHTML = `
      <span class="basketLetterMark">♡</span>
      <span>
        <strong>Carta de Mewo</strong>
        <small>Toca para volver a leerla</small>
      </span>
    `;

    item.addEventListener('click', () => {

      const overlay = document.getElementById('basketOverlay');

      if (overlay) {
        overlay.classList.remove('show');
      }

      openMewoLetter();
    });

    list.appendChild(item);

    syncBasketCount();
  }

  /*
    letters.js reconstruye la lista cada vez que se abre.
    Por eso inyectamos Mewo justo después.
  */

  const basketBtn = document.getElementById('letterBasketBtn');

  if (basketBtn) {

    basketBtn.addEventListener('click', () => {

      setTimeout(() => {
        injectMewoIntoBasket();
        syncBasketCount();
      }, 0);
    });
  }

  /*
    Al cargar una visita donde la carta ya estaba guardada.
  */

  setTimeout(() => {
    syncBasketCount();
  }, 800);

})();
