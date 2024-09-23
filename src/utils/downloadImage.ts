import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'src/components/Toast';

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
    return;
  }

  try {
    // Save image to the photo library
    const result = await CameraRoll.save(imagePath, { type: 'photo' });
    Toast('Asset Image saved successfully');
  } catch (error) {
    Toast('Failed to save asset');
    console.error('Error saving image to photo library:', error);
  }
};

export default copyImageToPhotoLibrary;
