import React, { useContext, useState, useEffect } from 'react';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ScreenContainer from 'src/components/ScreenContainer';
import realm from 'src/storage/realm/realm';
import { RealmSchema } from 'src/storage/enum';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet } = translations;
  const walletData = realm.get(RealmSchema.TribeApp)[0];

  const [name, setName] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (walletData && walletData.walletImage) {
      const base64Image = walletData.walletImage;
      setProfileImage(base64Image);
    } else if (walletData && walletData.appName) {
      setName(walletData.appName);
    } else {
      // Handle any other cases or provide a default behavior
    }
  }, []);

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
    </ScreenContainer>
  );
}
export default EditWalletProfile;
