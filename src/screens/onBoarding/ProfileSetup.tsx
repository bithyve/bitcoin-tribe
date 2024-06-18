import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import AddPicture from 'src/components/AddPicture';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';

function ProfileSetup({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const [name, setName] = useState('');
  const [pickImage, setPickImage] = useState('');

  const PickImage = () => {
    launchImageLibrary(
      {
        title: 'Select a Image',
        mediaType: 'photo',
        takePhotoButtonTitle: null,
        selectionLimit: 1,
      },
      response => {
        console.log(response);
        if (response.assets) {
          setPickImage(response.assets[0].uri.replace('file://', ''));
        }
      },
    );
  };
  return (
    <ScreenContainer>
      <AppHeader
        title={onBoarding.profileSetupTitle}
        subTitle={onBoarding.profileSetupSubTitle}
        rightIcon={<SettingIcon />}
      />
      <KeyboardAvoidView>
        <AddPicture
          title={onBoarding.addPicture}
          onPress={() => PickImage()}
          imageSource={pickImage}
          // 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
        />
        <TextField
          value={name}
          onChangeText={text => setName(text)}
          placeholder={onBoarding.enterName}
          keyboardType={'default'}
        />
        <View style={styles.primaryCTAContainer}>
          <Buttons
            primaryTitle={common.next}
            secondaryTitle={common.cancel}
            primaryOnPress={() => navigation.navigate(NavigationRoutes.HOME)}
            secondaryOnPress={() => Toast('Secondary Pressed')}
            width={wp(120)}
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
    flex: 1,
  },
});
export default ProfileSetup;
