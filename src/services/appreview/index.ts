import InAppReview from 'react-native-in-app-review';
import config, { APP_STAGE } from 'src/utils/config';

export const requestAppReview = async () => {
  if(config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
    return;
  }
  const isAvailable = await InAppReview.isAvailable();
  if (isAvailable) {
    await InAppReview.RequestInAppReview();
  }
};
