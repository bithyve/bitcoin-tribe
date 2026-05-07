import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { AppTheme } from 'src/theme';
import ShowXPubContainer from './components/ShowXPubContainer';

function ShowXPub() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const rgbWallet: RGBWallet | undefined = useQuery(RealmSchema.RgbWallet)[0];
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.accountXPub}
        subTitle={wallet.accountXPubSubTitle}
        enableBack={true}
      />
      <ShowXPubContainer
        accountXpubVanilla={rgbWallet?.accountXpubVanilla}
        accountXpubColored={rgbWallet?.accountXpubColored}
      />
    </ScreenContainer>
  );
}
export default ShowXPub;
