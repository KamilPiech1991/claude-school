import { gsap, ScrollTrigger, Flip, dur, tweenPrice, popIn, shake, reducedMotion } from './motion';

type Hours = 4 | 8;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const refresh = () => setTimeout(() => ScrollTrigger.refresh(), 60);

/* ------------------------------------------------------------------
   Płynne przewijanie do kotwic na tej samej stronie
   ------------------------------------------------------------------ */
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  gsap.to(window, { scrollTo: { y: target, offsetY: 72, autoKill: true }, duration: dur(1.1), ease: 'power3.inOut' });
  history.pushState(null, '', url.hash);
});

/* ------------------------------------------------------------------
   Przełącznik 4 h / 8 h z przesuwanym podświetleniem
   ------------------------------------------------------------------ */
function placeThumb(seg: HTMLElement, animate: boolean) {
  const on = $<HTMLButtonElement>('button[aria-pressed="true"]', seg);
  const thumb = $('.seg__thumb', seg);
  if (!on || !thumb) return;
  // Przesunięcie liczone od bazowej pozycji thumba (CSS `left`), nie od jego bieżącego x
  const vars = { x: on.offsetLeft - parseFloat(getComputedStyle(thumb).left), width: on.offsetWidth };
  if (animate && !reducedMotion()) gsap.to(thumb, { ...vars, duration: 0.5, ease: 'elastic.out(1, 0.75)' });
  else gsap.set(thumb, vars);
}

function setSeg(seg: HTMLElement, h: Hours, animate: boolean) {
  $$<HTMLButtonElement>('button[data-hours]', seg).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.hours) === h)));
  placeThumb(seg, animate);
}

$$('[data-seg]').forEach((seg) => {
  setSeg(seg, Number($('button[aria-pressed="true"]', seg)?.dataset.hours ?? 8) as Hours, false);
  seg.setAttribute('data-ready', '');
  seg.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-hours]');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    const h = Number(b.dataset.hours) as Hours;
    setSeg(seg, h, true);
    seg.dispatchEvent(new CustomEvent('hourschange', { bubbles: true, detail: h }));
  });
});

window.addEventListener('resize', () => $$('[data-seg][data-ready]').forEach((s) => placeThumb(s, false)));
document.fonts?.ready.then(() => $$('[data-seg][data-ready]').forEach((s) => placeThumb(s, false)));

/* ------------------------------------------------------------------
   Strona główna: karty kursów
   ------------------------------------------------------------------ */
$$('[data-course-card]').forEach((card) => {
  const price = JSON.parse(card.dataset.price!) as Record<Hours, number>;
  const next = JSON.parse(card.dataset.next!) as Record<Hours, string>;
  card.addEventListener('hourschange', (e) => {
    const h = (e as CustomEvent<Hours>).detail;
    card.dataset.hours = String(h);
    tweenPrice($('[data-price-label]', card), price[h]);
    const count = $('[data-count]', card)!;
    count.textContent = `${h === 4 ? 4 : 8} modułów · ${h} h`;
    const nextEl = $('[data-next-label]', card)!;
    if (reducedMotion()) nextEl.textContent = next[h];
    else gsap.to(nextEl, { duration: 0.6, scrambleText: { text: next[h], chars: '0123456789 ·', speed: 0.8 } });
    $$<HTMLAnchorElement>('[data-course-link]', card).forEach((a) => (a.href = `${card.dataset.url}?h=${h}`));
  });
});

/* ------------------------------------------------------------------
   Strona główna: filtr terminów (Flip)
   ------------------------------------------------------------------ */
