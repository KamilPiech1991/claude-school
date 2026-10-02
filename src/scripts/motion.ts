import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Flip, CustomEase);

CustomEase.create('cs-out', 'M0,0 C0.16,1 0.3,1 1,1');

export { gsap, ScrollTrigger, SplitText, Flip };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Czas animacji – zero, gdy użytkownik prosi o ograniczenie ruchu. */
export const dur = (s: number) => (reducedMotion() ? 0 : s);

const zl = (n: number) => Math.round(n).toLocaleString('pl-PL') + ' zł';

/** Płynne przeliczenie kwoty w etykiecie ceny. */
export function tweenPrice(el: Element | null, to: number) {
  if (!el) return;
  const from = Number(el.textContent?.replace(/\D/g, '')) || to;
  const o = { v: from };
  gsap.to(o, {
    v: to,
    duration: dur(0.7),
    ease: 'power3.out',
    overwrite: true,
    onUpdate: () => {
      el.textContent = zl(o.v);
    },
  });
  if (!reducedMotion()) gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', transformOrigin: '100% 50%' });
}

/** Rysuje ścieżki SVG (np. ptaszek po wysłaniu formularza). */
export function drawIn(root: Element) {
  const paths = root.querySelectorAll('[data-a="check"]');
  if (!paths.length) return;
  gsap.fromTo(paths, { drawSVG: '0%' }, { drawSVG: '100%', duration: dur(0.6), stagger: 0.15, ease: 'power2.inOut', delay: dur(0.15) });
}

/** Wejście panelu potwierdzenia. */
export function popIn(el: Element) {
  gsap.fromTo(el, { autoAlpha: 0, y: 16, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: dur(0.6), ease: 'back.out(1.6)' });
  drawIn(el);
}

/** Potrząśnięcie polem z błędem. */
export function shake(el: Element | null) {
  if (!el || reducedMotion()) return;
  gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-10, 9, -7, 5, -2, 0] }, duration: 0.45, ease: 'none' });
}
