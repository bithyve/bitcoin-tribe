import { Dimensions } from 'react-native';

export const windowHeight: number = Dimensions.get('screen').height;
export const windowWidth: number = Dimensions.get('window').width;
// getTransactionPadding - use for responsive padding
export const getTransactionPadding = () => windowHeight * 0.047;
// hp - use for responsive height
export const hp = (height: number) => (height / 812) * windowHeight;
// wp - use for responsive width
export const wp = (width: number) => (width / 375) * windowWidth;
