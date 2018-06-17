import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import * as resources from './locales';

i18n.use(LanguageDetector).init({
  // we init with resources
  resources,
  fallbackLng: 'en',
  debug: true,

  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
  },

  react: {
    wait: true,
  },
});

export default i18n;
