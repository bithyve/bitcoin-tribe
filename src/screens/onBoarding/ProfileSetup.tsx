import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import PrimaryCTA from 'src/components/PrimaryCTA';
import Toast from 'src/components/Toast';
import { hp, wp } from 'src/constants/responsive';
import AddPicture from './components/AddPicture';

function ProfileSetup({ navigation }) {
  const [username, setUsername] = useState('');
  return (
    <ScreenContainer>
      <AppHeader
        title="Enter your details"
        subTitle="Lorem ipsum dolor sit amet, c"
        navigation={navigation}
      />
      <AddPicture
        imageSource={null}
        // 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
      />
      <TextField
        value={username}
        onChangeText={text => setUsername(text)}
        placeholder="Enter Name"
        keyboardType={'default'}
      />
      <View style={styles.primaryCTAContainer}>
        <PrimaryCTA
          primaryTitle="Next"
          secondaryTitle="Cancel"
          primaryOnPress={() => navigation.navigate('Home')}
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
