import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp } from 'src/constants/responsive';
import AddPicture from 'src/components/AddPicture';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';

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
};
function ProfileDetails(props: ProfileDetailsProps) {
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
  } = props;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <>
      <AppHeader
        title={title}
        subTitle={subTitle}
        rightIcon={<SettingIcon />}
        onSettingsPress={onSettingsPress}
        style={styles.wrapper}
      />
      <KeyboardAvoidView>
        <AddPicture
          title={addPicTitle}
          onPress={handlePickImage}
          imageSource={profileImage}
          edit={edit}
        />
        <TextField
          value={inputValue}
          onChangeText={onChangeText}
          placeholder={inputPlaceholder}
          keyboardType={'default'}
          returnKeyType={'done'}
          onSubmitEditing={primaryOnPress}
          autoFocus={true}
        />
        <View style={styles.primaryCTAContainer}>
          <Buttons
            primaryTitle={common.next}
            secondaryTitle={common.cancel}
            primaryOnPress={primaryOnPress}
            secondaryOnPress={secondaryOnPress}
            primaryLoading={primaryStatus === 'loading'}
            disabled={disabled}
          />
        </View>
      </KeyboardAvoidView>
    </>
  );
}
const styles = StyleSheet.create({
  primaryCTAContainer: {
    marginTop: hp(50),
  },
  container: {
    padding: 0,
  },
  wrapper: {
    marginTop: 0,
  },
});
export default ProfileDetails;
