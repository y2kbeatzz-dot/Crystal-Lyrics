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

  // Native ZIP if hosted as a complete distribution, or an equally complete
  // ZIP reconstructed from static text chunks in limited GitHub deployments.
  const button = $('downloadBtn');
  const feedback = $('downloadFeedback');
  const note = $('downloadNote');
  const zipUrl = 'downloads/CrystalLyrics-v1.4.zip';
  const parts = ['downloads/part-01.b64', 'downloads/part-02.b64', 'downloads/part-03.b64', 'downloads/part-04.b64', 'downloads/part-05.b64', 'downloads/part-06.b64', 'downloads/part-07.b64', 'downloads/part-08.b64'];
  const setFeedback = text => { if (feedback) feedback.textContent = text; };
  function saveFile(blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'CrystalLyrics-v1.4.zip';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function downloadExtension() {
    if (!button) return;
    button.disabled = true;
    const label = button.innerHTML;
    button.textContent = 'Preparing your download…';
    try {
      const direct = await fetch(zipUrl, {method: 'HEAD'}).catch(() => null);
      if (direct?.ok) {
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error('Download file temporarily unavailable');
        saveFile(await response.blob());
      } else {
        // Parts hold the complete ZIP as base64 text; no external server needed.
        let b64 = '';
        for (let i = 0; i < parts.length; i++) {
          setFeedback(`Preparing the release package… ${Math.round((i + 1) / parts.length * 100)}%`);
          const response = await fetch(parts[i]);
          if (!response.ok) throw new Error(`Release part ${i+1} is missing`);
          b64 += (await response.text()).trim();
        }
        const decoded = atob(b64);
        const data = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) data[i] = decoded.charCodeAt(i);
        if (data[0] !== 80 || data[1] !== 75) throw new Error('Package format is invalid');
        saveFile(new Blob([data], {type: 'application/zip'}));
      }
      setFeedback('Your CrystalLyrics download is ready. Extract the ZIP to start.');
    } catch (error) {
      console.error('CrystalLyrics download:', error);
      setFeedback('The download is temporarily unavailable. View the GitHub repository for the source.');
    } finally {
      button.disabled = false;
      button.innerHTML = label;
    }
  }
  button?.addEventListener('click', downloadExtension);
  if (note) note.textContent = 'Desktop Chrome / Edge 116+ · Free and open source · v1.4.0';
})();
