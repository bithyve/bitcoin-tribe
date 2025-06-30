import React, { useContext, useEffect, useState } from 'react';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ProfileDetails from '../profile/ProfileDetails';
import ScreenContainer from 'src/components/ScreenContainer';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import ModalLoading from 'src/components/ModalLoading';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet, common } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    const fetchedName = app?.appName?.trim() || '';
    setInitialName(fetchedName);
    setName(fetchedName);
  }, []);

  const isSaveEnabled =
    (name.trim() !== '' && name.trim() !== initialName.trim()) || profileImage;

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 500,
        maxWidth: 500,
        selectionLimit: 1,
      })
      setProfileImage(result.assets[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateWalletProfile = async () => {
    setLoading(true);
    const updated = await ApiHandler.updateProfile(app.id, name, profileImage);
    if (updated) {
      setLoading(false);
      Toast(wallet.profileUpdateMsg);
      navigation.goBack();
    } else {
      setLoading(false);
      Toast(wallet.profileUpdateErrMsg, true);
    }
  };

  return (
    <ScreenContainer>
      <ModalLoading visible={loading} />
      <ProfileDetails
        title={wallet.walletNamePic}
        subTitle={wallet.walletNamePicSubTitle}
        onChangeText={text => setName(text)}
        inputValue={name}
        primaryOnPress={() => updateWalletProfile()}
        secondaryOnPress={() => navigation.goBack()}
        addPicTitle={wallet.editPicture}
        profileImage={profileImage?.uri || app.walletImage}
        handlePickImage={() => handlePickImage()}
        inputPlaceholder={onBoarding.enterName}
        edit={true}
        disabled={!isSaveEnabled}
        primaryCTATitle={common.save}
        primaryStatus={loading ? 'loading' : ''}
        secondaryCTATitle={common.cancel}
      />
    </ScreenContainer>
  );
}
export default EditWalletProfile;
