import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';

const defaultOptions: ImageLibraryOptions = {
  title: 'Select a Image',
  mediaType: 'photo',
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 1,
  includeBase64: false,
  takePhotoButtonTitle: null,
  selectionLimit: 1,
};

const pickImage = (options = defaultOptions) => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        reject('User cancelled image picker');
      } else if (response.errorCode) {
        reject(`Image Picker Error: ${response.errorCode}`);
      } else if (response.assets && response.assets.length > 0) {
        resolve(response.assets[0].uri.replace('file://', ''));
      } else {
        reject('Unknown error');
      }
    });
  });
};

export default pickImage;
