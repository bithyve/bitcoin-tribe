import { Platform } from 'react-native';

export default Platform.select({
  android: {
    LufgaRegular: 'LufgaRegular',
    LufgaMedium: 'LufgaMedium',
    LufgaBold: 'LufgaBold',
    LufgaSemiBold: 'LufgaSemiBold',
  },
  ios: {
    LufgaRegular: 'Lufga-Regular',
    LufgaMedium: 'Lufga-Medium',
    LufgaBold: 'Lufga-Bold',
    LufgaSemiBold: 'Lufga-SemiBold',
  },
});
