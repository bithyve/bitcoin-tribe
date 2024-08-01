import React, { useContext, useEffect } from 'react';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMutation } from 'react-query';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import OptionCard from 'src/components/OptionCard';

function WalletSettings() {
  const { translations } = useContext(LocalizationContext);
  const strings = translations.wallet;
  const navigation = useNavigation();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );

  useEffect(() => {
    if (isSuccess) {
      Toast('Test-sats received', true);
    } else if (isError) {
      Toast('Failed to receive test-sats', false, true);
    }
  }, [isError, isSuccess]);

  return (
    <ScreenContainer>
      <AppHeader
        title={strings.walletSettings}
        subTitle={strings.walletSettingSubTitle}
      />
      <ModalLoading visible={isLoading} />
      <OptionCard
        title={strings.nameAndPic}
        subTitle={strings.nameAndPicSubTitle}
        onPress={() => navigation.navigate(NavigationRoutes.EDITWALLETPROFILE)}
      />
      <OptionCard
        title={strings.showXPub}
        subTitle={strings.showXPubSubTitle}
        onPress={() =>
          navigation.dispatch(CommonActions.navigate(NavigationRoutes.SHOWXPUB))
        }
      />
      <OptionCard
        title={strings.receiveTestSats}
        subTitle={strings.receiveTestSatSubtitle}
        onPress={() => mutate()}
      />
      <OptionCard
        title={strings.viewUnspent}
        subTitle={strings.viewUnspent}
        onPress={() => navigation.navigate(NavigationRoutes.VIEWUNSPENT)}
      />
    </ScreenContainer>
  );
}
export default WalletSettings;
