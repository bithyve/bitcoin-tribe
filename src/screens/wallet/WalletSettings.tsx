import React, { useContext } from 'react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

import IconXpub from 'src/assets/images/icon_xpub.svg';

function WalletSettings({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.walletSettings}
        subTitle={wallet.walletSettingSubTitle}
      />
      <SelectOption
        title={wallet.nameAndPic}
        subTitle={wallet.nameAndPicSubTitle}
        icon={<IconXpub />}
        onPress={() => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE)}
        showArrow={false}
      />
      <SelectOption
        title={wallet.showXPub}
        subTitle={wallet.showXPubSubTitle}
        icon={<IconXpub />}
        onPress={() => console.log('press')}
        showArrow={false}
      />
    </ScreenContainer>
  );
}
export default WalletSettings;
