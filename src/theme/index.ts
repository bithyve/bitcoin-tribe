import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { MD2LightTheme, MD2DarkTheme, MD2Theme } from 'react-native-paper';
import Colors from './Colors';
import Fonts from 'src/constants/Fonts';

type CustomColors = {
  primaryBackground: string;
  cardBackground: string;
  primaryCTA: string;
  accent1: string;
  accent2: string;
  accent3: string;
  inputBackground: string;
  headingColor: string;
  bodyColor: string;
  placeholder: string;
  primaryText: string;
  profileBackground: string;
  toggleBackground: string;
  borderColor: string;
  shodowColor: string;
  inActiveDotColor: string;
  cardShadowColor: string;
  disabledCTAColor: string;
  //New UX
  cardGradient1: string;
  cardGradient2: string;
  cardGradient3: string;
  secondaryCtaTitleColor: string;
  ctaBackColor: string;
  disableCtaBackColor: string;
  secondaryHeadingColor: string;
  primaryCTAText: string;
  disablePrimaryCTAText: string;
  activeTabColor: string;
  toggleButtonColor: string;
  toggleInActiveBtnColor: string;
  toggleInActiveBackColor: string;
  modalBackColor: string;
  coinsBorderColor: string;
  successPopupBackColor: string;
  successPopupBorderColor: string;
  disableCTATitle: string;
};

type PaperColors = MD2Theme['colors'];
type Colors = PaperColors & CustomColors;
export interface AppTheme extends MD2Theme {
  colors: Colors;
}

const CombinedDefaultTheme: AppTheme = {
  ...MD2LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD2LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    // New UX
    primaryBackground: Colors.Black,
    cardGradient1: Colors.EerieBlack,
    cardGradient2: Colors.VampireBlack,
    cardGradient3: Colors.ChineseBlack,
    borderColor: Colors.DarkCharcoal,
    headingColor: Colors.White,
    secondaryHeadingColor: Colors.Quartz,
    bodyColor: Colors.White,
    secondaryCtaTitleColor: Colors.White,
    ctaBackColor: Colors.White,
    disableCtaBackColor: Colors.ChineseWhite,
    inputBackground: Colors.CharlestonGreen,
    profileBackground: Colors.Black,
    accent1: Colors.Golden,
    primaryCTAText: Colors.Black,
    disablePrimaryCTAText: Colors.SonicSilver,
    accent2: Colors.TurquoiseBlue,
    activeTabColor: Colors.White,
    toggleBackground: Colors.Golden,
    toggleButtonColor: Colors.White,
    toggleInActiveBtnColor: Colors.DimGray,
    toggleInActiveBackColor: Colors.Arsenic,
    modalBackColor: Colors.EerieBlack,
    coinsBorderColor: Colors.Celadon,
    successPopupBackColor: Colors.UFOGreen,
    successPopupBorderColor: Colors.UFOGreen1,
    disableCTATitle: Colors.Gray,
    //
    cardBackground: Colors.RaisinBlack,
    primaryCTA: Colors.ChineseOrange,
    accent3: Colors.SilverSand,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
    cardShadowColor: Colors.White,
    disabledCTAColor: Colors.DarkSalmon,
  },
  fonts: {
    regular: {
      fontFamily: Fonts.LufgaRegular,
    },
    medium: {
      fontFamily: Fonts.LufgaMedium,
    },
    light: {
      fontFamily: Fonts.LufgaRegular,
    },
    thin: {
      fontFamily: Fonts.LufgaRegular,
    },
  },
};
const CombinedDarkTheme: AppTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    // New UX
    primaryBackground: Colors.Black,
    cardGradient1: Colors.EerieBlack,
    cardGradient2: Colors.VampireBlack,
    cardGradient3: Colors.ChineseBlack,
    borderColor: Colors.DarkCharcoal,
    headingColor: Colors.White,
    secondaryHeadingColor: Colors.Quartz,
    bodyColor: Colors.Quartz,
    secondaryCtaTitleColor: Colors.White,
    ctaBackColor: Colors.White,
    disableCtaBackColor: Colors.ChineseWhite,
    inputBackground: Colors.CharlestonGreen,
    profileBackground: Colors.Black,
    accent1: Colors.Golden,
    primaryCTAText: Colors.Black,
    disablePrimaryCTAText: Colors.SonicSilver,
    accent2: Colors.TurquoiseBlue,
    activeTabColor: Colors.White,
    toggleBackground: Colors.Golden,
    toggleButtonColor: Colors.White,
    toggleInActiveBtnColor: Colors.DimGray,
    toggleInActiveBackColor: Colors.Arsenic,
    modalBackColor: Colors.EerieBlack,
    coinsBorderColor: Colors.Celadon,
    successPopupBackColor: Colors.UFOGreen,
    successPopupBorderColor: Colors.UFOGreen1,
    disableCTATitle: Colors.Gray,
    //
    cardBackground: Colors.RaisinBlack,
    primaryCTA: Colors.ChineseOrange,
    accent3: Colors.SilverSand,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
    cardShadowColor: Colors.White,
    disabledCTAColor: Colors.DarkSalmon,
  },
  fonts: {
    regular: {
      fontFamily: Fonts.LufgaRegular,
    },
    medium: {
      fontFamily: Fonts.LufgaMedium,
    },
    light: {
      fontFamily: Fonts.LufgaRegular,
    },
    thin: {
      fontFamily: Fonts.LufgaRegular,
    },
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };
