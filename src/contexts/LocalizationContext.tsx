import * as RNLocalize from 'react-native-localize';
import { createContext, useEffect, useState } from 'react';
import LocalizedContent from 'react-localization';
import { MMKV, useMMKVString } from 'react-native-mmkv';
import en from '../loc/content/en.json';
import es from '../loc/content/es.json';
import hi from '../loc/content/hi.json';
import it from '../loc/content/it.json';
import ja from '../loc/content/ja.json';
import cn from '../loc/content/cn.json';
import { Keys } from 'src/storage';

export const Storage = new MMKV();

export const DEFAULT_LANGUAGE = 'en';
export const APP_LANGUAGE = 'appLanguage';

export const languages = {
  en,
  es,
  hi,
  it,
  ja,
  cn,
};

export const translations = new LocalizedContent(languages);

export const LocalizationContext = createContext({
  translations,
  setAppLanguage: () => {},
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: () => {},
});

export function LocalizationProvider({ children }) {
  const [appLanguage, setAppLanguage] = useMMKVString(Keys.APP_LANGUAGE);

  useEffect(() => {
    initializeAppLanguage();
  }, [appLanguage]);

  const formatString = (...param) => translations.formatString(...param);

  const initializeAppLanguage = () => {
    let localeCode = DEFAULT_LANGUAGE;
    if (appLanguage) {
      translations.setLanguage(appLanguage);
      setAppLanguage(appLanguage);
      // moment.locale(appLanguage);
    } else {
      translations.setLanguage(DEFAULT_LANGUAGE);
      setAppLanguage(DEFAULT_LANGUAGE);
      const supportedLocaleCodes = translations.getAvailableLanguages();
      const phoneLocaleCodes = RNLocalize.getLocales().map(
        locale => locale.languageCode,
      );
      phoneLocaleCodes.some(code => {
        if (supportedLocaleCodes.includes(code)) {
          localeCode = code;
          return true;
        }
      });
      // moment.locale(DEFAULT_LANGUAGE);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: appLanguage,
        appLanguage,
        initializeAppLanguage,
        formatString,
      }}>
      {children}
    </LocalizationContext.Provider>
  );
}
