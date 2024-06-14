import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import AddPicture from './components/AddPicture';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import ModalContainer from 'src/components/ModalContainer';
import CreatePin from './components/CreatePin';

function ProfileSetup({ navigation }) {
  const [username, setUsername] = useState('');
  const [pickImage, setPickImage] = useState('');
  const [visible, setVisible] = useState(false);

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
        title="Enter your details"
        subTitle="Lorem ipsum dolor sit amet, c"
        rightIcon={<SettingIcon />}
        onSettingsPress={() => setVisible(true)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AddPicture
            onPress={() => PickImage()}
            imageSource={pickImage}
            // 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          />
          <TextField
            value={username}
            onChangeText={text => setUsername(text)}
            placeholder="Enter Name"
            keyboardType={'default'}
          />
          <View style={styles.primaryCTAContainer}>
            <Buttons
              primaryTitle="Next"
              secondaryTitle="Cancel"
              primaryOnPress={() => navigation.navigate(NavigationRoutes.HOME)}
              secondaryOnPress={() => Toast('Secondary Pressed')}
              width={wp(120)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalContainer
        title="Advanced Lorem"
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <CreatePin />
      </ModalContainer>
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
