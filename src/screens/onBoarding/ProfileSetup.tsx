import React, { useContext, useEffect, useState } from 'react';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ModalContainer from 'src/components/ModalContainer';
import CreatePin from './components/CreatePin';
import ScreenContainer from 'src/components/ScreenContainer';
import { useQuery } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';

function ProfileSetup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [visible, setVisible] = useState(false);
  const [initiateQuery, setInitiateQuery] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };
  const query = useQuery(
    'create_wallet',
    async () => {
      return await ApiHandler.createNewWallet({
        instanceNum: 0,
        walletName: name,
        walletDescription: '',
      });
    },
    {
      enabled: !!initiateQuery,
    },
  );

  useEffect(() => {
    if (query.status === 'success') {
      navigation.navigate(NavigationRoutes.HOME);
    }
  }, [navigation, query.status]);

  const initiateWalletCreation = () => {
    setInitiateQuery(true);
  };

  // handle the query data here or from realm/react after persisting
  console.log(query.data);

  return (
    <ScreenContainer>
      <ProfileDetails
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => initiateWalletCreation()}
        secondaryOnPress={() => console.log('press')}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        onSettingsPress={() => setVisible(true)}
        primaryStatus={query.status}
      />
      <ModalContainer
        title={onBoarding.advanceSettingTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <CreatePin />
      </ModalContainer>
    </ScreenContainer>
  );
}

export default ProfileSetup;
