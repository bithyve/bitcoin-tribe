import { StyleSheet } from 'react-native';

import Fonts from 'src/constants/Fonts';

export default StyleSheet.create({
  heading1: {
    fontSize: 25,
    fontWeight: '400',
    fontFamily: Fonts.LufgaMedium,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.LufgaMedium,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: Fonts.LufgaMedium,
  },
  pageTitle1: {
    fontSize: 48,
    fontWeight: '500',
    lineHeight: 60,
    fontFamily: Fonts.LufgaMedium,
  },
  //page title should be removed
  pageTitle2: {
    fontSize: 25,
    fontWeight: '400',
    fontFamily: Fonts.LufgaMedium,
  },
  //end
  subTitle: {
    fontSize: 14,
    fontFamily: Fonts.LufgaRegular,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Fonts.LufgaRegular,
  },
  body2: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.LufgaRegular,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.LufgaRegular,
  },
  // Should be removed - body 3, 4, 5, 6 and 7
  body3: {
    fontSize: 16,
    fontFamily: Fonts.LufgaRegular,
  },
  body4: {
    fontSize: 16,
    fontFamily: Fonts.LufgaLight,
  },
  body5: {
    fontSize: 12,
    fontFamily: Fonts.LufgaSemiBold,
  },
  body6: {
    fontSize: 18,
    fontFamily: Fonts.LufgaBold,
  },
  body7: {
    fontSize: 22,
    fontFamily: Fonts.LufgaBold,
  },
  // end
  placeholder: {
    fontSize: 14,
    fontFamily: Fonts.LufgaBold,
  },
  textFieldLabel: {
    fontSize: 16,
    fontFamily: Fonts.LufgaRegular,
    fontWeight: '400',
  },
  secondaryCta: {
    fontSize: 13,
    fontFamily: Fonts.LufgaSemiBold,
  },
  subtitle2: {
    fontSize: 14,
    fontFamily: Fonts.LufgaSemiBold,
  },
  smallCTA: {
    fontSize: 12,
    fontFamily: Fonts.LufgaBold,
  },
  walletBalance: {
    fontSize: 39,
    fontFamily: Fonts.LufgaSemiBold,
  },
});
