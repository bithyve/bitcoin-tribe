import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import AddPicture from './components/AddPicture';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function ProfileSetup({ navigation }) {
  const [username, setUsername] = useState('');
  const [pickImage, setPickImage] = useState('');

  const PickImage = () => {
    console.log('pick');
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
        navigation={navigation}
      />
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
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  primaryCTAContainer: {
    marginTop: hp(50),
  },
});
export default ProfileSetup;
