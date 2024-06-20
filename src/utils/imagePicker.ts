import ImagePicker from 'react-native-image-crop-picker';

const pickImage = async () => {
  try {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      multiple: false,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      smartAlbums: ['PhotoStream', 'UserLibrary', 'Panoramas'],
    });
    return image.path;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};
export default pickImage;
