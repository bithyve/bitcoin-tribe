import React, { useContext, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import EditProfilePic from './EditProfilePic';
import ModalContainer from 'src/components/ModalContainer';
import SelectProfileMenu from './components/SelectProfileMenu';
import ChoosePhotoIcon from 'src/assets/images/chosePhotoIcon.svg';
import ChoosePhotoIconLight from 'src/assets/images/chosePhotoIcon_light.svg';
import { Keys } from 'src/storage';
import DeleteProfileIcon from 'src/assets/images/deleteProfile.svg';

type ProfileDetailsProps = {
  title: string;
  subTitle: string;
  onChangeText: (text: string) => void;
  inputValue: string;
  primaryOnPress: () => void;
  secondaryOnPress: () => void;
  addPicTitle: string;
  profileImage: string;
  handlePickImage: () => void;
  inputPlaceholder: string;
  edit?: boolean;
  onSettingsPress?: () => void;
  primaryStatus?: string;
  disabled?: boolean;
  primaryCTATitle: string;
  secondaryCTATitle?: string;
  rightText?: string;
  onRightTextPress?: () => void;
  primaryCtaLoader?: boolean;
  rightIcon?: React.ReactNode;
  enableEdit?: boolean;
  deleteProfile?: () => void;
};
function EditProfileDetails(props: ProfileDetailsProps) {
  const {
    title,
    subTitle,
    onChangeText,
    inputValue,
    primaryOnPress,
    secondaryOnPress,
    addPicTitle,
    profileImage,
    handlePickImage,
    inputPlaceholder,
    edit,
    onSettingsPress,
    primaryStatus,
    disabled,
    primaryCTATitle,
    secondaryCTATitle,
    rightText,
    onRightTextPress,
    primaryCtaLoader,
    rightIcon,
    enableEdit,
    deleteProfile,
  } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <AppHeader
        title={title}
        subTitle={subTitle}
        style={styles.wrapper}
        rightIcon={rightIcon}
        onSettingsPress={onSettingsPress}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        overScrollMode='never'
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <EditProfilePic
            title={addPicTitle}
            onPress={() => setVisible(true)}
            imageSource={profileImage}
            edit={edit}
          />
          <TextField
            value={inputValue}
            onChangeText={onChangeText}
            placeholder={inputPlaceholder}
            keyboardType={'default'}
            returnKeyType={'done'}
            // onSubmitEditing={primaryOnPress}
            //autoFocus={true}
            maxLength={15}
          />
        </View>
        <Buttons
          primaryTitle={primaryCTATitle}
          primaryOnPress={primaryOnPress}
          width={'100%'}
          disabled={disabled}
        />
      </KeyboardAwareScrollView>
      <ModalContainer
        title={'Edit profile picture'}
        subTitle={''}
        visible={visible}
        enableCloseIcon={false}
        onDismiss={() => {
          setVisible(false);
        }}>
        <>
          <SelectProfileMenu
            title={'Choose photo'}
            subTitle={''}
            icon={isThemeDark ? <ChoosePhotoIcon /> : <ChoosePhotoIconLight />}
            onPress={() => {
              setVisible(false);
              setTimeout(() => {
                handlePickImage();
              }, 1000);
            }}
          />
          <SelectProfileMenu
            title={'Delete photo'}
            subTitle={''}
            icon={<DeleteProfileIcon />}
            onPress={() => {
              setVisible(false);
              setTimeout(() => {
                deleteProfile();
              }, 1000);
            }}
            titleColor={theme.colors.removeProfileTitle}
          />
        </>
      </ModalContainer>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    marginTop: Platform.OS === 'android' ? hp(15) : 0,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  buttonsWrapper: {
    marginRight: hp(5),
    marginBottom: hp(3),
  },
  profileViewWrapper: {
    alignItems: 'center',
    marginTop: '15%',
  },
  usernameText: {
    marginTop: hp(10),
  },
});
export default EditProfileDetails;