const filters = $('[data-filters]');
const rowsBox = $('[data-rows]');
if (filters && rowsBox) {
  const rows = $$('a[data-course]', rowsBox);
  let busy = false;
  filters.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-filter]');
    if (!b || busy || b.getAttribute('aria-pressed') === 'true') return;
    const id = b.dataset.filter!;
    $$('button[data-filter]', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const show = (r: HTMLElement) => id === 'all' || r.dataset.course === id;
    const leaving = rows.filter((r) => !r.hidden && !show(r));
    const entering = rows.filter((r) => r.hidden && show(r));

    busy = true;
    gsap.to(leaving, {
      autoAlpha: 0,
      x: -24,
      duration: dur(0.22),
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => {
        const state = Flip.getState(rows.filter((r) => !r.hidden));
        leaving.forEach((r) => (r.hidden = true));
        gsap.set(leaving, { clearProps: 'all' });
        entering.forEach((r) => (r.hidden = false));
        Flip.from(state, { duration: dur(0.55), ease: 'power3.inOut' });
        gsap.fromTo(
          entering,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur(0.5),
            stagger: 0.05,
            ease: 'power3.out',
            delay: dur(0.1),
            clearProps: 'all',
            onComplete: () => {
              busy = false;
              refresh();
            },
          },
        );
        if (!entering.length) {
          busy = false;
          refresh();
        }
      },
    });
  });
}

/* ------------------------------------------------------------------
   FAQ – akordeon z animacją wysokości
   ------------------------------------------------------------------ */
const faq = $('[data-faq]');
if (faq) {
  const close = (btn: HTMLButtonElement) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!;
    btn.setAttribute('aria-expanded', 'false');
    gsap.to(panel, {
      height: 0,
      duration: dur(0.35),
      ease: 'power3.inOut',
      onComplete: () => {
        panel.hidden = true;
        gsap.set(panel, { clearProps: 'height' });
        refresh();
      },
    });
  };
  const open = (btn: HTMLButtonElement) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!;
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    gsap.from(panel, { height: 0, duration: dur(0.45), ease: 'power3.out', clearProps: 'height', onComplete: refresh });
    gsap.from(panel.firstElementChild, { y: -10, autoAlpha: 0, duration: dur(0.45), ease: 'power3.out' });
  };
  faq.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[aria-controls]');
    if (!btn) return;
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    $$<HTMLButtonElement>('button[aria-expanded="true"]', faq).forEach(close);
    if (!wasOpen) open(btn);
  });
}

/* ------------------------------------------------------------------
   Formularz darmowej lekcji
   ------------------------------------------------------------------ */
const validEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());
const leadForm = $<HTMLFormElement>('[data-lead-form]');
if (leadForm) {
  const input = $<HTMLInputElement>('input[type="email"]', leadForm)!;
  const hint = $('[data-lead-hint]', leadForm)!;
  const hintText = hint.textContent;
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validEmail(input.value)) {
      hint.textContent = 'Wpisz poprawny adres e-mail, np. imie@firma.pl';
      input.setAttribute('aria-invalid', 'true');
      shake(input);
      input.focus();
      return;
    }
    hint.textContent = hintText;
    const done = $('[data-lead-done]')!;
    $('[data-lead-email]', done)!.textContent = input.value.trim();
    gsap.to(leadForm, {
      autoAlpha: 0,
      y: -12,
      duration: dur(0.3),
      ease: 'power2.in',
      onComplete: () => {
        leadForm.hidden = true;
        done.hidden = false;
        popIn(done);
        refresh();
      },
    });
  });
  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
}

/* ------------------------------------------------------------------
   Strona kursu: wymiar, program, terminy i zapis
   ------------------------------------------------------------------ */
