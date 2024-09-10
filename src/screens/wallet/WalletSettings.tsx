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
import SelectOption from 'src/components/SelectOption';

function WalletSettings() {
  const { translations } = useContext(LocalizationContext);
  const strings = translations.wallet;
  const navigation = useNavigation();
  const { mutate, isLoading, isError, isSuccess } = useMutation(
    ApiHandler.receiveTestSats,
  );

  useEffect(() => {
    if (isSuccess) {
      Toast(strings.testSatsRecived, true);
    } else if (isError) {
      Toast(strings.failedTestSatsRecived, false, true);
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
        title={strings.showXPub}
        // subTitle={strings.showXPubSubTitle}
        onPress={() =>
          navigation.dispatch(CommonActions.navigate(NavigationRoutes.SHOWXPUB))
        }
      />
      <SelectOption
        title={strings.receiveTestSats}
        // subTitle={strings.receiveTestSatSubtitle}
        onPress={() => mutate()}
        showArrow={false}
      />
      <SelectOption
        title={strings.viewUnspent}
        // subTitle={strings.viewUnspent}
        onPress={() => navigation.navigate(NavigationRoutes.VIEWUNSPENT)}
      />
    </ScreenContainer>
  );
}
export default WalletSettings;
