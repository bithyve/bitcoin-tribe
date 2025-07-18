import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import ScreenContainer from 'src/components/ScreenContainer';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import { AppContext } from 'src/contexts/AppContext';
import { decrypt, hash512 } from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import config from 'src/utils/config';
import AppType from 'src/models/enums/AppType';
import Toast from 'src/components/Toast';
import { AppTheme } from 'src/theme';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import WebView from 'react-native-webview';
import { hp, windowWidth, windowHeight } from 'src/constants/responsive';
import Modal from 'react-native-modal';
import PrimaryCTA from 'src/components/PrimaryCTA';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerStyle: {
      height: windowHeight - hp(140),
      width: '100%',
      backgroundColor: theme.colors.modalBackColor,
      padding: hp(5),
      borderRadius: hp(30),
      marginHorizontal: 0,
      marginBottom: 5,
    },
    webViewStyle: {
      flex: 1,
      marginVertical: hp(10),
      backgroundColor: theme.colors.modalBackColor,
      borderRadius: hp(30),
    },
    titleStyle: {
      textAlign: 'center',
      marginVertical: hp(10),
    },
  });

function ProfileSetup() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const route = useRoute();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const [name, setName] = useState('');
  const styles = getStyles(theme);

  const [profileImage, setProfileImage] = useState<Asset | null>(null);
  const { setKey } = useContext(AppContext);
  const setupNewAppMutation = useMutation(ApiHandler.setupNewApp);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowTermsModal(true);
    }, 1000);
  }, []);

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
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 500,
        maxWidth: 500,
        selectionLimit: 1,
        quality: 0.4,
      });
      setProfileImage(result.assets[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const onSuccess = async () => {
    setIsLoading(false);
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    setKey(key);
    navigation.navigate(NavigationRoutes.ONBOARDINGSCREEN);
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
        mnemonic: route.params?.nodeConnectParams?.mnemonic || '',
        authToken: route.params?.nodeConnectParams?.authToken || '',
      });
    }, 200);
  };
  return (
    <ScreenContainer>
      <ProfileDetails
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => initiateWalletCreation()}
        // secondaryOnPress={() => navigation.goBack()}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage?.uri}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        // rightText={common.skip}
        // onRightTextPress={() => {
        //   initiateWalletCreation();
        // }}
        primaryStatus={setupNewAppMutation.status}
        primaryCTATitle={common.proceed}
        // secondaryCTATitle={common.skip}
        primaryCtaLoader={false}
        disabled={name.trim().length < 3}
      />
      <View>
        <ResponsePopupContainer
          visible={isLoading || setupNewAppMutation.status === 'loading'}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={onBoarding.profileSetupLoadingTitle}
            subTitle={onBoarding.profileSetupLoadingSubTitle}
            illustrationPath={require('src/assets/images/jsons/appCreation.json')}
          />
        </ResponsePopupContainer>
      </View>

      <Modal
        isVisible={showTermsModal}
        onDismiss={() => setShowTermsModal(false)}>
        <View style={styles.containerStyle}>
          <WebView
            source={{ uri: config.TERMS_AND_CONDITIONS_URL }}
            style={styles.webViewStyle}
          />

          <PrimaryCTA
            title={'I agree'}
            onPress={() => {
              setShowTermsModal(false);
            }}
            width={windowWidth - hp(50)}
            disabled={false}
            style={{ marginTop: hp(10), alignSelf: 'center' }}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

export default ProfileSetup;
