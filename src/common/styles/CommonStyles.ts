import { StyleSheet } from 'react-native';

import Fonts from 'src/constants/Fonts';

export default StyleSheet.create({
  heading1: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
  heading2: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },
  heading3: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Fonts.PoppinsMedium,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
  },
  body1: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
  },
  body2: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
  },
  body4: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsLight,
  },
  body5: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  body6: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsBold,
  },
  body7: {
    fontSize: 22,
    fontFamily: Fonts.PoppinsBold,
  },
  placeholder: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsBold,
  },
  toastMessage: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    paddingLeft: 10,
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: '600',
  },
  textFieldLabel: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    fontWeight: '600',
  },
  secondary: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle2: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  smallCTATitle: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsBold,
  },
  walletBalance: {
    fontSize: 39,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
