import React, { useContext, useState } from 'react';

import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ScreenContainer from 'src/components/ScreenContainer';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet, common } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const [name, setName] = useState(app.appName);
  const [profileImage, setProfileImage] = useState(app.walletImage);
  const [loading, setLoading] = useState('');

  const handlePickImage = async () => {
    try {
      const result = await pickImage(300, 300, true);
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const updateWalletProfile = async () => {
    setLoading('loading');
    const updated = await ApiHandler.updateProfile(app.id, name, profileImage);
    if (updated) {
      setLoading('');
      Toast(wallet.profileUpdateMsg, true);
      navigation.navigate(NavigationRoutes.WALLETDETAILS, {
        autoRefresh: true,
      });
    } else {
      setLoading('');
      Toast(wallet.profileUpdateErrMsg, false, true);
    }
  };

  return (
    <ScreenContainer>
      <ProfileDetails
        title={wallet.walletNamePic}
        subTitle={wallet.walletNamePicSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => updateWalletProfile()}
        secondaryOnPress={() => navigation.goBack()}
        addPicTitle={wallet.editPicture}
        profileImage={profileImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        edit={true}
        disabled={name === ''}
        primaryCTATitle={common.save}
        primaryStatus={loading}
      />
    </ScreenContainer>
  );
}
export default EditWalletProfile;
