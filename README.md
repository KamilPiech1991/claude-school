# Claude School – strona

Strona szkoły Claude zbudowana w [Astro](https://astro.build) z animacjami [GSAP](https://gsap.com).
Dwa kierunki wizualne na wspólnych komponentach:

- `/` – kierunek A (ciemny)
- `/kierunek-b/` – kierunek B (jasny)
- `/kursy/<id>/` i `/kierunek-b/kursy/<id>/` – strony kursów (`zero`, `code`, `cowork`)

Treści (ceny, terminy, trenerzy, opinie) są przykładowe.

## Praca lokalnie

```bash
npm install
npm run dev      # http://localhost:4321/claude-school/
npm run build    # sprawdzenie typów + build do dist/
npm run preview  # podgląd zbudowanej strony
```

## Struktura

- `src/data/site.ts` – kursy, terminy, trenerzy, opinie, FAQ. Tu zmieniasz treści.
- `src/styles/global.css` – tokeny kolorów, fontów i zaokrągleń dla kierunków A i B.
- `src/components/` – sekcje strony głównej (`home/`) i strony kursu (`course/`).
- `src/scripts/interactions.ts` – przełącznik 4 h / 8 h, filtr terminów, FAQ, formularze.
- `src/scripts/animations.ts` – animacje GSAP (wejście, ScrollTrigger, SplitText, efekty za kursorem).
- `zrodla/` – oryginalne pliki makiety, na których oparto stronę.

Animacje wyłączają się automatycznie, gdy w systemie włączone jest ograniczenie ruchu
(`prefers-reduced-motion`).

## Publikacja

Workflow `.github/workflows/pages.yml` buduje stronę i publikuje ją na GitHub Pages przy każdym
pushu. W ustawieniach repozytorium (Settings → Pages) źródłem musi być **GitHub Actions**.
