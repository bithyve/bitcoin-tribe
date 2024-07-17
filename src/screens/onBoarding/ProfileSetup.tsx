import React, { useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ModalContainer from 'src/components/ModalContainer';
import CreatePin from './components/CreatePin';
import ScreenContainer from 'src/components/ScreenContainer';
import { useQuery } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import { AppContext } from 'src/contexts/AppContext';
import { stringToArrayBuffer } from 'src/utils/encryption';
import dbManager from 'src/storage/realm/dbManager';

function ProfileSetup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [visible, setVisible] = useState(false);
  const [initiateQuery, setInitiateQuery] = useState(false);
  const { setKey } = useContext(AppContext);

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const query = useQuery(
    'setup_app',
    async () => {
      return await ApiHandler.setupNewApp(
        name,
        PinMethod.DEFAULT,
        '',
        profileImage,
      );
    },
    {
      enabled: !!initiateQuery,
    },
  );

  useEffect(() => {
    if (query.status === 'success') {
      onSuccess();
    }
  }, [navigation, query.status]);

  const onSuccess = async () => {
    setKey('key');
    navigation.replace(NavigationRoutes.APPSTACK);
  };

  const initiateWalletCreation = () => {
    setInitiateQuery(true);
  };

  return (
    <ScreenContainer>
      <ProfileDetails
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => initiateWalletCreation()}
        secondaryOnPress={() => navigation.goBack()}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        onSettingsPress={() => {
          Keyboard.dismiss();
          setVisible(true);
        }}
        primaryStatus={query.status}
        disabled={name === ''}
      />
      <ModalContainer
        title={onBoarding.advanceSettingTitle}
        subTitle={onBoarding.enterPin}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <CreatePin />
      </ModalContainer>
    </ScreenContainer>
  );
}

export default ProfileSetup;
