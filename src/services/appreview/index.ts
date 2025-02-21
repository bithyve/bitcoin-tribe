import InAppReview from 'react-native-in-app-review';

export const requestAppReview = async () => {
  const isAvailable = await InAppReview.isAvailable();
  if (isAvailable) {
    await InAppReview.RequestInAppReview();
  }
};
