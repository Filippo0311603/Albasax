import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import pt from './locales/pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      pt: { translation: pt },
    },
    fallbackLng: 'en',
    lng: 'en', // default English
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧', flagCode: 'gb' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹', flagCode: 'it' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷', flagCode: 'fr' },
  { code: 'es', label: 'Español',    flag: '🇪🇸', flagCode: 'es' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪', flagCode: 'de' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹', flagCode: 'pt' },
] as const;
