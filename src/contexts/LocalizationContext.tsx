import * as RNLocalize from 'react-native-localize';
import { createContext, useEffect, useState } from 'react';
import LocalizedContent from 'react-localization';
import { MMKV, useMMKVString } from 'react-native-mmkv';
import en from '../loc/content/en.json';
import es from '../loc/content/es.json';
import { Keys } from 'src/storage';
import moment from 'moment';

export const Storage = new MMKV();

export const DEFAULT_LANGUAGE = 'en';
export const APP_LANGUAGE = 'appLanguage';

export const languages = {
  en,
  es,
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

  // const setLanguage = language => {
  //   translations.setLanguage(language);
  // setAppLanguage(language);
  // Storage.set(APP_LANGUAGE, language);
  // };

  const formatString = (...param) => translations.formatString(...param);

  const initializeAppLanguage = async () => {
    if (appLanguage) {
      translations.setLanguage(appLanguage);
      setAppLanguage(appLanguage);
      moment.locale(appLanguage);
    } else {
      translations.setLanguage(DEFAULT_LANGUAGE);
      moment.locale(DEFAULT_LANGUAGE);
    }
  };

  useEffect(() => {
    console.log('appLanguage', appLanguage);
    initializeAppLanguage;
  }, [appLanguage]);

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