const page = $('[data-course-page]');
if (page) {
  const price = JSON.parse(page.dataset.price!) as Record<Hours, number>;
  const sessions = $$<HTMLButtonElement>('[data-session]', page);
  const extras = $$('[data-extra]', page);
  const noSessions = $('[data-no-sessions]', page)!;
  let selected: HTMLButtonElement | null = null;

  const select = (btn: HTMLButtonElement | null) => {
    selected = btn;
    sessions.forEach((s) => s.setAttribute('aria-checked', String(s === btn)));
    if (btn && !reducedMotion()) gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    const url = new URL(location.href);
    if (btn) url.searchParams.set('s', btn.dataset.session!);
    else url.searchParams.delete('s');
    history.replaceState(null, '', url);
  };

  const apply = (h: Hours, animate: boolean) => {
    page.dataset.hours = String(h);
    $('[data-mod-count]', page)!.textContent = `${h} h`;
    $('[data-hours-label]', page)!.textContent = `${h} godzin`;
    const note = $('[data-dur-note]');
    if (note) note.textContent = h === 4 ? 'Pół dnia · 4 moduły podstaw' : 'Cały dzień · 8 modułów + warsztat';
    if (animate) tweenPrice($('[data-price-label]', page), price[h]);
    else $('[data-price-label]', page)!.textContent = price[h].toLocaleString('pl-PL') + ' zł';

    // Moduły 5–8 tylko w wersji 8 h
    if (h === 8) {
      extras.forEach((m) => (m.hidden = false));
      if (animate) gsap.fromTo(extras, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: dur(0.5), stagger: 0.07, ease: 'power3.out', clearProps: 'all' });
    } else if (animate && !reducedMotion()) {
      gsap.to([...extras].reverse(), {
        autoAlpha: 0,
        x: 30,
        duration: 0.25,
        stagger: 0.04,
        ease: 'power2.in',
        onComplete: () => {
          extras.forEach((m) => (m.hidden = true));
          gsap.set(extras, { clearProps: 'all' });
          refresh();
        },
      });
    } else extras.forEach((m) => (m.hidden = true));

    // Terminy w wybranym wymiarze
    const visible = sessions.filter((s) => Number(s.dataset.hours) === h);
    sessions.forEach((s) => (s.hidden = Number(s.dataset.hours) !== h));
    noSessions.hidden = visible.length > 0;
    if (selected && selected.hidden) select(null);
    if (animate) gsap.fromTo(visible, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: dur(0.4), stagger: 0.06, ease: 'power2.out', clearProps: 'all' });

    const url = new URL(location.href);
    url.searchParams.set('h', String(h));
    history.replaceState(null, '', url);
    refresh();
  };

  // Stan początkowy z adresu (?h=4&s=s3) – przychodzimy tu z kart i listy terminów
  const params = new URLSearchParams(location.search);
  const startH = Number(params.get('h'));
  if (startH === 4 || startH === 8) {
    $$('[data-seg]').forEach((seg) => setSeg(seg, startH, false));
    apply(startH, false);
  }
  const startS = sessions.find((s) => s.dataset.session === params.get('s') && !s.hidden);
  if (startS) select(startS);

  document.addEventListener('hourschange', (e) => apply((e as CustomEvent<Hours>).detail, true));

  sessions.forEach((s) => s.addEventListener('click', () => select(s)));

  const form = $<HTMLFormElement>('[data-signup-form]', page)!;
  const err = $('[data-signup-err]', page)!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $<HTMLInputElement>('input[name="name"]', form)!;
    const email = $<HTMLInputElement>('input[name="email"]', form)!;
    let problem: [string, Element | null] | null = null;
    if (!selected) problem = ['Wybierz termin z listy powyżej.', $('[data-sessions]', form)];
    else if (!name.value.trim()) problem = ['Podaj imię i nazwisko.', name];
    else if (!validEmail(email.value)) problem = ['Podaj poprawny adres e-mail.', email];
    if (problem) {
      err.textContent = problem[0];
      shake(problem[1]);
      if (problem[1] instanceof HTMLInputElement) problem[1].focus();
      return;
    }
    err.textContent = '';
    const done = $('[data-signup-done]', page)!;
    $('[data-selected-label]', done)!.textContent = selected!.dataset.label!;
    gsap.to(form, {
      autoAlpha: 0,
      y: -12,
      duration: dur(0.3),
      ease: 'power2.in',
      onComplete: () => {
        form.hidden = true;
        done.hidden = false;
        popIn(done);
        refresh();
      },
    });
  });
}
