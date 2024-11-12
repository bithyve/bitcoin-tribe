import React from 'react';
import { LocalizationProvider } from './LocalizationContext';
import { CombinedDarkTheme, CombinedDefaultTheme } from 'src/theme/index';
import { PaperProvider } from 'react-native-paper';
import AppQueryClient from 'src/services/query/AppQueryClient';
import { AppProvider } from './AppContext';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useColorScheme } from 'react-native';

function Contexts({ children }: any) {
  // const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  // let theme = isThemeDark ? CombinedDefaultTheme : CombinedDarkTheme;

  const systemColorScheme = useColorScheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  // If isThemeDark is not set, fall back to system color scheme
  const theme =
    isThemeDark !== null
      ? isThemeDark
        ? CombinedDarkTheme
        : CombinedDefaultTheme
      : systemColorScheme === 'dark'
      ? CombinedDarkTheme
      : CombinedDefaultTheme;

  return (
    <LocalizationProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <AppQueryClient>{children}</AppQueryClient>
        </AppProvider>
      </PaperProvider>
    </LocalizationProvider>
  );
}

export default Contexts;
