import React from 'react';
import PreferencesContext from './PreferenceContext';
import { CombinedDarkTheme, CombinedDefaultTheme } from 'src/theme/index';
import { PaperProvider } from 'react-native-paper';

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
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </PreferencesContext.Provider>
  );
}

export default Contexts;
