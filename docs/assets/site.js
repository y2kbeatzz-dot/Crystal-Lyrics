/* CrystalLyrics website: small, dependency-free, silent visual preview. */
(() => {
  'use strict';
  const demo = document.getElementById('demoPlayer');
  if (!demo) return;
  const $ = id => document.getElementById(id);
  const lineEl = $('demoLine');
  const pastEl = $('demoPast');
  const nextEl = $('demoNext');
  const playBtn = $('demoPlay');
  const resetBtn = $('demoReset');
  const seek = $('demoSeek');
  const timeLabel = $('demoTimestamp');
  const glow = $('glowToggle');
  const lift = $('liftToggle');
  const glass = $('glassToggle');
  const font = $('fontSelect');
  const lyricBox = demo.querySelector('.demo-lyrics');
  const lyricLines = [
    'We make a little magic tonight',
    'Dancing where the stars turn gold',
    'Every little color comes alive',
    'This is a moment we can hold',
    'We make a little magic tonight'
  ];
  const lengths = [5.8, 6.5, 5.6, 6.3, 7.8];
  const duration = lengths.reduce((a, b) => a + b, 0);
  const boundaries = [0];
  for (const len of lengths) boundaries.push(boundaries[boundaries.length - 1] + len);
  seek.max = String(Math.round(duration * 10));
  let playing = false;
  let current = 0;
  let lastStamp = null;
  let lastLine = -1;
  let lastWord = -1;
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const formatTime = v => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
  function activePosition(t) {
    const i = Math.min(lengths.length - 1, boundaries.findIndex((end, index) => index > 0 && t < end) - 1);
    const index = i >= 0 ? i : lengths.length - 1;
    const progress = Math.min(0.999, Math.max(0, (t - boundaries[index]) / lengths[index]));
    const words = lyricLines[index].split(' ');
    return { index, word: Math.min(words.length - 1, Math.floor(progress * words.length)), words };
  }
  function paint() {
    const { index, word, words } = activePosition(current);
    if (index !== lastLine) {
      lineEl.replaceChildren(...words.map(wordText => {
        const span = document.createElement('span');
        span.textContent = wordText;
        return span;
      }));
      pastEl.textContent = lyricLines[(index + lyricLines.length - 1) % lyricLines.length];
      nextEl.textContent = lyricLines[(index + 1) % lyricLines.length];
      lastLine = index;
      lastWord = -1;
    }
    if (word !== lastWord) {
      Array.from(lineEl.children).forEach((el, i) => {
        el.classList.toggle('done', i < word);
        el.classList.toggle('current', i === word);
      });
      lastWord = word;
    }
    lineEl.classList.toggle('glowing', glow.checked);
    lineEl.classList.toggle('raised', lift.checked && !prefersReduce.matches);
    lyricBox.classList.toggle('glassy', glass.checked);
    timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    seek.value = String(Math.round(current * 10));
    seek.style.background = `linear-gradient(to right, #d9a6ff ${current / duration * 100}%, #4b3d5c ${current / duration * 100}%)`;
  }
  function setPlay(value) {
    playing = value;
    demo.classList.toggle('is-playing', playing);
    playBtn.textContent = playing ? 'Ⅱ   Pause preview' : '▶   Play preview';
    playBtn.setAttribute('aria-label', playing ? 'Pause visual demo' : 'Play visual demo');
    if (playing && current >= duration) current = 0;
    lastStamp = null;
  }
  function animate(timestamp) {
    if (playing && lastStamp !== null) {
      current += Math.min(0.11, (timestamp - lastStamp) / 1000);
      if (current >= duration) { current = duration; setPlay(false); }
      paint();
    }
    lastStamp = timestamp;
    requestAnimationFrame(animate);
  }
  playBtn.addEventListener('click', () => setPlay(!playing));
  resetBtn.addEventListener('click', () => { current = 0; lastLine = -1; paint(); setPlay(true); });
  seek.addEventListener('input', () => { current = Math.min(duration, Number(seek.value) / 10); lastLine = -1; paint(); });
  [glow, lift, glass].forEach(x => x.addEventListener('change', paint));
  font.addEventListener('change', () => {
    const family = font.value === 'outfit' ? 'Outfit, sans-serif' : font.value === 'serif' ? 'Georgia, serif' : 'SpaceGrotesk, sans-serif';
    lineEl.style.fontFamily = family;
    pastEl.style.fontFamily = family;
    nextEl.style.fontFamily = family;
  });
  document.querySelectorAll('.color-pick').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.color-pick').forEach(other => {
        const active = other === button;
        other.classList.toggle('selected', active);
        other.setAttribute('aria-pressed', String(active));
      });
      demo.dataset.palette = button.dataset.color;
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlay(false); });
  paint();
  requestAnimationFrame(animate);

  // Hero is a separate, silent visual loop. All text is original demo copy.
  const heroWords = Array.from(document.querySelectorAll('#heroLyric span'));
  if (heroWords.length) {
    let heroFrame = 0;
    setInterval(() => {
      heroWords.forEach((el, index) => {
        el.classList.toggle('sung', index < heroFrame);
        el.classList.toggle('active', index === heroFrame);
      });
      heroFrame = (heroFrame + 1) % heroWords.length;
    }, prefersReduce.matches ? 7000 : 850);
    heroWords[0].classList.add('active');
  }

  // The portable site bundle includes the extension ZIP. For an incomplete
  // GitHub upload, fall back to the source repository rather than a 404.
  const button = $('downloadBtn');
  const downloadNote = $('downloadNote');
  const bundledZip = 'downloads/CrystalLyrics-v1.4.zip';
  fetch(bundledZip, { method: 'HEAD' }).then(response => {
    if (!response.ok || !button) return;
    button.href = bundledZip;
    button.removeAttribute('target');
    button.removeAttribute('rel');
    button.setAttribute('download', 'CrystalLyrics-v1.4.zip');
    if (downloadNote) downloadNote.textContent = 'ZIP download · Desktop Chrome / Edge 116+ · Extract before installing';
  }).catch(() => {});
})();