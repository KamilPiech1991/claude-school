import { gsap, ScrollTrigger, SplitText, finePointer } from './motion';

const root = document.documentElement;
const q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => gsap.utils.toArray<T>(scope.querySelectorAll(sel));

const mm = gsap.matchMedia();

mm.add(
  {
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 900px)',
    fine: '(hover: hover) and (pointer: fine)',
  },
  (ctx) => {
    const { motion, desktop, fine } = ctx.conditions as { motion: boolean; desktop: boolean; fine: boolean };

    if (!motion) {
      // Ograniczony ruch: wszystko widoczne od razu, bez animacji
      root.classList.remove('js-motion');
      return;
    }

    intro();
    chrome();
    ambient();
    scrollScenes(desktop);
    if (fine) pointer();

    root.classList.add('motion-ready');
  },
);

/* ------------------------------------------------------------------
   Wejście strony: nagłówek, słowa tytułu, karty w hero
   ------------------------------------------------------------------ */
function intro() {
  gsap.set(['[data-a="word"]', '[data-a="fade"]', '[data-a="card"]'], { visibility: 'visible' });
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.from('[data-header]', { yPercent: -100, duration: 0.8, ease: 'cs-out' })
    .from('[data-logo-mark]', { rotate: -180, scale: 0, duration: 0.9, ease: 'back.out(2)' }, '<0.1');

  if (q('[data-a="word"]').length) tl.from('[data-a="word"]', { yPercent: 110, rotate: 4, duration: 1, stagger: 0.05 }, '-=0.5');
  if (q('[data-a="fade"]').length) tl.from('[data-a="fade"]', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, '-=0.7');
  if (q('[data-a="card"]').length)
    tl.from('[data-a="card"]', { y: 80, autoAlpha: 0, rotate: (i: number) => [-3, 4, -2][i % 3], duration: 1.1, stagger: 0.14, ease: 'expo.out' }, '-=0.9');

  // Odręczna strzałka rysuje się po pojawieniu się podpisu
  if (q('[data-a="draw"]').length) tl.from('[data-a="draw"]', { drawSVG: '0%', duration: 0.7, stagger: 0.25, ease: 'power2.inOut' }, '-=0.4');

  // Pieczątka „4h / 8h” wpada z obrotem
  const stamp = document.querySelector('.stamp');
  if (stamp) tl.from(stamp, { scale: 0, rotate: -120, duration: 0.9, ease: 'back.out(1.8)' }, '-=0.8');

  // Licznik dnia w karcie „Najbliższy termin”
  q('.next [data-a="count"]').forEach((el) => {
    const to = Number(el.dataset.to);
    const o = { n: 0 };
    tl.to(o, { n: to, duration: 1, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.n))) }, '-=0.9');
  });
}

/* ------------------------------------------------------------------
   Pasek postępu i chowający się nagłówek
   ------------------------------------------------------------------ */
function chrome() {
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const header = document.querySelector('[data-header]');
  if (header) {
    const show = gsap.quickTo(header, 'yPercent', { duration: 0.35, ease: 'power3.out' });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => show(self.direction === 1 && self.scroll() > 240 ? -100 : 0),
    });
  }
}

/* ------------------------------------------------------------------
   Animacje w tle: unoszenie, puls, pisanie, marquee
   ------------------------------------------------------------------ */
