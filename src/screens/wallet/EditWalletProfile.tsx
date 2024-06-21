import React, { useContext, useState } from 'react';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet } = translations;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <ProfileDetails
      title={wallet.walletNamePic}
      subTitle={wallet.walletNamePicSubTitle}
      onChangeText={text => setName(text)}
      inputValue={name}
      primaryOnPress={() => navigation.navigate(NavigationRoutes.HOME)}
      secondaryOnPress={() => navigation.goBack()}
      addPicTitle={wallet.editPicture}
      profileImage={profileImage}
      handlePickImage={() => handlePickImage()}
      inputPlaceholder={onBoarding.enterName}
      edit={true}
    />
  );
}
export default EditWalletProfile;
