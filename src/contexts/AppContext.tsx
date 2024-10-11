import React, { useState } from 'react';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
  isWalletOnline: null,
  setIsWalletOnline: status => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [isWalletOnline, setIsWalletOnline] = useState<boolean>(null);

  return (
    <AppContext.Provider
      value={{
        key,
        setKey: setKey,
        isWalletOnline,
        setIsWalletOnline: setIsWalletOnline,
      }}>
      {children}
    </AppContext.Provider>
  );
}
