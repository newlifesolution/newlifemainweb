import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg in ui) return seg as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)['es']): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Build a path in the given locale: es -> "/", en -> "/en/"
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/(en\/)?/, '/');
  return lang === defaultLang ? clean : `/en${clean === '/' ? '/' : clean}`;
}
