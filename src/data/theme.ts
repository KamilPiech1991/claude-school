export type Theme = 'a' | 'b';

/** Ścieżka w obrębie strony z uwzględnieniem `base` i kierunku wizualnego. */
export function href(theme: Theme, path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const prefix = theme === 'b' ? '/kierunek-b' : '';
  const clean = path.replace(/^\//, '');
  return `${base}${prefix}/${clean}`;
}

export const fontsHref: Record<Theme, string> = {
  a: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Caveat:wght@500;700&display=swap',
  b: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Caveat:wght@500;700&display=swap',
};
