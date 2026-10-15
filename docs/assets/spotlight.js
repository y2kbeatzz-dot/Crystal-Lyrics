/* CrystalLyrics cursor-following neon lettering. Respects reduced motion. */
(() => {
  'use strict';
  const stage = document.querySelector('[data-spotlight-stage]');
  if (!stage) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palettes = Array.from(stage.querySelectorAll('[data-spotlight-color]'));
  const motion = stage.querySelector('[data-spotlight-motion]');
  let x = .46, y = .48, auto = true, hovering = false, visible = true;
  let lastInput = 0, lastFrame = 0;
  function draw(nx, ny) {
    x = Math.max(.04, Math.min(.96, nx));
    y = Math.max(.05, Math.min(.95, ny));
    stage.style.setProperty('--spot-x', (x * 100).toFixed(2) + '%');
    stage.style.setProperty('--spot-y', (y * 100).toFixed(2) + '%');
  }
  function point(event) {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    draw((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    lastInput = performance.now();
  }
  stage.addEventListener('pointerenter', event => { hovering = event.pointerType === 'mouse'; point(event); });
  stage.addEventListener('pointermove', event => { hovering = event.pointerType === 'mouse'; point(event); }, { passive: true });
  stage.addEventListener('pointerdown', event => { hovering = false; point(event); }, { passive: true });
  stage.addEventListener('pointerleave', () => { hovering = false; lastInput = performance.now(); });
  stage.addEventListener('keydown', event => {
    const step = event.shiftKey ? .12 : .035;
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    if (dx || dy) { draw(x + dx, y + dy); lastInput = performance.now(); event.preventDefault(); }
  });
  for (const button of palettes) {
    button.addEventListener('click', () => {
      stage.dataset.color = button.dataset.spotlightColor;
      for (const other of palettes) other.setAttribute('aria-pressed', String(other === button));
    });
  }
  if (motion) {
    motion.addEventListener('click', () => {
      auto = !auto;
      motion.setAttribute('aria-pressed', String(auto));
      motion.textContent = auto ? 'Ⅱ Auto sweep' : '▶ Auto sweep';
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: .01 });
    observer.observe(stage);
  }
  function animate(t) {
    if (visible && auto && !hovering && !reduced.matches && t - lastInput > 1700 && !document.hidden) {
      if (t - lastFrame > 28) {
        draw(.5 + Math.sin(t / 2150) * .34, .49 + Math.cos(t / 2750) * .22);
        lastFrame = t;
      }
    }
    requestAnimationFrame(animate);
  }
  draw(x, y);
  requestAnimationFrame(animate);
})();
