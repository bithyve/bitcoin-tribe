import { Platform } from 'react-native';

export default Platform.select({
  android: {
    LufgaRegular: 'LufgaRegular',
    LufgaMedium: 'LufgaMedium',
    LufgaBold: 'LufgaBold',
    LufgaSemiBold: 'LufgaSemiBold',
    LufgaLight: 'LufgaLight',
  },
  ios: {
    LufgaRegular: 'Lufga-Regular',
    LufgaMedium: 'Lufga-Medium',
    LufgaBold: 'Lufga-Bold',
    LufgaSemiBold: 'Lufga-SemiBold',
    LufgaLight: 'Lufga-Light',
  },
});
