import React from 'react';

const PreferencesContext = React.createContext({
  toggleTheme: () => {},
  isThemeDark: false,
});

export default PreferencesContext;
