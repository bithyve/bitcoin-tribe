import React, { useContext, useState } from 'react';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ModalContainer from 'src/components/ModalContainer';
import CreatePin from './components/CreatePin';
import ScreenContainer from 'src/components/ScreenContainer';

function ProfileSetup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [visible, setVisible] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <ScreenContainer>
      <ProfileDetails
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => navigation.replace(NavigationRoutes.APPSTACK)}
        secondaryOnPress={() => console.log('press')}
        addPicTitle={onBoarding.addPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        onSettingsPress={() => setVisible(true)}
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
