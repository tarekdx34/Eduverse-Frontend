import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import arTranslations from './ar.json';

// Define resources
const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Use browser language detection
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    defaultLanguage: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

// Set HTML direction based on language
i18n.on('languageChanged', (lng) => {
  const htmlElement = document.documentElement;
  htmlElement.lang = lng;
  htmlElement.dir = lng === 'ar' ? 'rtl' : 'ltr';

  // Store language preference
  localStorage.setItem('preferredLanguage', lng);
});

// Set initial direction on load
const initialLang = i18n.language || 'en';
document.documentElement.lang = initialLang;
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';

export default i18n;
