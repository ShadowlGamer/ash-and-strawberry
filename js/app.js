(function () {
  const I18N = {
    en: {
      contents: "contents",
      characters: "characters",
      gallery: "gallery",
      support: "support",
      controlBtn: "control",
      previous: "← previous",
      next: "next →",
      fontSize: "font size",
      fallingAsh: "falling ash",
      volumeLabel: "volume",
      musicLabel: "music",
      aSong: "a song",
      playMusic: "play music",
      pauseMusic: "pause music",
      onboardingTitle: "customize your reading",
      onboardingSub: "choose a palette, a soundtrack, and a volume. you can change these any time.",
      chooseTheme: "palette",
      chooseMusic: "music",
      musicChapterT: "by chapter",
      musicChapterD: "a recommended song opens on each chapter that has one",
      musicAmbientT: "ambient",
      musicAmbientD: "one calm track plays softly the whole way through",
      begin: "begin",
      reopenCustomize: "customize again",
      theEnd: "the end",
      minShort: "min"
    },
    ru: {
      contents: "содержание",
      characters: "персонажи",
      gallery: "галерея",
      support: "поддержать",
      controlBtn: "управление",
      previous: "← назад",
      next: "вперед →",
      fontSize: "размер шрифта",
      fallingAsh: "падающий пепел",
      volumeLabel: "громкость",
      musicLabel: "музыка",
      aSong: "песня",
      playMusic: "включить музыку",
      pauseMusic: "пауза",
      onboardingTitle: "настрой чтение",
      onboardingSub: "выбери палитру, музыку и громкость. можешь менять их в любое время.",
      chooseTheme: "палитра",
      chooseMusic: "музыка",
      musicChapterT: "по главам",
      musicChapterD: "рекомендованная песня открывается в каждой главе, где она есть",
      musicAmbientT: "фоновая",
      musicAmbientD: "одна спокойная композиция тихо играет всё время",
      begin: "начать",
      reopenCustomize: "настроить заново",
      theEnd: "конец",
      minShort: "мин"
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
    "chapter9":   { en: "chapter 9",   ru: "глава 9" },
    "chapter10":  { en: "chapter 10",  ru: "глава 10" },
    "chapter11":  { en: "chapter 11",  ru: "глава 11" },
    "chapter12":  { en: "chapter 12",  ru: "глава 12" },
    "chapter13":  { en: "chapter 13",  ru: "глава 13" },
    "chapter14":  { en: "chapter 14",  ru: "глава 14" },
    "chapter15":  { en: "chapter 15",  ru: "глава 15" }
  };

  const VOLUMES = [
    { label: { en: "prologue",            ru: "пролог" },
      chapters: ["prologue"] },
    { label: { en: "volume i",            ru: "том i" },
      chapters: ["chapter1","chapter2","chapter3","chapter3-5","chapter4","chapter5","chapter6","chapter7","chapter8","chapter9"] },
    { label: { en: "volume ii — shadows", ru: "том ii — тени" },
      chapters: ["chapter10","chapter11","chapter12","chapter13","chapter14"] },
    { label: { en: "volume iii — ash",    ru: "том iii — пепел" },
      chapters: ["chapter15"] }
  ];

  const PALETTES = [
    { id: "ember", name: "ember", color: "#ff9a3c" },
    { id: "frost", name: "frost", color: "#66d4ff" },
    { id: "fern",  name: "fern",  color: "#7ddf8c" },
    { id: "rose",  name: "rose",  color: "#ff7eb6" },
    { id: "mono",  name: "mono",  color: "#dcdcdc" },
    { id: "cream", name: "cream", color: "#e0d5be" }
  ];

  const store = (function () {
    let mem = {};
    function canUseLS() {
      try { const k='__ash_test__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }
      catch (e) { return false; }
    }
    function canUseSS() {
      try { const k='__ash_test__'; sessionStorage.setItem(k,'1'); sessionStorage.removeItem(k); return true; }
      catch (e) { return false; }
    }
    const ls = canUseLS();
    const ss = canUseSS();
    return {
      get(k) {
        if (ls) { try { return localStorage.getItem(k); } catch(e){} }
        if (ss) { try { return sessionStorage.getItem(k); } catch(e){} }
        return mem[k] || null;
      },
      set(k, v) {
        mem[k] = String(v);
        if (ls) { try { localStorage.setItem(k, v); } catch(e){} }
        if (ss) { try { sessionStorage.setItem(k, v); } catch(e){} }
      }
    };
  })();

  const el = {
    page:           document.getElementById('page'),
    chapterLabel:   document.getElementById('chapter-label'),
    counter:        document.getElementById('counter'),
    prev:           document.getElementById('prev'),
    next:           document.getElementById('next'),
    arrowPrev:      document.getElementById('arrow-prev'),
    arrowNext:      document.getElementById('arrow-next'),
    edgeLeft:       document.getElementById('edge-left'),
    edgeRight:      document.getElementById('edge-right'),
    progress:       document.getElementById('progress-bar'),
    toc:            document.getElementById('toc'),
    tocList:        document.getElementById('toc-list'),
    tocToggle:      document.getElementById('toc-toggle'),
    tocClose:       document.getElementById('toc-close'),
    overlay:        document.getElementById('overlay'),
    settings:       document.getElementById('settings'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsCustomize: document.getElementById('settings-customize'),
    fontSize:       document.getElementById('font-size'),
    ashToggle:      document.getElementById('ash-toggle'),
    settingsVolume: document.getElementById('settings-volume'),
    ashCanvas:      document.getElementById('ash'),
    chars:          document.getElementById('chars'),
    charsList:      document.getElementById('chars-list'),
    charsToggle:    document.getElementById('chars-toggle'),
    charsClose:     document.getElementById('chars-close'),
    galleryModal:   document.getElementById('gallery-modal'),
    galleryImg:     document.getElementById('gallery-img'),
    galleryFallback:document.getElementById('gallery-fallback'),
    galleryFrame:   document.getElementById('gallery-frame'),
    galleryThumbs:  document.getElementById('gallery-thumbs'),
    galleryName:    document.getElementById('gallery-name'),
    galleryCounter: document.getElementById('gallery-counter'),
    galleryPrev:    document.getElementById('gallery-prev'),
    galleryNext:    document.getElementById('gallery-next'),
    galleryToggle:  document.getElementById('gallery-toggle'),
    galleryClose:   document.getElementById('gallery-close'),
    songRow:        document.getElementById('song-row'),
    langBtns:       document.querySelectorAll('.lang-btn'),
    bgAudio:        document.getElementById('bg-audio'),
    ambientAudio:   document.getElementById('ambient-audio'),
    customizeToggle:document.getElementById('customize-toggle'),
    onboarding:     document.getElementById('onboarding'),
    paletteGrid:    document.getElementById('palette-grid'),
    onboardBegin:   document.getElementById('onboard-begin'),
    onboardVolume:  document.getElementById('onboard-volume'),
    volumeReadout:  document.getElementById('volume-readout'),
    musicOpts:      document.querySelectorAll('.music-opt'),
    modeBtns:       document.querySelectorAll('.mode-btn'),
    musicPlayPause: document.getElementById('music-playpause'),
    musicPlayIcon:  document.getElementById('music-playpause-icon'),
    musicPlayLabel: document.getElementById('music-playpause-label')
  };

  let lang = store.get('ash-lang') || 'en';
  let currentPalette = store.get('ash-palette') || 'ember';
  let musicMode = store.get('ash-music') || null;
  let currentVolume = parseInt(store.get('ash-volume') || '60', 10) / 100;

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(n => {
      const k = n.dataset.i18n;
      if (I18N[lang][k]) n.textContent = I18N[lang][k];
    });
    el.langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.lang = lang;
    updateMusicButton();
    renderGallery();
  }

  function setPalette(id) {
    currentPalette = id;
    document.documentElement.setAttribute('data-theme', id);
    store.set('ash-palette', id);
    document.querySelectorAll('.palette-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.palette === id);
    });
    redrawAsh();
  }

  function buildPaletteGrid() {
    el.paletteGrid.innerHTML = '';
    PALETTES.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'palette-opt';
      b.dataset.palette = p.id;
      b.innerHTML =
        `<span class="palette-dot" style="background:${p.color};color:${p.color}"></span>` +
        `<span class="palette-name">${p.name}</span>`;
      if (p.id === currentPalette) b.classList.add('active');
      b.addEventListener('click', () => setPalette(p.id));
      el.paletteGrid.appendChild(b);
    });
  }

  function setVolume(v0to100) {
    const v = Math.max(0, Math.min(100, v0to100)) / 100;
    currentVolume = v;
    el.bgAudio.volume = v;
    el.ambientAudio.volume = v;
    store.set('ash-volume', Math.round(v * 100));
    if (el.onboardVolume) el.onboardVolume.value = Math.round(v * 100);
    if (el.settingsVolume) el.settingsVolume.value = Math.round(v * 100);
    if (el.volumeReadout) el.volumeReadout.textContent = Math.round(v * 100);
  }

  function setMusicMode(mode) {
    musicMode = mode;
    store.set('ash-music', mode);
    el.musicOpts.forEach(b => b.classList.toggle('active', b.dataset.music === mode));
    el.modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    if (mode === 'ambient') {
      stopChapterSong();
      tryStartAmbient();
    } else {
      stopAmbient();
    }
    const chId = flat[index] ? flat[index].ch.id : null;
    renderSong(chId);
    updateMusicButton();
  }

  function tryStartAmbient() {
    if (musicMode !== 'ambient') return;
    el.ambientAudio.volume = currentVolume;
    if (!el.ambientAudio.src) el.ambientAudio.src = 'audio/ambient.mp3';
    el.ambientAudio.play().catch(() => {});
    updateMusicButton();
  }

  function stopAmbient() {
    el.ambientAudio.pause();
    updateMusicButton();
  }

  function stopChapterSong() {
    el.bgAudio.pause();
    currentSongId = null;
    document.querySelectorAll('.song-pill').forEach(p => p.classList.remove('playing'));
  }

  function isMusicPlaying() {
    if (musicMode === 'ambient') return !el.ambientAudio.paused;
    return !el.bgAudio.paused;
  }

  function updateMusicButton() {
    if (!el.musicPlayPause) return;
    const playing = isMusicPlaying();
    el.musicPlayPause.classList.toggle('playing', playing);
    el.musicPlayIcon.textContent = playing ? '❚❚' : '▶';
    el.musicPlayLabel.textContent = playing ? I18N[lang].pauseMusic : I18N[lang].playMusic;
  }

  el.musicPlayPause.addEventListener('click', () => {
    if (musicMode === 'ambient') {
      if (el.ambientAudio.paused) tryStartAmbient();
      else stopAmbient();
    } else {
      if (!currentSongId) {
        const s = (window.SONGS || {})[flat[index] && flat[index].ch.id];
        if (s && s.title && s.url) toggleSong(flat[index].ch.id, s);
      } else {
        if (el.bgAudio.paused) el.bgAudio.play().catch(() => {});
        else                   el.bgAudio.pause();
      }
      updatePillStates();
    }
    updateMusicButton();
  });

  function openOnboarding() {
    el.onboarding.classList.add('open');
    el.onboarding.setAttribute('aria-hidden', 'false');
    if (el.onboardVolume) el.onboardVolume.value = Math.round(currentVolume * 100);
    if (el.volumeReadout) el.volumeReadout.textContent = Math.round(currentVolume * 100);
    el.musicOpts.forEach(b => b.classList.toggle('active', b.dataset.music === musicMode));
    document.querySelectorAll('.palette-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.palette === currentPalette);
    });
  }
  function closeOnboarding() {
    el.onboarding.classList.remove('open');
    el.onboarding.setAttribute('aria-hidden', 'true');
  }

  el.onboardBegin.addEventListener('click', () => {
    if (!musicMode) setMusicMode('chapter');
    closeOnboarding();
    if (musicMode === 'ambient') tryStartAmbient();
  });

  el.onboardVolume.addEventListener('input', e => setVolume(parseInt(e.target.value, 10)));
  el.musicOpts.forEach(b => b.addEventListener('click', () => setMusicMode(b.dataset.music)));
  el.customizeToggle.addEventListener('click', () => { closeAll(); openOnboarding(); });
  el.settingsCustomize.addEventListener('click', () => { closeAll(); openOnboarding(); });

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

  function countWords(text) {
    const stripped = text.replace(/\[\[[^\]]+\]\]/g, ' ');
    return stripped.trim().split(/\s+/).filter(Boolean).length;
  }

  // sum every page of the chapter, not just the current page
  function readingTimeOfChapter(ch) {
    let total = 0;
    ch.pages.forEach(p => { total += countWords(p); });
    return Math.max(1, Math.round(total / 220));
  }

  // wraps every word inside `root` in a span with a staggered animation delay
  function applyWordReveal(root) {
    let wordIndex = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim()) textNodes.push(node);
    }
    textNodes.forEach(textNode => {
      const parts = textNode.nodeValue.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach(part => {
        if (/\S/.test(part)) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          // cap total reveal at ~2.6s no matter how many words
          span.style.animationDelay = (wordIndex * 18) + 'ms';
          wordIndex++;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  let flat = [];
  let index = 0;
  let isAnimating = false;

  function storySet() {
    return (lang === 'ru' ? window.STORY_RU : window.STORY_EN) || [];
  }

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
      index = 0;
    }
  }

  function isLastPageOfChapter() {
    if (!flat.length) return false;
    const item = flat[index];
    return item.pi === item.ch.pages.length - 1;
  }

  function isLastPageOfStory() {
    return index === flat.length - 1;
  }

  function nextChapterLabel() {
    const item = flat[index];
    if (!item) return null;
    const next = flat.find((f, i) => i > index && f.ch.id !== item.ch.id);
    if (!next) return null;
    const lbl = SHORT_LABELS[next.ch.id];
    return lbl ? lbl[lang] : next.ch.title;
  }

  function render(direction) {
    if (!flat.length) {
      el.page.innerHTML = '<p>loading…</p>';
      el.chapterLabel.textContent = '';
      el.songRow.innerHTML = '';
      return;
    }
    const item = flat[index];
    const ch = item.ch;

    const lbl = SHORT_LABELS[ch.id];
    const chName = lbl ? lbl[lang] : ch.title;
    const rMin = readingTimeOfChapter(ch);
    el.chapterLabel.innerHTML =
      `<span>${chName}</span><span class="divider">·</span><span>${rMin} ${I18N[lang].minShort}</span>`;

    let html = '';
    if (item.pi === 0 && ch.title) {
      html += `<h1 class="chapter-title">${ch.title}</h1>`;
    }
    html += renderText(item.text);
    el.page.innerHTML = html;

    // word-by-word reveal
    applyWordReveal(el.page);

    el.counter.textContent  = (index + 1) + ' / ' + flat.length;
    el.progress.style.width = ((index + 1) / flat.length * 100) + '%';

    el.prev.disabled = index === 0;

    const lastOfChapter = isLastPageOfChapter();
    const lastOfStory   = isLastPageOfStory();
    el.next.disabled = lastOfStory;
    el.next.classList.toggle('chapter-next', lastOfChapter && !lastOfStory);
    if (lastOfStory) {
      el.next.textContent = I18N[lang].theEnd;
    } else if (lastOfChapter) {
      const nxt = nextChapterLabel();
      el.next.textContent = nxt ? ('begin ' + nxt + ' →') : I18N[lang].next;
    } else {
      el.next.textContent = I18N[lang].next;
    }

    el.arrowPrev.disabled = index === 0;
    el.arrowNext.disabled = index === flat.length - 1;
    el.edgeLeft.classList.toggle('disabled', index === 0);
    el.edgeRight.classList.toggle('disabled', index === flat.length - 1);

    el.page.classList.remove(
      'fade-in','slide-out-left','slide-out-right','slide-in-right','slide-in-left'
    );
    void el.page.offsetWidth;
    if (direction === 'next') el.page.classList.add('slide-in-right');
    else if (direction === 'prev') el.page.classList.add('slide-in-left');
    else el.page.classList.add('fade-in');

    renderSong(ch.id);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.toc-item').forEach(n => {
      n.classList.toggle('active', parseInt(n.dataset.ci, 10) === item.ci);
    });
  }

  let currentSongId = null;

  function renderSong(chapterId) {
    el.songRow.innerHTML = '';
    if (musicMode !== 'chapter') return;
    if (!chapterId) return;
    const s = (window.SONGS || {})[chapterId];
    if (!s || !s.title) return;

    const pill = document.createElement('button');
    pill.className = 'song-pill';
    if (currentSongId === chapterId && !el.bgAudio.paused) pill.classList.add('playing');
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
      updateMusicButton();
      return;
    }
    currentSongId = chapterId;
    el.bgAudio.src = s.url;
    el.bgAudio.currentTime = 0;
    el.bgAudio.volume = currentVolume;
    el.bgAudio.play().catch(() => {});
    updatePillStates();
    updateMusicButton();
  }

  function updatePillStates() {
    document.querySelectorAll('.song-pill').forEach(p => p.classList.remove('playing'));
    if (currentSongId && !el.bgAudio.paused) {
      const activePill = el.songRow.querySelector('.song-pill');
      if (activePill) activePill.classList.add('playing');
    }
  }

  el.bgAudio.addEventListener('play',  () => { updatePillStates(); updateMusicButton(); });
  el.bgAudio.addEventListener('pause', () => { updatePillStates(); updateMusicButton(); });
  el.bgAudio.addEventListener('ended', () => { updatePillStates(); updateMusicButton(); });
  el.ambientAudio.addEventListener('play',  updateMusicButton);
  el.ambientAudio.addEventListener('pause', updateMusicButton);

  function go(delta) {
    if (isAnimating) return;
    const n = index + delta;
    if (n < 0 || n >= flat.length) return;
    const dir = delta > 0 ? 'next' : 'prev';

    isAnimating = true;
    el.page.classList.remove('slide-in-right','slide-in-left','fade-in');
    el.page.classList.add(dir === 'next' ? 'slide-out-left' : 'slide-out-right');

    setTimeout(() => {
      index = n;
      el.page.classList.remove('slide-out-left', 'slide-out-right');
      render(dir);
      isAnimating = false;
    }, 180);
  }

  el.next.addEventListener('click', () => go(1));
  el.prev.addEventListener('click', () => go(-1));
  el.edgeRight.addEventListener('click', () => go(1));
  el.edgeLeft.addEventListener('click', () => go(-1));

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (el.onboarding.classList.contains('open')) {
      if (e.key === 'Escape') closeOnboarding();
      return;
    }
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

  let swipeStartX = 0, swipeStartY = 0, swipeStartTime = 0;
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.target;
    if (t.closest('input, textarea, button, a, .toc, .chars, .settings, .gallery-modal, .onboarding')) return;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swipeStartTime = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', e => {
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

  function buildToc() {
    el.tocList.innerHTML = '';
    const story = storySet();
    VOLUMES.forEach(vol => {
      const chapters = vol.chapters.map(id => story.find(c => c.id === id)).filter(Boolean);
      if (!chapters.length) return;
      const h = document.createElement('div');
      h.className = 'toc-volume';
      h.textContent = vol.label[lang];
      el.tocList.appendChild(h);
      chapters.forEach(ch => {
        const ci = story.indexOf(ch);
        const b = document.createElement('button');
        b.className = 'toc-item';
        const lbl = SHORT_LABELS[ch.id];
        b.textContent = lbl ? lbl[lang] : ch.title;
        b.dataset.ci = ci;
        b.addEventListener('click', () => {
          const fi = flat.findIndex(f => f.ci === ci);
          if (fi >= 0) { index = fi; render(); closeAll(); }
        });
        el.tocList.appendChild(b);
      });
    });
  }

  function closeAll() {
    el.toc.classList.remove('open');
    el.chars.classList.remove('open');
    el.settings.classList.remove('open');
    el.galleryModal.classList.remove('open');
    el.overlay.classList.remove('show');
  }

  el.tocToggle.addEventListener('click', () => {
    const wasOpen = el.toc.classList.contains('open');
    closeAll();
    if (!wasOpen) { el.toc.classList.add('open'); el.overlay.classList.add('show'); }
  });
  el.tocClose.addEventListener('click', closeAll);
  el.overlay.addEventListener('click', closeAll);

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
    const wasOpen = el.chars.classList.contains('open');
    closeAll();
    if (!wasOpen) el.chars.classList.add('open');
  });
  el.charsClose.addEventListener('click', closeAll);

  let galleryIndex = 0;
  function galleryStep(delta) {
    const arr = window.CHARACTERS || [];
    if (!arr.length) return;
    galleryIndex = (galleryIndex + delta + arr.length) % arr.length;
    renderGallery();
  }

  function buildGalleryThumbs() {
    if (!el.galleryThumbs) return;
    el.galleryThumbs.innerHTML = '';
    (window.CHARACTERS || []).forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gallery-thumb';
      b.title = c[lang] || c.en;
      b.dataset.idx = i;
      b.style.background = c.color;

      const img = document.createElement('img');
      img.src = `images/characters/${c.id}.png`;
      img.alt = c[lang] || c.en;
      img.onerror = () => {
        img.remove();
        const fb = document.createElement('span');
        fb.textContent = (c[lang] || c.en).charAt(0);
        b.appendChild(fb);
      };
      b.appendChild(img);

      b.addEventListener('click', () => {
        galleryIndex = i;
        renderGallery();
      });
      el.galleryThumbs.appendChild(b);
    });
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

    if (el.galleryThumbs) {
      el.galleryThumbs.querySelectorAll('.gallery-thumb').forEach((b, i) => {
        b.classList.toggle('active', i === galleryIndex);
      });
    }
  }

  el.galleryToggle.addEventListener('click', () => {
    galleryIndex = 0;
    renderGallery();
    closeAll();
    el.galleryModal.classList.add('open');
  });
  el.galleryClose.addEventListener('click', closeAll);
  el.galleryPrev.addEventListener('click', () => galleryStep(-1));
  el.galleryNext.addEventListener('click', () => galleryStep(1));
  el.galleryModal.addEventListener('click', e => {
    if (e.target === el.galleryModal) closeAll();
  });

  el.settingsToggle.addEventListener('click', () => {
    const wasOpen = el.settings.classList.contains('open');
    closeAll();
    if (!wasOpen) el.settings.classList.add('open');
  });

  el.modeBtns.forEach(b => b.addEventListener('click', () => setMusicMode(b.dataset.mode)));

  el.fontSize.addEventListener('input', e => {
    document.documentElement.style.setProperty('--fs', e.target.value + 'px');
    store.set('ash-fs', e.target.value);
  });
  const savedFs = store.get('ash-fs');
  if (savedFs) {
    el.fontSize.value = savedFs;
    document.documentElement.style.setProperty('--fs', savedFs + 'px');
  }

  el.settingsVolume.addEventListener('input', e => setVolume(parseInt(e.target.value, 10)));

  el.ashToggle.addEventListener('change', e => {
    el.ashCanvas.style.display = e.target.checked ? 'block' : 'none';
    store.set('ash-on', e.target.checked ? '1' : '0');
  });
  if (store.get('ash-on') === '0') {
    el.ashToggle.checked = false;
    el.ashCanvas.style.display = 'none';
  }

  el.langBtns.forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang === lang) return;
      lang = b.dataset.lang;
      store.set('ash-lang', lang);
      applyI18n();
      rebuildFlat(true);
      buildToc();
      buildCharList();
      buildGalleryThumbs();
      render();
      if (el.onboarding.classList.contains('open')) openOnboarding();
    });
  });

  document.documentElement.setAttribute('data-theme', currentPalette);
  setVolume(currentVolume * 100);
  applyI18n();
  rebuildFlat(false);
  buildToc();
  buildCharList();
  buildPaletteGrid();
  buildGalleryThumbs();
  render();

  if (musicMode) {
    el.modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === musicMode));
  }

  openOnboarding();
  if (musicMode === 'ambient') {
    const kick = () => { tryStartAmbient(); };
    ['click', 'touchstart', 'keydown'].forEach(evt =>
      document.addEventListener(evt, kick, { once: true, passive: true })
    );
  }
  updateMusicButton();

  const ctx = el.ashCanvas.getContext('2d');
  let W, H, particles = [];
  function resize() {
    W = el.ashCanvas.width  = window.innerWidth;
    H = el.ashCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function redrawAsh() {
    const cream = currentPalette === 'cream';
    particles.forEach(p => {
      p.warmColor = cream ? 'rgba(160,110,50,'  + p.o + ')' : 'rgba(255,170,90,' + p.o + ')';
      p.coolColor = cream ? 'rgba(120,90,60,'   + p.o + ')' : 'rgba(200,180,160,' + p.o + ')';
    });
  }

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      s: Math.random() * 0.35 + 0.08,
      d: Math.random() * Math.PI * 2,
      o: Math.random() * 0.35 + 0.08,
      warm: Math.random() > 0.55,
      warmColor: '', coolColor: ''
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