import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import AddPicture from 'src/components/AddPicture';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import ScreenContainer from 'src/components/ScreenContainer';

type ProfileDetailsProps = {
  title: string;
  subTitle: string;
  onChangeText: () => void;
  inputValue: string;
  primaryOnPress: () => void;
  secondaryOnPress: () => void;
  addPicTitle: string;
  profileImage: string;
  handlePickImage: () => void;
  inputPlaceholder: string;
  edit?: boolean;
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
  } = props;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={title}
        subTitle={subTitle}
        rightIcon={<SettingIcon />}
        style={styles.wrapper}
      />
      <KeyboardAvoidView style={styles.wrapper}>
        <AddPicture
          title={addPicTitle}
          onPress={handlePickImage}
          imageSource={profileImage}
          edit={edit}
          // 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
        />
        <TextField
          value={inputValue}
          onChangeText={onChangeText}
          placeholder={inputPlaceholder}
          keyboardType={'default'}
        />
        <View style={styles.primaryCTAContainer}>
          <Buttons
            primaryTitle={common.next}
            secondaryTitle={common.cancel}
            primaryOnPress={primaryOnPress}
            secondaryOnPress={secondaryOnPress}
          />
        </View>
      </KeyboardAvoidView>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  primaryCTAContainer: {
    marginTop: hp(50),
  },
  container: {
    // flex: 1,
    padding: 0,
  },
  wrapper: {
    paddingHorizontal: hp(20),
  },
});
export default ProfileDetails;
