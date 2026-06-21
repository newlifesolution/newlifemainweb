// @ts-check
import { defineConfig } from 'astro/config';

// newlife hub — static output, ES default (/) + EN (/en/), hreflang via sitemap + <head>.
export default defineConfig({
  site: 'https://www.newlifesolutions.dev',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false, // es at "/", en at "/en/"
    },
  },
});
