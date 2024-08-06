import { Linking } from 'react-native';

export default async function openLink(urlPath: string) {
  try {
    await Linking.openURL(urlPath);
  } catch (error) {
    console.log(error);
  }
}
