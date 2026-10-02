// @ts-check
import { defineConfig } from 'astro/config';

// Strona publikowana na GitHub Pages pod https://kamilpiech1991.github.io/claude-school/
export default defineConfig({
  site: 'https://kamilpiech1991.github.io',
  base: '/claude-school',
  trailingSlash: 'always',
});
