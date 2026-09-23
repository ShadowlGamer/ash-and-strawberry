(function () {
  const I18N = {
    en: {
      contents: "contents",
      characters: "characters",
      gallery: "gallery",
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

  const el = {
    page:           document.getElementById('page'),
    chapterLabel:   document.getElementById('chapter-label'),
    counter:        document.getElementById('counter'),
    prev:           document.getElementById('prev'),
    next:           document.getElementById('next'),
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
    langBtns:       document.querySelectorAll('.lang-btn')
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
    renderGallery(); // refresh names in the gallery when language changes
  }

  function renderText(text) {
    return text.split(/\n{2,}/).map(par => {
      const re = /\[\[(\/|[a-z\-]+)\]\]/g;
      let out = '';
      let last = 0;
      let cls = null;
      let m;
      while ((m = re.exec(par)) !== null) {
        const before = par.slice(last, m.index);
        if (before) out += cls ? `<span class="${cls}">${before}</span>` : before;
        if (m[1] === '/') cls = null;
        else              cls = 'c-' + m[1];
        last = m.index + m[0].length;
      }
      const rest = par.slice(last);
      if (rest) out += cls ? `<span class="${cls}">${rest}</span>` : rest;
      return `<p>${out}</p>`;
    }).join('');
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
      // 1st try: same chapter id AND same page number inside it
      let fi = flat.findIndex(f => f.ch.id === prevItem.ch.id && f.pi === prevItem.pi);
      // 2nd try: same chapter id, first page
      if (fi < 0) fi = flat.findIndex(f => f.ch.id === prevItem.ch.id);
      // 3rd try: first page
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
  }

  // ---------- song pill ----------
  function renderSong(chapterId) {
    el.songRow.innerHTML = '';
    const s = (window.SONGS || {})[chapterId];
    if (!s || !s.title) return;

    const pill = document.createElement('a');
    pill.className = 'song-pill';
    pill.href = s.url || '#';
    pill.target = '_blank';
    pill.rel = 'noopener noreferrer';
    pill.innerHTML =
      `<span class="song-note">♪</span>` +
      `<span>${s.title}</span>` +
      `<span class="song-label">· ${I18N[lang].aSong}</span>`;

    if (!s.url) {
      pill.style.pointerEvents = 'none';
      pill.style.opacity = '0.5';
    }
    el.songRow.appendChild(pill);
  }

  function go(delta) {
    const n = index + delta;
    if (n < 0 || n >= flat.length) return;
    index = n;
    render();
  }
  el.next.addEventListener('click', () => go(1));
  el.prev.addEventListener('click', () => go(-1));

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;

    // gallery navigation takes priority when gallery is open
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

  // ---------- toc ----------
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
          index = fi;
          render();
          el.toc.classList.remove('open');
          el.overlay.classList.remove('show');
        }
      });
      el.tocList.appendChild(b);
    });
  }

  // ---------- close helpers ----------
  function closeToc()      { el.toc.classList.remove('open'); if (!el.chars.classList.contains('open')) el.overlay.classList.remove('show'); }
  function closeChars()    { el.chars.classList.remove('open'); el.charsToggle.classList.remove('active'); }
  function closeSettings() { el.settings.classList.remove('open'); }
  function closeGallery()  { el.galleryModal.classList.remove('open'); }

  function closeAll() {
    closeToc(); closeChars(); closeSettings(); closeGallery();
    el.overlay.classList.remove('show');
  }

  // ---------- toc toggle ----------
  el.tocToggle.addEventListener('click', () => {
    const wasOpen = el.toc.classList.contains('open');
    if (wasOpen) { closeToc(); return; }
    closeSettings(); closeChars();
    el.toc.classList.add('open');
    el.overlay.classList.add('show');
  });
  el.tocClose.addEventListener('click', closeToc);

  el.overlay.addEventListener('click', () => {
    closeToc();
    // NOTE: characters panel intentionally stays open until you click "characters" again
  });

  // ---------- characters dropdown ----------
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
    // toggle: if open -> close; if closed -> open (and close other panels)
    if (el.chars.classList.contains('open')) {
      closeChars();
      return;
    }
    closeSettings();
    closeToc();
    el.chars.classList.add('open');
    el.charsToggle.classList.add('active');
  });
  el.charsClose.addEventListener('click', closeChars);

  // ---------- gallery viewer ----------
  let galleryIndex = 0;

  function galleryStep(delta) {
    const arr = window.CHARACTERS || [];
    if (!arr.length) return;
    galleryIndex = (galleryIndex + delta + arr.length) % arr.length;
    renderGallery();
  }

  function renderGallery() {
    const arr = window.CHARACTERS || [];
    if (!arr.length) return;
    const c = arr[galleryIndex];

    // name + counter
    el.galleryName.textContent = c[lang] || c.en;
    el.galleryName.style.color = c.color;
    el.galleryCounter.textContent = (galleryIndex + 1) + ' / ' + arr.length;

    // frame background tinted with the character's color (visible if image fails)
    el.galleryFrame.style.background = c.color;

    // reset image / fallback
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

  // ---------- settings ----------
  el.settingsToggle.addEventListener('click', () => {
    const wasOpen = el.settings.classList.contains('open');
    closeSettings();
    closeToc();
    closeChars();
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

  // ---------- theme ----------
  const savedTheme = localStorage.getItem('ash-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  el.themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ash-theme', next);
    redrawAsh();
  });

  // ---------- language ----------
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

  // ---------- boot ----------
  applyI18n();
  rebuildFlat(false);
  buildToc();
  buildCharList();
  render();

  // ---------- falling ash ----------
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