import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { AppTheme } from 'src/theme';
import ShowXPubContainer from './components/ShowXPubContainer';

function ShowXPub() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const walletData: Wallet = useWallets({}).wallets[0];
  const { xpub } = walletData.specs;
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.accountXPub}
        subTitle={wallet.accountXPubSubTitle}
        enableBack={true}
      />
      <ShowXPubContainer xpub={xpub} />
    </ScreenContainer>
  );
}
export default ShowXPub;