function ambient() {
  q('[data-a="float"]').forEach((el, i) => gsap.to(el, { y: i % 2 ? 10 : -10, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 }));
  q('[data-a="pulse"]').forEach((el) => gsap.to(el, { scale: 1.8, autoAlpha: 0.3, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  q('[data-a="caret"]').forEach((el) => gsap.to(el, { autoAlpha: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' }));
  q('[data-a="spin"]').forEach((el) => gsap.to(el, { rotation: 360, transformOrigin: '50% 50%', duration: 16, ease: 'none', repeat: -1 }));
  q('[data-a="playpulse"]').forEach((el) => gsap.to(el, { scale: 1.12, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

  // Pisanie polecenia, potem odpowiedzi Claude – w pętli
  q('[data-a="typed"]').forEach((el) => {
    const box = el.closest('[data-a="float"]') ?? document;
    const replies = q('[data-a="reply"]', box);
    const full = el.dataset.text ?? '';
    const o = { n: 0 };
    el.textContent = '';
    gsap.set(replies, { autoAlpha: 0 });
    gsap
      .timeline({ delay: 1.6, repeat: -1, repeatDelay: 3 })
      .to(o, { n: full.length, duration: full.length / 28, ease: 'none', onUpdate: () => (el.textContent = full.slice(0, Math.round(o.n))) })
      .fromTo(replies, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.35 }, '+=0.4')
      .to(replies, { autoAlpha: 0, duration: 0.4 }, '+=3.5')
      .set(o, { n: 0, onComplete: () => void (el.textContent = '') });
  });

  // Okna bez pisania (kurs od zera, Cowork): odpowiedzi pojawiają się kolejno
  q('[data-a="float"]').forEach((box) => {
    if (box.querySelector('[data-a="typed"]')) return;
    const replies = q('[data-a="reply"]', box);
    if (replies.length) gsap.from(replies, { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.45, delay: 1.5, ease: 'power2.out' });
  });

  // Marquee logotypów przyspiesza i zmienia kierunek razem z przewijaniem
  q('[data-a="marquee"]').forEach((el) => {
    const loop = gsap.to(el, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
    let dir = 1;
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (self.direction !== dir) dir = self.direction;
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
        gsap.timeline({ overwrite: true }).to(loop, { timeScale: boost * dir, duration: 0.2 }).to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' });
      },
    });
  });

  // Odtwarzacz w sekcji darmowej lekcji: licznik czasu i pasek postępu
  q('[data-a="progressfill"]').forEach((fill) => {
    const timer = fill.closest('.video__bar')?.querySelector<HTMLElement>('[data-a="timer"]');
    const o = { t: 0 };
    const total = 45 * 60;
    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
    tl.fromTo(fill, { width: '0%' }, { width: '100%', duration: 9, ease: 'none' }).fromTo(
      o,
      { t: 0 },
      { t: total, duration: 9, ease: 'none', onUpdate: () => timer && (timer.textContent = fmt(o.t)) },
      0,
    );
    ScrollTrigger.create({ trigger: fill.closest('section'), start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
  });
}

/* ------------------------------------------------------------------
   Sceny sterowane przewijaniem
   ------------------------------------------------------------------ */
function scrollScenes(desktop: boolean) {
  const once = (trigger: Element, start = 'top 88%') => ({ trigger, start, once: true });

  q('[data-a="parallax"]').forEach((el) =>
    gsap.fromTo(el, { y: -30 }, { y: 30, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
  );
  q('[data-a="reveal"]').forEach((el) => gsap.from(el, { y: 56, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: once(el) }));
  q('[data-a="stagger"]').forEach((el) => gsap.from(el.children, { y: 36, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: once(el) }));
  q('[data-a="line"]').forEach((el) => gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'expo.out', scrollTrigger: once(el, 'top 90%') }));

  // Nagłówki sekcji: linie wysuwają się spod maski
  q('[data-a="split"]').forEach((el) => {
    SplitText.create(el, {
      type: 'words,lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, { yPercent: 110, rotate: 2, duration: 1, stagger: 0.09, ease: 'expo.out', scrollTrigger: once(el, 'top 86%') }),
    });
  });

  // Etykiety w stylu terminala „przewijają” znaki przed ustaleniem tekstu
  q('[data-a="scramble"]').forEach((el) => {
    const text = el.textContent ?? '';
    gsap.to(el, { duration: 1.1, scrambleText: { text, chars: 'upperCase', speed: 0.5, revealDelay: 0.2 }, scrollTrigger: once(el, 'top 92%') });
  });

  // Liczniki w pasku faktów
  q('.facts [data-a="count"]').forEach((el) => {
    const to = Number(el.dataset.to);
    const o = { n: 0 };
    gsap.to(o, { n: to, duration: 1.4, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.n))), scrollTrigger: once(el, 'top 95%') });
  });

  // Kartka z poprawkami: przekreślenie, dopiski, ocena
  q('[data-a="sheet"]').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: once(el, 'top 72%') })
      .from(el, { rotate: -4, y: 60, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .from(el.querySelector('.sheet__tape'), { scaleX: 0, transformOrigin: 'left center', duration: 0.35, ease: 'power2.out' }, '-=0.3')
      .from(el.querySelectorAll('[data-a="strike"]'), { scaleX: 0, transformOrigin: 'left center', duration: 0.45, ease: 'power2.inOut' })
      .from(el.querySelectorAll('[data-a="ink"]'), { autoAlpha: 0, x: -8, duration: 0.45, stagger: 0.3 })
      .from(el.querySelectorAll('[data-a="grade"]'), { scale: 2.6, autoAlpha: 0, rotate: -40, duration: 0.55, ease: 'back.out(2.2)' });
  });
  q('[data-a="draw-scroll"]').forEach((el) => gsap.from(el, { drawSVG: '0%', duration: 0.9, ease: 'power2.inOut', scrollTrigger: once(el, 'top 85%') }));

  // Napis przewijany w poprzek + obracające się gwiazdki
  q('[data-a="drift"]').forEach((el) => {
    gsap.fromTo(el, { xPercent: 2 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to(el.querySelectorAll('[data-a="star"]'), { rotate: 360, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });

  // Plan lekcji: „dzwonek” przesuwa się po godzinach, na desktopie sekcja jest przypięta
  q('[data-a="timetable"]').forEach((tt) => {
    const bell = tt.querySelector<HTMLElement>('[data-a="bell"]');
    const cells = q('[data-a="tt-cell"]', tt);
    const section = tt.closest<HTMLElement>('[data-a="timetable-section"]');
    if (!bell || !section) return;
    const mark = (p: number) => {
      const w = tt.offsetWidth;
      cells.forEach((c) => {
        const a = c.offsetLeft / w;
        const b = (c.offsetLeft + c.offsetWidth) / w;
        c.classList.toggle('is-now', p >= a && p < b);
      });
    };
    gsap.from(cells, { autoAlpha: 0, y: 30, duration: 0.7, stagger: 0.07, ease: 'power3.out', scrollTrigger: once(tt, 'top 90%') });
    gsap.fromTo(
      bell,
      { left: '0%' },
      {
        left: '100%',
        ease: 'none',
        scrollTrigger: desktop
          ? { trigger: section, start: 'top 12%', end: '+=900', pin: true, scrub: 0.6, onUpdate: (s) => mark(s.progress), onLeave: () => mark(2), onLeaveBack: () => mark(-1) }
          : { trigger: tt, start: 'top 80%', end: 'bottom 30%', scrub: 0.6, onUpdate: (s) => mark(s.progress) },
      },
    );
  });

  // Sekcja darmowej lekcji rozwija się z mniejszego prostokąta
  q('[data-a="lead"]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(10% 8% 10% 8% round 48px)', scale: 0.96 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.8 } },
    );
    gsap.from(el.querySelectorAll('.lead__copy > *'), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: once(el, 'top 70%') });
  });

  // Opinie: karty wjeżdżają z lekkim obrotem, cudzysłowy „wskakują”
  q('[data-a="quotes"]').forEach((el) => {
    const cards = q('.quote', el);
    gsap
      .timeline({ scrollTrigger: once(el, 'top 85%') })
      .from(cards, { y: 80, autoAlpha: 0, rotate: (i: number) => [-4, 2, 5][i % 3], duration: 1, stagger: 0.12, ease: 'expo.out' })
      .from(q('[data-a="qmark"]', el), { scale: 0, rotate: -40, duration: 0.6, stagger: 0.12, ease: 'back.out(3)' }, '-=0.7');
  });

  // Pieczątka „ZALICZONE” na stronie kursu
  q('[data-a="stampin"]').forEach((el) =>
    gsap.from(el, { scale: 2.4, autoAlpha: 0, rotate: -25, duration: 0.6, ease: 'back.out(2)', scrollTrigger: once(el, 'top 80%') }),
  );

  // Moduły programu kursu
  q('[data-mods] > li:not([hidden])').forEach((li) =>
    gsap.from(li, { x: -24, autoAlpha: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: once(li, 'top 92%') }),
  );

  // Duży napis w stopce: litery wynurzają się po kolei
  q('[data-a="wordmark"]').forEach((el) => {
    SplitText.create(el, {
      type: 'chars',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.chars, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.9,
          stagger: { each: 0.035, from: 'center' },
          ease: 'expo.out',
          scrollTrigger: once(el, 'top 98%'),
        }),
    });
  });
}

