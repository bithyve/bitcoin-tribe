import * as RNFS from '@dr.pogodin/react-native-fs';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

const openSettings = () => {
  Linking.openSettings();
};

async function requestPhotoLibraryPermission() {
  if (Platform.OS === 'ios') {
    return true;
  } else {
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

export const copyImageToPhotoLibrary = async imagePath => {
  const hasPermission = await requestPhotoLibraryPermission();
  if (!hasPermission) {
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
    const originalFileName = imagePath.split('/').pop();
    let targetPath;
    if (Platform.OS === 'android') {
      targetPath = `${RNFS.DownloadDirectoryPath}/${originalFileName}`;
      await RNFS.copyFile(imagePath, targetPath);
      await RNFS.scanFile(targetPath);
    } else if (Platform.OS === 'ios') {
      targetPath = `${RNFS.LibraryDirectoryPath}/${originalFileName}`;
      await RNFS.copyFile(imagePath, targetPath);
    }
    return targetPath;
  } catch (error) {
    return null;
  }
};

