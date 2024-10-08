import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ScreenContainer from 'src/components/ScreenContainer';
import { useQuery } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import { AppContext } from 'src/contexts/AppContext';
import { decrypt, hash512 } from 'src/utils/encryption';
import * as SecureStore from 'src/storage/secure-store';
import config from 'src/utils/config';

function ProfileSetup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  // const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initiateQuery, setInitiateQuery] = useState(false);
  const { setKey } = useContext(AppContext);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(true);
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const query = useQuery(
    'setup_app',
    async () => {
      return await ApiHandler.setupNewApp({
        appName: name,
        pinMethod: PinMethod.DEFAULT,
        passcode: '',
        walletImage: profileImage,
      });
    },
    {
      enabled: !!initiateQuery,
      onSuccess: () => {
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    },
  );

  useEffect(() => {
    if (query.status === 'success') {
      onSuccess();
    }
  }, [navigation, query.status]);

  const onSuccess = async () => {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    setKey(key);
    setLoading(false);
    setTimeout(
      () => {
        navigation.replace(NavigationRoutes.CREATEPIN, {
          OnBoarding: true,
        });
      },
      Platform.OS === 'ios' ? 400 : 100,
    );
  };

  const initiateWalletCreation = () => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      setInitiateQuery(true);
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
        secondaryOnPress={() => initiateWalletCreation()}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        rightText={common.skip}
        onRightTextPress={() => {
          initiateWalletCreation();
        }}
        primaryStatus={query.status}
        primaryCTATitle={common.next}
        primaryCtaLoader={loading}
        disabled={loading}
        // secondaryCTATitle={common.skip}
      />
    </ScreenContainer>
  );
}

export default ProfileSetup;
