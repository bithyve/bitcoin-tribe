import React, { useContext } from 'react';
import { Switch, useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SendToContainer from './components/SendToContainer';
import { Keys } from 'src/storage';
import { useMMKVString } from 'react-native-mmkv';
import availableCurrency from 'src/loc/availableCurrency';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import CurrencySwitch from 'src/components/CurrencySwitch';

function SendToScreen({ route }) {
  const { wallet, address, paymentURIAmount } = route.params;

  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const initialCurrency = currency || 'USD';
  const selectedCurrency = availableCurrency.find(
    cur => cur.code === initialCurrency,
  );

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={sendScreen.sendTitle}
        // rightIcon={
          // <CurrencySwitch/>
          // <Switch
          //   value={initialCurrencyMode === CurrencyKind.SATS}
          //   onValueChange={() => toggleDisplayMode()}
          //   color={theme.colors.accent1}
          // />
        // }
      />
      <SendToContainer
        wallet={wallet}
        address={address}
        paymentURIAmount={paymentURIAmount}
      />
    </ScreenContainer>
  );
}
export default SendToScreen;
