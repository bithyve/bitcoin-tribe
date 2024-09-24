import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

const openSettings = () => {
  Linking.openSettings();
};

// Request permission to access the photo library (for iOS)
async function requestPhotoLibraryPermission() {
  if (Platform.OS === 'ios') {
    // iOS doesn't need runtime permissions for CameraRoll, but we still check
    return true;
  } else {
    // Android requires explicit permission to access the photo library
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to save photos',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
}

const copyImageToPhotoLibrary = async imagePath => {
  const hasPermission = await requestPhotoLibraryPermission();
  if (!hasPermission) {
    console.log('Permission denied');
    Alert.alert(
      'Permission Denied',
      'You have denied the permission of your storage to save photos. Please enable it from the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ],
    );
    return;
  }

  try {
    // Save image to the photo library
    const result = await CameraRoll.save(imagePath, { type: 'photo' });
    return result;
  } catch (error) {
    console.error('Error saving image to photo library:', error);
    return error;
  }
};

export default copyImageToPhotoLibrary;
