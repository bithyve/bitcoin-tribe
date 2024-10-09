import React, { useContext, useState } from 'react';

export const AppContext = React.createContext({
  key: null,
  setKey: key => {},
  checkRGBWalletOnline: null,
  setCheckRGBWalletOnline: status => {},
});

export function AppProvider({ children }) {
  const [key, setKey] = useState<string>(null);
  const [checkRGBWalletOnline, setCheckRGBWalletOnline] =
    useState<boolean>(null);

  return (
    <AppContext.Provider
      value={{
        key,
        setKey: setKey,
        checkRGBWalletOnline,
        setCheckRGBWalletOnline: setCheckRGBWalletOnline,
      }}>
      {children}
    </AppContext.Provider>
  );
}

// // Custom hook to use the AppContext
// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useAppContext must be used within an AppProvider');
//   }
//   return context;
// }
