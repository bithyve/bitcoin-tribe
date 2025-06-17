import { Linking } from 'react-native';

export default async function openLink(urlPath: string) {
  try {
    const canOpen = await Linking.canOpenURL(urlPath);
    if (!canOpen) {
      throw new Error(`Cannot open URL: ${urlPath}`);
    }

    await Linking.openURL(urlPath);
  } catch (error) {
    console.error('Failed to open URL:', error);
    throw error;
  }
}
