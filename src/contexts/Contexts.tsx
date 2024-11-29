import React, { useEffect } from 'react';
import { LocalizationProvider } from './LocalizationContext';
import { CombinedDarkTheme, CombinedDefaultTheme } from 'src/theme/index';
import { PaperProvider } from 'react-native-paper';
import AppQueryClient from 'src/services/query/AppQueryClient';
import { AppProvider } from './AppContext';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useColorScheme } from 'react-native';

function Contexts({ children }: any) {
  const systemColorScheme = useColorScheme();
  const systemTheme = systemColorScheme === 'dark' ? true : false;

  const [isThemeDark, setIsThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [isUserThemeSelected] = useMMKVBoolean(Keys.IS_USER_SELECT_THEME)
  const storedTheme = isThemeDark !== undefined ? isThemeDark : systemTheme;
  
  useEffect(() => {
    if (isThemeDark !== storedTheme) {
      setIsThemeDark(storedTheme);
    }else if(!isUserThemeSelected){
      setIsThemeDark(systemTheme)
    }
  }, [isThemeDark, storedTheme]);
  let theme = storedTheme ? CombinedDarkTheme : CombinedDefaultTheme;

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
