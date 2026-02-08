import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@gonext/language';

import ru from '../locales/ru.json';
import en from '../locales/en.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      const lng = stored && (stored === 'ru' || stored === 'en') ? stored : 'ru';
      callback(lng);
    });
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    void AsyncStorage.setItem(LANGUAGE_KEY, lng);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
