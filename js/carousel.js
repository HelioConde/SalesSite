/**
 * Carrossel de banners original do SalesSite, restaurado com interação acessível.
 * Autoplay somente enquanto o visitante não interage e não pede movimento reduzido.
 */
export function setupBannerCarousel(root) {
  if (!root) return () => {};
  const slides = Array.from(root.querySelectorAll('[data-banner-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-banner-dot]'));
  const next = root.querySelector('[data-banner-next]');
  const previous = root.querySelector('[data-banner-prev]');
  const toggle = root.querySelector('[data-banner-play]');
  const live = root.querySelector('[data-banner-status]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = reduced.matches;
  let hovered = false;
  let focused = false;
  let timer = null;
  let touchStart = null;

  if (slides.length < 2 || slides.length !== dots.length) return () => {};

  const wrap = value => (value + slides.length) % slides.length;
  const show = (nextIndex, announce = true) => {
    index = wrap(nextIndex);
    root.dataset.activeSlide = String(index + 1);
    slides.forEach((slide, i) => {
      const active = i === index;
      const position = i === wrap(index - 1) ? 'previous' : i === wrap(index + 1) ? 'next' : 'other';
      slide.classList.toggle('is-active', active);
      slide.dataset.position = active ? 'active' : position;
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      dot.setAttribute('aria-label', 'Mostrar banner ' + (i + 1) + ' de ' + slides.length);
    });
    if (announce) live.textContent = 'Banner ' + (index + 1) + ' de ' + slides.length;
  };

  const stop = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  const resume = () => {
    stop();
    if (!paused && !hovered && !focused && !reduced.matches && !document.hidden) {
      timer = window.setInterval(() => show(index + 1, false), 6500);
    }
  };
  const setPaused = value => {
    paused = value;
    toggle.textContent = paused ? '▶ Retomar rotação' : 'Ⅱ Pausar rotação';
    toggle.setAttribute('aria-label', paused ? 'Retomar rotação do carrossel' : 'Pausar rotação do carrossel');
    toggle.setAttribute('aria-pressed', String(paused));
    resume();
  };

  const onNext = () => { show(index + 1); resume(); };
  const onPrevious = () => { show(index - 1); resume(); };
  const onDot = event => {
    show(dots.indexOf(event.currentTarget));
    resume();
  };
  const onToggle = () => setPaused(!paused);
  const onEnter = () => { hovered = true; stop(); };
  const onLeave = () => { hovered = false; resume(); };
  const onFocusIn = () => { focused = true; stop(); };
  const onFocusOut = event => {
    if (!root.contains(event.relatedTarget)) { focused = false; resume(); }
  };
  const onKey = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (event.target.matches('input, textarea, select')) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') onPrevious();
      else onNext();
    }
  };
  const onPointerDown = event => {
    if (event.pointerType === 'mouse' || event.target.closest('button, a')) return;
    touchStart = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = event => {
    if (!touchStart) return;
    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) onNext();
      else onPrevious();
    }
  };
  const onReduceChange = () => {
    if (reduced.matches) setPaused(true);
    else resume();
  };
  const onVisibility = () => resume();

  next.addEventListener('click', onNext);
  previous.addEventListener('click', onPrevious);
  dots.forEach(dot => dot.addEventListener('click', onDot));
  toggle.addEventListener('click', onToggle);
  root.addEventListener('mouseenter', onEnter);
  root.addEventListener('mouseleave', onLeave);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('keydown', onKey);
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', () => { touchStart = null; });
  reduced.addEventListener('change', onReduceChange);
  document.addEventListener('visibilitychange', onVisibility);
  show(0, false);
  setPaused(reduced.matches);
  return () => {
    stop();
    next.removeEventListener('click', onNext);
    previous.removeEventListener('click', onPrevious);
    dots.forEach(dot => dot.removeEventListener('click', onDot));
    toggle.removeEventListener('click', onToggle);
    root.removeEventListener('mouseenter', onEnter);
    root.removeEventListener('mouseleave', onLeave);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('keydown', onKey);
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointerup', onPointerUp);
    reduced.removeEventListener('change', onReduceChange);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
