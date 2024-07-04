import React from 'react';
import PreferencesContext from './PreferenceContext';
import { LocalizationProvider } from './LocalizationContext';
import { CombinedDarkTheme, CombinedDefaultTheme } from 'src/theme/index';
import { PaperProvider } from 'react-native-paper';
import AppQueryClient from 'src/services/query/AppQueryClient';
import { AppProvider } from './AppContext';

function Contexts({ children }: any) {
  const [isThemeDark, setIsThemeDark] = React.useState(false);

  let theme = isThemeDark ? CombinedDarkTheme : CombinedDefaultTheme;
  const toggleTheme = React.useCallback(() => {
    return setIsThemeDark(!isThemeDark);
  }, [isThemeDark]);

  const preferences = React.useMemo(
    () => ({
      toggleTheme,
      isThemeDark,
    }),
    [toggleTheme, isThemeDark],
  );
  return (
    <PreferencesContext.Provider value={preferences}>
      <LocalizationProvider>
        <PaperProvider theme={theme}>
          <AppProvider>
            <AppQueryClient>{children}</AppQueryClient>
          </AppProvider>
        </PaperProvider>
      </LocalizationProvider>
    </PreferencesContext.Provider>
  );
}

export default Contexts;
