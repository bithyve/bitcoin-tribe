import React, { useState } from 'react';
import AppType from 'src/models/enums/AppType';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
  isWalletOnline: null,
  setIsWalletOnline: status => {},
  appType: null,
  setAppType: apptype => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [isWalletOnline, setIsWalletOnline] = useState<boolean>(null);
  const [appType, setAppType] = useState<AppType>(null);

  return (
    <AppContext.Provider
      value={{
        key,
        setKey: setKey,
        isWalletOnline,
        setIsWalletOnline: setIsWalletOnline,
        appType,
        setAppType: setAppType,
      }}>
      {children}
    </AppContext.Provider>
  );
}
