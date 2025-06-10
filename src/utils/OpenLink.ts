import { Linking } from 'react-native';
import logger from 'src/utils/logger';

export default async function openLink(urlPath: string) {
  try {
    await Linking.openURL(urlPath);
  } catch (error) {
    logger.error(error);
  }
}
