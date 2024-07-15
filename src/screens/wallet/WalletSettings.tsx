import React, { useContext, useEffect } from 'react';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMutation } from 'react-query';
import IconXpub from 'src/assets/images/icon_xpub.svg';
import { CommonActions } from '@react-navigation/native';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';

function WalletSettings({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const strings = translations.wallet;
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );

  useEffect(() => {
    if (isSuccess) {
      Toast('Test-sats received');
    } else if (isError) {
      Toast('Failed to receive test-sats');
    }
  }, [isError, isSuccess]);

  return (
    <ScreenContainer>
      <AppHeader
        title={strings.walletSettings}
        subTitle={strings.walletSettingSubTitle}
      />
      <ModalLoading visible={isLoading} />
      <SelectOption
        title={strings.nameAndPic}
        subTitle={strings.nameAndPicSubTitle}
        icon={<IconXpub />}
        onPress={() => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE)}
        showArrow={false}
      />
      <SelectOption
        title={strings.showXPub}
        subTitle={strings.showXPubSubTitle}
        icon={<IconXpub />}
        onPress={() =>
          navigation.dispatch(CommonActions.navigate(NavigationRoutes.SHOWXPUB))
        }
        showArrow={false}
      />
      <SelectOption
        title={strings.receiveTestSats}
        subTitle={strings.receiveTestSatSubtitle}
        icon={<IconXpub />}
        onPress={() => mutate()}
        showArrow={false}
      />
    </ScreenContainer>
  );
}
export default WalletSettings;
