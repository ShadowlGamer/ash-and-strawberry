(function () {
  const I18N = {
    en: {
      contents: "contents",
      characters: "characters",
      gallery: "gallery",
      support: "support",
      previous: "← previous",
      next: "next →",
      fontSize: "font size",
      fallingAsh: "falling ash",
      aSong: "a song"
    },
    ru: {
      contents: "содержание",
      characters: "персонажи",
      gallery: "галерея",
      support: "поддержать",
      previous: "← назад",
      next: "вперед →",
      fontSize: "размер шрифта",
      fallingAsh: "падающий пепел",
      aSong: "песня"
    }
  };

  const SHORT_LABELS = {
    "prologue":   { en: "prologue",    ru: "пролог" },
    "chapter1":   { en: "chapter 1",   ru: "глава 1" },
    "chapter2":   { en: "chapter 2",   ru: "глава 2" },
    "chapter3":   { en: "chapter 3",   ru: "глава 3" },
    "chapter3-5": { en: "chapter 3.5", ru: "глава 3.5" },
    "chapter4":   { en: "chapter 4",   ru: "глава 4" },
    "chapter5":   { en: "chapter 5",   ru: "глава 5" },
    "chapter6":   { en: "chapter 6",   ru: "глава 6" },
    "chapter7":   { en: "chapter 7",   ru: "глава 7" },
    "chapter8":   { en: "chapter 8",   ru: "глава 8" },
    "chapter9":   { en: "chapter 9",   ru: "глава 9" }
  };

  const DIALOGUE_CONTINUES = new Set([
    'i','we','me','us','my','our','mine','ours',
    "i'm","i've","i'll","i'd",
    'you','your','yours',
    'and','but','or','so','yet','for','nor',
    'please','yes','no','yeah','nope','okay','ok','well',
    'how','what','where','when','why','who','which',
    'if','that','this','these','those',
    'я','мы','меня','нас','мой','моя','моё','мои','наш','наша','наше','наши',
    'и','но','или','да','нет','пожалуйста','хорошо','ладно','ну','ага',
    'как','что','где','когда','почему','зачем','кто','который',
    'если','это','этот','эта','эти',
  ]);

  function findColorEnd(text) {
    let start = 0;
    while (true) {
      const commaIdx = text.indexOf(',', start);
      if (commaIdx < 0) return text.length;
      const after = text.slice(commaIdx + 1).replace(/^\s+/, '');
      const m = after.match(/^([a-zA-Zа-яА-ЯёЁ']+)/);
      const nextWord = m ? m[1].toLowerCase() : '';
      if (DIALOGUE_CONTINUES.has(nextWord)) {
        start = commaIdx + 1;
        continue;
      }
      return commaIdx + 1;
    }
  }

  function renderColoredSection(text, cls, manualClose) {
    if (manualClose) {
      return `<span class="${cls}">${text}</span>`;
    }
    const end = findColorEnd(text);
    if (end >= text.length) {
      return `<span class="${cls}">${text}</span>`;
    }
    return `<span class="${cls}">${text.slice(0, end)}</span>${text.slice(end)}`;
  }

  function renderText(text) {
    return text.split(/\n{2,}/).map(par => {
      const re = /\[\[(\/|[a-z\-]+)\]\]/g;
      const matches = [];
      let m;
      while ((m = re.exec(par)) !== null) {
        matches.push({ index: m.index, end: m.index + m[0].length, tag: m[1] });
      }
      let out = '';
      let pos = 0;
      let currentCls = null;
      matches.forEach(match => {
        const before = par.slice(pos, match.index);
        if (before) {
          if (currentCls) {
            const manualClose = match.tag === '/';
            out += renderColoredSection(before, currentCls, manualClose);
          } else {
            out += before;
          }
        }
        currentCls = match.tag === '/' ? null : 'c-' + match.tag;
        pos = match.end;
      });
      const rest = par.slice(pos);
      if (rest) {
        out += currentCls ? renderColoredSection(rest, currentCls, false) : rest;
      }
      return `<p>${out}</p>`;
    }).join('');
  }

  const el = {
    page:           document.getElementById('page'),
    chapterLabel:   document.getElementById('chapter-label'),
    counter:        document.getElementById('counter'),
    prev:           document.getElementById('prev'),
    next:           document.getElementById('next'),
    arrowPrev:      document.getElementById('arrow-prev'),
    arrowNext:      document.getElementById('arrow-next'),
    progress:       document.getElementById('progress-bar'),
    toc:            document.getElementById('toc'),
    tocList:        document.getElementById('toc-list'),
    tocToggle:      document.getElementById('toc-toggle'),
    tocClose:       document.getElementById('toc-close'),
    overlay:        document.getElementById('overlay'),
    settings:       document.getElementById('settings'),
    settingsToggle: document.getElementById('settings-toggle'),
    fontSize:       document.getElementById('font-size'),
    ashToggle:      document.getElementById('ash-toggle'),
    ashCanvas:      document.getElementById('ash'),
    chars:          document.getElementById('chars'),
    charsList:      document.getElementById('chars-list'),
    charsToggle:    document.getElementById('chars-toggle'),
    charsClose:     document.getElementById('chars-close'),
    galleryModal:   document.getElementById('gallery-modal'),
    galleryImg:     document.getElementById('gallery-img'),
    galleryFallback:document.getElementById('gallery-fallback'),
    galleryFrame:   document.getElementById('gallery-frame'),
    galleryName:    document.getElementById('gallery-name'),
    galleryCounter: document.getElementById('gallery-counter'),
    galleryPrev:    document.getElementById('gallery-prev'),
    galleryNext:    document.getElementById('gallery-next'),
    galleryToggle:  document.getElementById('gallery-toggle'),
    galleryClose:   document.getElementById('gallery-close'),
    themeToggle:    document.getElementById('theme-toggle'),
    songRow:        document.getElementById('song-row'),
    langBtns:       document.querySelectorAll('.lang-btn'),
    bgAudio:        document.getElementById('bg-audio')
  };

  let lang = localStorage.getItem('ash-lang') || 'en';

  function storySet() {
    return (lang === 'ru' ? window.STORY_RU : window.STORY_EN) || [];
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(n => {
      const k = n.dataset.i18n;
      if (I18N[lang][k]) n.textContent = I18N[lang][k];
    });
    el.langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = lang;
    renderGallery();
  }

  let flat = [];
  let index = 0;

  function rebuildFlat(keepPosition) {
    const prevItem = flat[index];
    flat = [];
    storySet().forEach((ch, ci) => {
      ch.pages.forEach((pg, pi) => flat.push({ ci, pi, ch, text: pg }));
    });
    if (keepPosition && prevItem) {
      let fi = flat.findIndex(f => f.ch.id === prevItem.ch.id && f.pi === prevItem.pi);
      if (fi < 0) fi = flat.findIndex(f => f.ch.id === prevItem.ch.id);
      index = fi >= 0 ? fi : 0;
    } else {
      const saved = parseInt(localStorage.getItem('ash-pos-' + lang) || '0', 10);
      index = (!isNaN(saved) && saved >= 0 && saved < flat.length) ? saved : 0;
    }
  }

  function render() {
    if (!flat.length) {
      el.page.innerHTML = '<p>loading…</p>';
      el.chapterLabel.textContent = '';
      el.songRow.innerHTML = '';
      return;
    }
    const item = flat[index];
    const ch = item.ch;

    const lbl = SHORT_LABELS[ch.id];
    el.chapterLabel.textContent = lbl ? lbl[lang] : ch.title;

    let html = '';
    if (item.pi === 0 && ch.title) {
      html += `<h1 class="chapter-title">${ch.title}</h1>`;
    }
    html += renderText(item.text);
    el.page.innerHTML = html;

    el.counter.textContent  = (index + 1) + ' / ' + flat.length;
    el.progress.style.width = ((index + 1) / flat.length * 100) + '%';

    el.prev.disabled = index === 0;
    el.next.disabled = index === flat.length - 1;

    el.page.classList.remove('fade-in');
    void el.page.offsetWidth;
    el.page.classList.add('fade-in');

    localStorage.setItem('ash-pos-' + lang, index);

    renderSong(ch.id);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.toc-item').forEach((n, i) => {
      n.classList.toggle('active', i === item.ci);
    });

    syncArrows();
  }

  let currentSongId = null;

  function renderSong(chapterId) {
    el.songRow.innerHTML = '';
    const s = (window.SONGS || {})[chapterId];
    if (!s || !s.title) return;

    const pill = document.createElement('button');
    pill.className = 'song-pill';
    if (currentSongId === chapterId && !el.bgAudio.paused) {
      pill.classList.add('playing');
    }
    pill.innerHTML =
      `<span class="song-note">♪</span>` +
      `<span>${s.title}</span>` +
      `<span class="song-label">· ${I18N[lang].aSong}</span>`;
    pill.addEventListener('click', () => toggleSong(chapterId, s));
    el.songRow.appendChild(pill);
  }

  function toggleSong(chapterId, s) {
    if (!s || !s.url) return;
    if (currentSongId === chapterId) {
      if (el.bgAudio.paused) el.bgAudio.play().catch(() => {});
      else                   el.bgAudio.pause();
      updatePillStates();
      return;
    }
    currentSongId = chapterId;
    el.bgAudio.src = s.url;
    el.bgAudio.currentTime = 0;
    el.bgAudio.play().catch(() => {});
    updatePillStates();
  }

  function updatePillStates() {
    document.querySelectorAll('.song-pill').forEach(p => p.classList.remove('playing'));
    if (currentSongId && !el.bgAudio.paused) {
      const activePill = el.songRow.querySelector('.song-pill');
      if (activePill) activePill.classList.add('playing');
    }
  }

  el.bgAudio.addEventListener('play',  updatePillStates);
  el.bgAudio.addEventListener('pause', updatePillStates);
  el.bgAudio.addEventListener('ended', updatePillStates);

  function go(delta) {
    const n = index + delta;
    if (n < 0 || n >= flat.length) return;
    index = n;
    render();
  }

  // bottom pager
  el.next.addEventListener('click', () => go(1));
  el.prev.addEventListener('click', () => go(-1));

  // side arrows
  el.arrowNext.addEventListener('click', () => go(1));
  el.arrowPrev.addEventListener('click', () => go(-1));

  // keep arrow disabled state in sync with pager
  function syncArrows() {
    el.arrowPrev.disabled = index === 0;
    el.arrowNext.disabled = index === flat.length - 1;
  }

  // ---------- swipe to change pages (mobile) ----------
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeStartTime = 0;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.target;
    if (t.closest('input, textarea, button, a, .toc, .chars, .settings, .gallery-modal, .chars-modal')) return;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swipeStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    const dt = Date.now() - swipeStartTime;

    if (dt > 600) return;
    if (Math.abs(dx) < 60) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx < 0) go(1);
    else        go(-1);
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (el.galleryModal.classList.contains('open')) {
      if (e.key === 'ArrowRight') { galleryStep(1); return; }
      if (e.key === 'ArrowLeft')  { galleryStep(-1); return; }
      if (e.key === 'Escape')     { closeAll(); return; }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ') go(1);
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'Escape') closeAll();
  });

  function buildToc() {
    el.tocList.innerHTML = '';
    storySet().forEach((ch, i) => {
      const b = document.createElement('button');
      b.className = 'toc-item';
      const lbl = SHORT_LABELS[ch.id];
      b.textContent = lbl ? lbl[lang] : ch.title;
      b.addEventListener('click', () => {
        const fi = flat.findIndex(f => f.ci === i);
        if (fi >= 0) {
          index = fi; render();
          el.toc.classList.remove('open');
          el.overlay.classList.remove('show');
        }
      });
      el.tocList.appendChild(b);
    });
  }

  function closeToc()      { el.toc.classList.remove('open'); if (!el.chars.classList.contains('open')) el.overlay.classList.remove('show'); }
  function closeChars()    { el.chars.classList.remove('open'); el.charsToggle.classList.remove('active'); }
  function closeSettings() { el.settings.classList.remove('open'); }
  function closeGallery()  { el.galleryModal.classList.remove('open'); }
  function closeAll()      { closeToc(); closeChars(); closeSettings(); closeGallery(); el.overlay.classList.remove('show'); }

  el.tocToggle.addEventListener('click', () => {
    const wasOpen = el.toc.classList.contains('open');
    if (wasOpen) { closeToc(); return; }
    closeSettings(); closeChars();
    el.toc.classList.add('open');
    el.overlay.classList.add('show');
  });
  el.tocClose.addEventListener('click', closeToc);
  el.overlay.addEventListener('click', closeToc);

  function buildCharList() {
    el.charsList.innerHTML = '';
    (window.CHARACTERS || []).forEach(c => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'char-dot';
      dot.style.background = c.color;
      dot.style.color = c.color;
      const name = document.createElement('span');
      name.style.color = c.color;
      name.textContent = c[lang] || c.en;
      li.appendChild(dot);
      li.appendChild(name);
      el.charsList.appendChild(li);
    });
  }

  el.charsToggle.addEventListener('click', () => {
    if (el.chars.classList.contains('open')) { closeChars(); return; }
    closeSettings(); closeToc();
    el.chars.classList.add('open');
    el.charsToggle.classList.add('active');
  });
  el.charsClose.addEventListener('click', closeChars);

  let galleryIndex = 0;

  function galleryStep(delta) {
    const arr = window.CHARACTERS || [];
    if (!arr.length) return;
    galleryIndex = (galleryIndex + delta + arr.length) % arr.length;
    renderGallery();
  }

  function renderGallery() {
    const arr = window.CHARACTERS || [];
    if (!arr.length || !el.galleryImg) return;
    const c = arr[galleryIndex];

    el.galleryName.textContent = c[lang] || c.en;
    el.galleryName.style.color = c.color;
    el.galleryCounter.textContent = (galleryIndex + 1) + ' / ' + arr.length;

    el.galleryFrame.style.background = c.color;

    el.galleryFallback.classList.remove('show');
    el.galleryFallback.style.background = c.color;
    el.galleryImg.style.display = '';
    el.galleryImg.onerror = () => {
      el.galleryImg.style.display = 'none';
      el.galleryFallback.textContent = (c[lang] || c.en).charAt(0);
      el.galleryFallback.classList.add('show');
    };
    el.galleryImg.onload = () => {
      el.galleryImg.style.display = '';
      el.galleryFallback.classList.remove('show');
    };
    el.galleryImg.src = `images/characters/${c.id}.png`;
    el.galleryImg.alt = c[lang] || c.en;
  }

  el.galleryToggle.addEventListener('click', () => {
    galleryIndex = 0;
    renderGallery();
    el.galleryModal.classList.add('open');
  });
  el.galleryClose.addEventListener('click', closeGallery);
  el.galleryPrev.addEventListener('click', () => galleryStep(-1));
  el.galleryNext.addEventListener('click', () => galleryStep(1));
  el.galleryModal.addEventListener('click', e => {
    if (e.target === el.galleryModal) closeGallery();
  });

  el.settingsToggle.addEventListener('click', () => {
    const wasOpen = el.settings.classList.contains('open');
    closeSettings(); closeToc(); closeChars();
    if (!wasOpen) el.settings.classList.add('open');
  });

  el.fontSize.addEventListener('input', e => {
    document.documentElement.style.setProperty('--fs', e.target.value + 'px');
    localStorage.setItem('ash-fs', e.target.value);
  });
  const savedFs = localStorage.getItem('ash-fs');
  if (savedFs) {
    el.fontSize.value = savedFs;
    document.documentElement.style.setProperty('--fs', savedFs + 'px');
  }

  el.ashToggle.addEventListener('change', e => {
    el.ashCanvas.style.display = e.target.checked ? 'block' : 'none';
    localStorage.setItem('ash-on', e.target.checked ? '1' : '0');
  });
  if (localStorage.getItem('ash-on') === '0') {
    el.ashToggle.checked = false;
    el.ashCanvas.style.display = 'none';
  }

  const savedTheme = localStorage.getItem('ash-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  el.themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ash-theme', next);
    redrawAsh();
  });

  el.langBtns.forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang === lang) return;
      lang = b.dataset.lang;
      localStorage.setItem('ash-lang', lang);
      applyI18n();
      rebuildFlat(true);
      buildToc();
      buildCharList();
      render();
    });
  });

  applyI18n();
  rebuildFlat(false);
  buildToc();
  buildCharList();
  render();

  const ctx = el.ashCanvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = el.ashCanvas.width  = window.innerWidth;
    H = el.ashCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function redrawAsh() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    particles.forEach(p => {
      p.warmColor = light ? 'rgba(160,110,50,'  + p.o + ')' : 'rgba(255,170,90,' + p.o + ')';
      p.coolColor = light ? 'rgba(120,90,60,'   + p.o + ')' : 'rgba(200,180,160,' + p.o + ')';
    });
  }

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      s: Math.random() * 0.35 + 0.08,
      d: Math.random() * Math.PI * 2,
      o: Math.random() * 0.35 + 0.08,
      warm: Math.random() > 0.55,
      warmColor: '',
      coolColor: ''
    });
  }
  redrawAsh();

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.y += p.s;
      p.x += Math.sin(p.d) * 0.25;
      p.d += 0.01;
      if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.warm ? p.warmColor : p.coolColor;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();