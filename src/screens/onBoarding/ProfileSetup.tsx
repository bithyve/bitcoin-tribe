import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useNavigation, useRoute } from '@react-navigation/native';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ScreenContainer from 'src/components/ScreenContainer';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import { AppContext } from 'src/contexts/AppContext';
import { decrypt, hash512 } from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import config from 'src/utils/config';
import AppType from 'src/models/enums/AppType';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import { AppTheme } from 'src/theme';
import { Keys, Storage } from 'src/storage';
import BitcoinBackedAssetContainer from './components/BitcoinBackedAssetContainer';

function ProfileSetup() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const route = useRoute();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const [name, setName] = useState('');
  const [visibleBackAssetAlert, setVisibleBackAssetAlert] = useState(false);

  const [profileImage, setProfileImage] = useState('');
  const { setKey } = useContext(AppContext);
  const setupNewAppMutation = useMutation(ApiHandler.setupNewApp);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (setupNewAppMutation.isSuccess) {
      onSuccess();
    } else if (setupNewAppMutation.isError) {
      setIsLoading(false);
      Toast(`${setupNewAppMutation.error}`, true);
    }
  }, [setupNewAppMutation.isError, setupNewAppMutation.isSuccess]);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(true);
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const onSuccess = async () => {
    setIsLoading(false);
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    setKey(key);
    // navigation.navigate(NavigationRoutes.ONBOARDINGSCREEN);
    setTimeout(() => {
      setVisibleBackAssetAlert(true);
    }, 400);
  };

  const initiateWalletCreation = () => {
    setIsLoading(true);
    Keyboard.dismiss();
    setTimeout(() => {
      const appType: AppType = route.params?.appType || AppType.ON_CHAIN;
      setupNewAppMutation.mutate({
        appName: name,
        pinMethod: PinMethod.DEFAULT,
        passcode: '',
        walletImage: profileImage,
        appType,
        rgbNodeConnectParams: route.params?.nodeConnectParams || null,
        rgbNodeInfo: route.params?.nodeInfo || null,
        mnemonic: route.params?.mnemonic || '',
      });
    }, 200);
  };

  return (
    <ScreenContainer>
      <ModalLoading visible={isLoading} />
      <ProfileDetails
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => initiateWalletCreation()}
        secondaryOnPress={() => initiateWalletCreation()}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        rightText={common.skip}
        onRightTextPress={() => {
          initiateWalletCreation();
        }}
        primaryStatus={setupNewAppMutation.status}
        primaryCTATitle={common.next}
        primaryCtaLoader={false}
        disabled={false}
        // secondaryCTATitle={common.skip}
      />
      <View>
        <ResponsePopupContainer
          visible={visibleBackAssetAlert}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.borderColor}
          width={'100%'}>
          <BitcoinBackedAssetContainer
            onPrimaryPress={() => {
              setVisibleBackAssetAlert(false);
              Storage.set(Keys.BACKUPALERT, true);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.APPSTACK);
              }, 400);
            }}
            onLaterPress={() => {
              setVisibleBackAssetAlert(false);
              Storage.set(Keys.BACKUPALERT, true);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.APPSTACK, {
                  screen: NavigationRoutes.RECEIVESCREEN,
                });
              }, 400);
            }}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}

export default ProfileSetup;
