import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Linking } from 'react-native';

const openSettings = () => {
  Linking.openSettings();
};

const requestPermission = async () => {
  if (Platform.OS === 'android') {
    return await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
  }
  // On iOS, permission is handled automatically when you access the library.
  return true;
};

const pickImage = async (includeBase64 = false) => {
  const permission = await requestPermission();
  if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
    Alert.alert(
      'Permission Denied',
      'You have denied the permission to access the photo library. Please enable it from the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ],
    );

    return null;
  }
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: includeBase64,
        maxHeight: 500,
        maxWidth: 500,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve(null); // Resolve with null if the user cancels
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
          reject(response.error); // Reject the promise if there's an error
        } else if (response.assets && response.assets.length > 0) {
          const uri = includeBase64
            ? response.assets[0].base64
            : response.assets[0].uri;
          resolve(uri); // Resolve with the URI or base64 string
        } else {
          resolve(null); // Resolve with null if no assets are found
        }
      },
    );
  });
};

export default pickImage;
