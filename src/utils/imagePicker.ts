import ImagePicker from 'react-native-image-crop-picker';

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
    console.error('Error picking image:', error);
    throw error;
  }
};
export default pickImage;
