import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Linking } from 'react-native';

const openSettings = () => {
  Linking.openSettings();
};

const pickImage = async (height = 300, width = 300, includeBase64 = false) => {
  try {
    const image = await ImagePicker.openPicker({
      width,
      height,
      cropping: true,
      multiple: false,
      compressImageQuality: 0.8,
      includeBase64,
      mediaType: 'photo',
      smartAlbums: ['PhotoStream', 'UserLibrary', 'Panoramas'],
    });
    if (includeBase64) {
      return image.data;
    }
    return image;
  } catch (error) {
    if (error.message === 'User did not grant library permission.') {
      Alert.alert(
        'Permission Denied',
        'You have denied the permission to access the photo library. Please enable it from the settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ],
      );
    } else {
      console.error(error);
    }
  }
};
export default pickImage;
