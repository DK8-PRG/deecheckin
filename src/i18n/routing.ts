export const locales = ["cs", "en"];
export const defaultLocale = "cs";
export const routing = {
  locales,
  defaultLocale,
  hasLocale: (locale: string) => locales.includes(locale),
  getLocalePath: (locale: string, path: string) => {
    if (!locales.includes(locale)) {
      locale = defaultLocale;
    }
    return `/${locale}${path}`;
  },
};
