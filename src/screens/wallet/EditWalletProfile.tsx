import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from '@realm/react';
import { Keyboard } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ScreenContainer from 'src/components/ScreenContainer';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import EditProfileDetails from '../profile/EditProfileDetails';
import { Keys } from 'src/storage';

function EditWalletProfile({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, wallet, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [enableEdit, setEnableEdit] = useState(false);

  useEffect(() => {
    const fetchedName = app?.appName?.trim() || '';
    setInitialName(fetchedName);
    setName(fetchedName);
  }, []);

  const isSaveEnabled =
    (name.trim() !== '' && name.trim() !== initialName.trim()) || profileImage;

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        compressImageQuality: 0.4,
      });
      setProfileImage({
        uri: image.path,
        width: image.width,
        height: image.height,
        type: image.mime,
        fileName: image.filename,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateWalletProfile = async (skipProfileImage = false) => {
    setLoading(true);
    Keyboard.dismiss();
    const imageToSend = skipProfileImage ? null : profileImage;
    const updated = await ApiHandler.updateProfile(app.id, name, imageToSend);
    if (updated) {
      setLoading(false);
      Toast(wallet.profileUpdateMsg);
      setTimeout(() => {
        navigation.goBack();
      }, 200);
    } else {
      setLoading(false);
      Toast(wallet.profileUpdateErrMsg, true);
    }
  };

  return (
    <ScreenContainer>
      <ModalLoading visible={loading} />
      <EditProfileDetails
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
        onSettingsPress={() => setEnableEdit(!enableEdit)}
        enableEdit={enableEdit}
        deleteProfile={() => updateWalletProfile(true)}
      />
    </ScreenContainer>
  );
}
export default EditWalletProfile;
