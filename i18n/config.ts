import { UserConfig } from 'next-i18next';

const i18n: UserConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'zh', 'ja', 'fr', 'de'],
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Disable suspense for server-side rendering
  },
};

export default i18n;