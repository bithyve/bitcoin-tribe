import ImagePicker from 'react-native-image-crop-picker';

const pickImage = async () => {
  try {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      multiple: false,
      mediaType: 'photo',
      smartAlbums: [
        'Generic',
        'PhotoStream',
        'RecentlyAdded',
        'Regular',
        'LivePhotos',
        'SelfPortraits',
        'UserLibrary',
        'Panoramas',
        'Videos',
        'Bursts',
      ],
    });
    return image.path;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};
export default pickImage;
