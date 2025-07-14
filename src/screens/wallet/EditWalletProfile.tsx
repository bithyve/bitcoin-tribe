import React, { useContext, useEffect, useState } from 'react';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import pickImage from 'src/utils/imagePicker';
import ScreenContainer from 'src/components/ScreenContainer';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { Keyboard } from 'react-native';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet, common } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(app.walletImage);
  const [loading, setLoading] = useState('');
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    const fetchedName = app?.appName?.trim() || '';
    setInitialName(fetchedName);
    setName(fetchedName);
  }, []);

  const isSaveEnabled =
    name.trim() !== '' && name.trim() !== initialName.trim();

  const handlePickImage = async () => {
    try {
      const result = await pickImage(true);
      setProfileImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const updateWalletProfile = async () => {
    Keyboard.dismiss();
    setLoading('loading');
    const updated = await ApiHandler.updateProfile(app.id, name, profileImage);
    if (updated) {
      setLoading('');
      Toast(wallet.profileUpdateMsg);
      setTimeout(() => {
        navigation.goBack();
      }, 200);
    } else {
      setLoading('');
      Toast(wallet.profileUpdateErrMsg, true);
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
        disabled={!isSaveEnabled}
        primaryCTATitle={common.save}
        primaryStatus={loading}
        secondaryCTATitle={common.cancel}
      />
    </ScreenContainer>
  );
}
export default EditWalletProfile;
