import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fa from './locales/fa.json';

const resources = {
  en: {
    translation: en
  },
  ar: {
    translation: ar
  },
  fa: {
    translation: fa
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

// Helper function to detect RTL languages
export const isRTL = (locale: string): boolean => {
  return ['ar', 'fa'].includes(locale);
};

// Helper function to get text direction
export const getTextDirection = (locale: string): 'ltr' | 'rtl' => {
  return isRTL(locale) ? 'rtl' : 'ltr';
};

// Helper function to get opposite margin/padding
export const getMarginStart = (locale: string): string => {
  return isRTL(locale) ? 'margin-right' : 'margin-left';
};

export const getMarginEnd = (locale: string): string => {
  return isRTL(locale) ? 'margin-left' : 'margin-right';
};

export const getPaddingStart = (locale: string): string => {
  return isRTL(locale) ? 'padding-right' : 'padding-left';
};

export const getPaddingEnd = (locale: string): string => {
  return isRTL(locale) ? 'padding-left' : 'padding-right';
};