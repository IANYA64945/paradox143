/* =========================================================
   PARCHE: LUNA + CANASTA DE CARTAS
   - 3 toques en la luna
   - brillo especial
   - mensaje secreto
   - caída de una cartita
   - canasta que guarda las cartas encontradas
========================================================= */

(() => {
  const STORAGE_KEY = 'paradox143_letters_v1';

  const LETTERS = {
    intro: {
      title: 'Primera carta',
      mark: '♡',
      text: '“Te amaré un día más por cada tulipán aquí plantado.”'
    },
    moon: {
      title: 'Carta de la luna',
      mark: '☾',
      text: 'Si llegaste hasta aquí y miraste la luna tres veces, encontraste un pedacito más de mí. Incluso cuando el campo duerme, sigo pensando en ti. ♡'
    },
    final: {
      title: 'Carta encontrada',
      mark: '✦',
      text: 'Y si algún día dudas de cuánto te quiero, vuelve a mirar este campo. Todavía quedan infinitos tulipanes por contar.'
    }
  };

  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_) {
      return new Set();
    }
  }

  function safeSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
    } catch (_) {}
  }

  const collected = safeLoad();

  /* =====================================================
     CREAR ELEMENTOS
  ===================================================== */

  const moonHotspot = document.createElement('button');
  moonHotspot.id = 'moonHotspot';
  moonHotspot.setAttribute('aria-label', 'Luna');
  moonHotspot.type = 'button';
  document.body.appendChild(moonHotspot);

  const moonWhisper = document.createElement('div');
  moonWhisper.id = 'moonWhisper';
  moonWhisper.innerHTML = '<span>☾</span><p>La luna también quería decirte algo...</p>';
  document.body.appendChild(moonWhisper);

  const moonLetterDrop = document.createElement('button');
  moonLetterDrop.id = 'moonLetterDrop';
  moonLetterDrop.type = 'button';
  moonLetterDrop.setAttribute('aria-label', 'Carta de la luna');
  moonLetterDrop.innerHTML = `
    <span class="moonMiniEnvelope">
      <span class="moonSeal">♡</span>
    </span>
    <span class="moonLetterSpark">✦</span>
  `;
  document.body.appendChild(moonLetterDrop);

  const basketBtn = document.createElement('button');
  basketBtn.id = 'letterBasketBtn';
  basketBtn.type = 'button';
  basketBtn.setAttribute('aria-label', 'Canasta de cartas');
  basketBtn.innerHTML = `
    <img class="basketPixelImage" src="basket.png" alt="" aria-hidden="true">
    <span id="basketCount">0</span>
  `;
  document.body.appendChild(basketBtn);

  const basketOverlay = document.createElement('div');
  basketOverlay.id = 'basketOverlay';
  basketOverlay.innerHTML = `
    <div id="basketPanel">
      <button id="basketClose" type="button" aria-label="Cerrar">×</button>
      <div class="basketTitle">CANASTA DE CARTAS</div>
      <div class="basketSubtitle">Aquí se guardan las cartas que encuentres ♡</div>
      <div id="basketLetters"></div>
    </div>
  `;
  document.body.appendChild(basketOverlay);

  const letterReader = document.createElement('div');
  letterReader.id = 'letterReader';
  letterReader.innerHTML = `
    <div class="readerPaper">
      <button id="readerClose" type="button" aria-label="Cerrar">×</button>
      <div id="readerMark">♡</div>
      <h2 id="readerTitle">Carta</h2>
      <p id="readerText"></p>
      <button id="readerKeep" type="button">Guardar en la canasta ♡</button>
    </div>
  `;
  document.body.appendChild(letterReader);

  const basketCount = document.getElementById('basketCount');
  const basketLetters = document.getElementById('basketLetters');
  const basketClose = document.getElementById('basketClose');
  const readerClose = document.getElementById('readerClose');
  const readerMark = document.getElementById('readerMark');
  const readerTitle = document.getElementById('readerTitle');
  const readerText = document.getElementById('readerText');
  const readerKeep = document.getElementById('readerKeep');

  let currentReaderId = null;
  let basketUnlocked = collected.has('intro');
  let moonClicks = 0;
  let moonResetTimer = 0;
  let moonTriggered = false;

  /* =====================================================
     CANASTA
  ===================================================== */

  function pulseBasket() {
    basketBtn.classList.remove('pulse');
    void basketBtn.offsetWidth;
    basketBtn.classList.add('pulse');
  }

  function updateBasket() {
    basketCount.textContent = String(collected.size);

    const order = ['intro', 'moon', 'final'];
    const html = order
      .filter(id => collected.has(id))
      .map(id => {
        const item = LETTERS[id];
        return `
          <button class="basketLetterItem" data-letter="${id}" type="button">
            <span class="basketLetterMark">${item.mark}</span>
            <span>
              <strong>${item.title}</strong>
              <small>Toca para volver a leerla</small>
            </span>
          </button>
        `;
      })
      .join('');

    basketLetters.innerHTML = html || `
      <div class="basketEmpty">
        Todavía no hay cartas guardadas.
      </div>
    `;

    basketLetters.querySelectorAll('.basketLetterItem').forEach(btn => {
      btn.addEventListener('click', () => {
        basketOverlay.classList.remove('show');
        openLetter(btn.dataset.letter, false);
      });
    });
  }

  function collectLetter(id, pulse = true) {
    if (!LETTERS[id]) return;

    const wasNew = !collected.has(id);
    collected.add(id);
    safeSave();
    updateBasket();

    if (id === 'intro') basketUnlocked = true;

    if (pulse && wasNew) pulseBasket();
  }

  function showBasketWhenFieldIsVisible() {
    if (!basketUnlocked) return;
    basketBtn.classList.add('visible');
  }

  basketBtn.addEventListener('click', () => {
    updateBasket();
    basketOverlay.classList.add('show');
  });

  basketClose.addEventListener('click', () => {
    basketOverlay.classList.remove('show');
  });

  basketOverlay.addEventListener('click', e => {
    if (e.target === basketOverlay) basketOverlay.classList.remove('show');
  });

  /* =====================================================
     LECTOR DE CARTAS
  ===================================================== */

  function openLetter(id, canCollect = true) {
    const item = LETTERS[id];
    if (!item) return;

    currentReaderId = id;
    readerMark.textContent = item.mark;
    readerTitle.textContent = item.title;
    readerText.textContent = item.text;

    if (canCollect && !collected.has(id)) {
      readerKeep.style.display = '';
      readerKeep.textContent = 'Guardar en la canasta ♡';
    } else {
      readerKeep.style.display = 'none';
    }

    letterReader.classList.add('show');
  }

  function closeReader() {
    letterReader.classList.remove('show');
    currentReaderId = null;
  }

  readerClose.addEventListener('click', closeReader);

  letterReader.addEventListener('click', e => {
    if (e.target === letterReader) closeReader();
  });

  readerKeep.addEventListener('click', () => {
    if (!currentReaderId) return;
    collectLetter(currentReaderId);
    readerKeep.textContent = 'Guardada ♡';
    setTimeout(() => {
      closeReader();
      showBasketWhenFieldIsVisible();
    }, 500);
  });

  /* =====================================================
     PRIMERA CARTA

     Al abrirla:
     - se desbloquea la canasta
     - la carta se guarda automáticamente
     - la canasta aparecerá cuando entremos al campo
  ===================================================== */

  if (typeof introEnvelope !== 'undefined' && introEnvelope) {
    introEnvelope.addEventListener('click', () => {
      collectLetter('intro', false);
      basketUnlocked = true;
    });
  }

  if (typeof introContinue !== 'undefined' && introContinue) {
    introContinue.addEventListener('click', () => {
      setTimeout(showBasketWhenFieldIsVisible, 900);
    });
  }

  /* Si ya estaba guardada en una visita anterior */
  if (basketUnlocked && !document.body.classList.contains('intro-active')) {
    showBasketWhenFieldIsVisible();
  }

  /* =====================================================
     POSICIÓN DE LA LUNA

     Usa exactamente la misma posición que field.js:
     vertical:   x 82%, y 10%
     horizontal: x 88%, y 13%
  ===================================================== */

  function moonGeometry() {
    const rect = app.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const portrait = h > w;

    const x = rect.left + (portrait ? w * .82 : w * .88);
    const y = rect.top + (portrait ? h * .10 : h * .13);
    const r = Math.max(15, Math.min(29, Math.min(w, h) * .055));

    return { x, y, r };
  }

  function updateMoonHotspot() {
    const { x, y, r } = moonGeometry();
    const size = Math.max(46, r * 2.35);

    moonHotspot.style.left = `${x}px`;
    moonHotspot.style.top = `${y}px`;
    moonHotspot.style.width = `${size}px`;
    moonHotspot.style.height = `${size}px`;
    moonHotspot.style.setProperty('--moonRadius', `${r}px`);
  }

  window.addEventListener('resize', updateMoonHotspot);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateMoonHotspot, 250);
  });
  document.addEventListener('fullscreenchange', () => {
    setTimeout(updateMoonHotspot, 120);
  });

  requestAnimationFrame(() => {
    updateMoonHotspot();
    setTimeout(updateMoonHotspot, 500);
  });

  /* =====================================================
     MENSAJE DE LA LUNA
  ===================================================== */

  function showMoonWhisper(text) {
    const { x, y, r } = moonGeometry();

    moonWhisper.querySelector('p').textContent = text;
    moonWhisper.style.left = `${Math.min(window.innerWidth - 135, Math.max(135, x))}px`;
    moonWhisper.style.top = `${y + r + 24}px`;

    moonWhisper.classList.remove('show');
    void moonWhisper.offsetWidth;
    moonWhisper.classList.add('show');

    setTimeout(() => {
      moonWhisper.classList.remove('show');
    }, 3300);
  }

  /* =====================================================
     SOLTAR CARTA DESDE LA LUNA
  ===================================================== */

  function releaseMoonLetter() {
    if (collected.has('moon')) {
      showMoonWhisper('Esta cartita ya está guardada en tu canasta ♡');
      pulseBasket();
      return;
    }

    const { x, y } = moonGeometry();

    const targetX = window.innerWidth * (window.innerHeight > window.innerWidth ? .57 : .68);
    const targetY = window.innerHeight * (window.innerHeight > window.innerWidth ? .42 : .48);

    moonLetterDrop.style.left = `${x}px`;
    moonLetterDrop.style.top = `${y}px`;
    moonLetterDrop.style.setProperty('--moonLetterDX', `${targetX - x}px`);
    moonLetterDrop.style.setProperty('--moonLetterDY', `${targetY - y}px`);

    moonLetterDrop.classList.remove('fall', 'ready');
    void moonLetterDrop.offsetWidth;
    moonLetterDrop.classList.add('fall');

    setTimeout(() => {
      moonLetterDrop.classList.add('ready');
    }, 1750);
  }

  moonLetterDrop.addEventListener('click', () => {
    if (!moonLetterDrop.classList.contains('ready')) return;

    moonLetterDrop.classList.remove('fall', 'ready');
    moonLetterDrop.style.display = 'none';

    openLetter('moon', true);

    setTimeout(() => {
      moonLetterDrop.style.display = '';
    }, 450);
  });

  /* =====================================================
     3 TOQUES EN LA LUNA
  ===================================================== */

  moonHotspot.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    if (document.body.classList.contains('intro-active')) return;
    if (gameOverlay && gameOverlay.classList.contains('show')) return;

    moonHotspot.classList.remove('tap');
    void moonHotspot.offsetWidth;
    moonHotspot.classList.add('tap');

    clearTimeout(moonResetTimer);
    moonClicks++;

    if (moonClicks < 3) {
      moonResetTimer = setTimeout(() => {
        moonClicks = 0;
      }, 2600);
      return;
    }

    moonClicks = 0;
    moonTriggered = true;

    moonHotspot.classList.add('awakened');
    showMoonWhisper(
      collected.has('moon')
        ? 'La luna recuerda que ya encontraste su carta ♡'
        : 'La luna también quería decirte algo...'
    );

    setTimeout(releaseMoonLetter, 1200);

    setTimeout(() => {
      moonHotspot.classList.remove('awakened');
      moonTriggered = false;
    }, 5200);
  });

  /* =====================================================
     GUARDAR LA CARTA FINAL DEL MINIJUEGO

     No modifica game.js.
     Observa cuando #finalLetter recibe la clase "show".
  ===================================================== */

  if (typeof finalLetter !== 'undefined' && finalLetter) {
    const observer = new MutationObserver(() => {
      if (finalLetter.classList.contains('show')) {
        collectLetter('final');
      }
    });

    observer.observe(finalLetter, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  updateBasket();
})();
