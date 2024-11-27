import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp, windowHeight } from 'src/constants/responsive';
import AddPicture from 'src/components/AddPicture';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import ModalLoading from 'src/components/ModalLoading';

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
    primaryCTATitle,
    secondaryCTATitle,
    rightText,
    onRightTextPress,
    primaryCtaLoader,
  } = props;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();

  return (
    <>
      <AppHeader
        title={title}
        subTitle={subTitle}
        rightText={rightText}
        onRightTextPress={onRightTextPress}
        style={styles.wrapper}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={'padding'}
        enabled
        keyboardVerticalOffset={Platform.select({
          ios: windowHeight > 670 ? 0 : 5,
          android: 0,
        })}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
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
              //autoFocus={true}
              maxLength={15}
            />
          </View>
          <Buttons
            primaryTitle={primaryCTATitle}
            secondaryTitle={secondaryCTATitle}
            primaryOnPress={primaryOnPress}
            secondaryOnPress={secondaryOnPress}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
});
export default ProfileDetails;
