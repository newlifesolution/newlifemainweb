// Bilingual strings for the newlife hub. Add keys here; both locales must stay in sync.
export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export const ui = {
  es: {
    'meta.title': 'newlife — estudio de herramientas técnicas',
    'meta.desc':
      'newlife diseña y despliega software técnico afilado. Empezamos por el dibujo técnico con CADlingua.',
    'nav.flagship': 'CADlingua',
    'nav.cta': 'Solicitar acceso',
    'hero.eyebrow': 'Estudio de herramientas técnicas',
    'hero.h1': 'Herramientas que resuelven problemas técnicos de verdad.',
    'hero.sub':
      'newlife es un estudio que diseña y despliega software técnico afilado. Pocas herramientas, muy afiladas. Empezamos por el dibujo técnico.',
    'hero.cta1': 'Ver CADlingua',
    'hero.cta2': 'Hablar con nosotros',
    'flag.badge': 'Producto destacado',
    'flag.name': 'CADlingua',
    'flag.tagline': 'Traduce tus planos a cualquier idioma. Las cotas se quedan donde están.',
    'flag.body':
      'Cualquiera pasa un PDF por un traductor. Nadie traduce un DWG sin destrozarte las cotas. CADlingua entiende el plano: traduce solo el texto y deja intactas las dimensiones, tolerancias, símbolos y códigos.',
    'flag.f1.t': 'Cotas a salvo',
    'flag.f1.d': 'Preserva Ø50, R5, tolerancias y símbolos (Ø · ° · ±) y los códigos del plano.',
    'flag.f2.t': 'DXF y DWG',
    'flag.f2.d': 'Subes el plano, lo recuperas traducido en el mismo formato.',
    'flag.f3.t': 'Cualquier idioma',
    'flag.f3.d': 'Incluido no latino: cirílico, chino/japonés/coreano, griego, árabe.',
    'flag.f4.t': 'A medida de tu empresa',
    'flag.f4.d': 'Tu glosario, tus nombres propios a preservar, tu gramática de códigos.',
    'flag.cta': 'Solicitar acceso',
    'flag.soon': 'En despliegue',
    'more.title': 'Más herramientas en camino',
    'more.body': 'newlife añade nuevas herramientas técnicas con regularidad. CADlingua es la primera.',
    'cta.title': '¿Tienes un problema técnico que merece su propia herramienta?',
    'cta.body': 'Cuéntanoslo. Construimos software técnico afilado, no software genérico.',
    'cta.button': 'Escríbenos',
    'footer.tagline': 'Estudio de herramientas técnicas.',
    'footer.rights': 'Todos los derechos reservados.',
  },
  en: {
    'meta.title': 'newlife — a studio of technical tools',
    'meta.desc':
      'newlife designs and ships sharp technical software. We start with technical drawings, with CADlingua.',
    'nav.flagship': 'CADlingua',
    'nav.cta': 'Request access',
    'hero.eyebrow': 'A studio of technical tools',
    'hero.h1': 'Tools that solve real technical problems.',
    'hero.sub':
      'newlife is a studio that designs and ships sharp technical software. Few tools, very sharp. We start with technical drawings.',
    'hero.cta1': 'See CADlingua',
    'hero.cta2': 'Talk to us',
    'flag.badge': 'Featured product',
    'flag.name': 'CADlingua',
    'flag.tagline': 'Translate your drawings into any language. The dimensions stay put.',
    'flag.body':
      'Anyone can run a PDF through a translator. Nobody translates a DWG without wrecking the dimensions. CADlingua understands the drawing: it translates only the prose and leaves dimensions, tolerances, symbols and codes untouched.',
    'flag.f1.t': 'Dimensions safe',
    'flag.f1.d': 'Preserves Ø50, R5, tolerances and symbols (Ø · ° · ±) and the drawing codes.',
    'flag.f2.t': 'DXF and DWG',
    'flag.f2.d': 'Upload the drawing, get it back translated in the same format.',
    'flag.f3.t': 'Any language',
    'flag.f3.d': 'Including non-Latin: Cyrillic, CJK, Greek, Arabic.',
    'flag.f4.t': 'Tailored to your company',
    'flag.f4.d': 'Your glossary, your proper nouns to preserve, your code grammar.',
    'flag.cta': 'Request access',
    'flag.soon': 'Deploying',
    'more.title': 'More tools on the way',
    'more.body': 'newlife ships new technical tools regularly. CADlingua is the first.',
    'cta.title': 'Got a technical problem that deserves its own tool?',
    'cta.body': 'Tell us. We build sharp technical software, not generic software.',
    'cta.button': 'Get in touch',
    'footer.tagline': 'A studio of technical tools.',
    'footer.rights': 'All rights reserved.',
  },
} as const;