/* ------------------------------------------------------------------
   Efekty za wskaźnikiem myszy
   ------------------------------------------------------------------ */
function pointer() {
  if (!finePointer()) return;

  // Pierścień podążający za kursorem, powiększa się nad elementami klikalnymi
  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (cursor) {
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
    let shown = false;
    window.addEventListener('pointermove', (e) => {
      if (!shown) {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        shown = true;
      }
      cx(e.clientX);
      cy(e.clientY);
      const hot = (e.target as Element).closest('a, button, input, [data-a="tilt"]');
      gsap.to(cursor, { scale: hot ? 1.8 : 1, duration: 0.3, overwrite: 'auto' });
    });
    document.addEventListener('pointerleave', () => {
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
      shown = false;
    });
  }

  // Magnetyczne przyciski
  q('[data-magnetic]').forEach((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  });

  // Paralaksa kart w hero i w sekcji lekcji – głębia z atrybutu data-depth
  q('[data-a="tiltzone"]').forEach((zone) => {
    const layers = q('[data-depth]', zone);
    zone.addEventListener('pointermove', (e) => {
      const r = zone.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth) || 1;
        gsap.to(l, { '--px': `${dx * 22 * d}px`, '--py': `${dy * 18 * d}px`, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      });
    });
    zone.addEventListener('pointerleave', () => gsap.to(layers, { '--px': '0px', '--py': '0px', duration: 1, ease: 'elastic.out(1, 0.5)' }));
  });

  // Karty trenerów pochylają się w stronę kursora
  q('[data-a="tilt"]').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}
