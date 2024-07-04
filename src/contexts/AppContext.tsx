import React, { useState } from 'react';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);

  return (
    <AppContext.Provider value={{ key, setKey: setKey }}>
      {children}
    </AppContext.Provider>
  );
}
