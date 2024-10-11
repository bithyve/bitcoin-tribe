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
  greenText: string;
  accent4: string;
  accent5: string;
  tagText: string;
  secondaryCTAGradient1: string;
  secondaryCTAGradient2: string;
  secondaryCTAGradient3: string;
  sendCtaBorderColor: string;
  recieveCtaBorderColor: string;
  roundSendCTAGradient1: string;
  roundSendCTAGradient2: string;
  roundSendCTAGradient3: string;
  roundReceiveCTAGradient1: string;
  roundReceiveCTAGradient2: string;
  roundReceiveCTAGradient3: string;
  roundSendCTATitle: string;
  roundReceiveCTATitle: string;
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
    primaryBackground: Colors.GhostWhite,
    cardGradient1: Colors.White,
    cardGradient2: Colors.White,
    cardGradient3: Colors.White,
    borderColor: Colors.Platinum,
    headingColor: Colors.ChineseBlack,
    secondaryHeadingColor: Colors.SonicSilver,
    bodyColor: Colors.ChineseBlack,
    secondaryCtaTitleColor: Colors.BrandeisBlue,
    ctaBackColor: Colors.BrandeisBlue,
    disableCtaBackColor: Colors.ChineseWhite,
    inputBackground: Colors.White,
    profileBackground: Colors.Black,
    accent1: Colors.BrandeisBlue,
    primaryCTAText: Colors.White,
    tagText: Colors.Black,
    disablePrimaryCTAText: Colors.SonicSilver,
    accent2: Colors.BrandeisBlue,
    activeTabColor: Colors.BrandeisBlue,
    toggleBackground: Colors.Golden,
    toggleButtonColor: Colors.White,
    toggleInActiveBtnColor: Colors.DimGray,
    toggleInActiveBackColor: Colors.Arsenic,
    modalBackColor: Colors.GhostWhite,
    coinsBorderColor: Colors.BrandeisBlue,
    successPopupBackColor: Colors.UFOGreen,
    successPopupBorderColor: Colors.UFOGreen1,
    disableCTATitle: Colors.Gray,
    greenText: Colors.Green,
    cardBackground: Colors.White,
    accent4: Colors.Golden,
    accent5: Colors.TurquoiseBlue,
    secondaryCTAGradient1: Colors.Lavender,
    secondaryCTAGradient2: Colors.Lavender,
    secondaryCTAGradient3: Colors.Lavender,
    sendCtaBorderColor: Colors.CandyAppleRed,
    recieveCtaBorderColor: Colors.UFOGreen1,
    roundSendCTAGradient1: Colors.CandyAppleRed1,
    roundSendCTAGradient2: Colors.CandyAppleRed1,
    roundSendCTAGradient3: Colors.CandyAppleRed1,
    roundReceiveCTAGradient1: Colors.UFOGreen2,
    roundReceiveCTAGradient2: Colors.UFOGreen2,
    roundReceiveCTAGradient3: Colors.UFOGreen2,
    roundSendCTATitle: Colors.CandyAppleRed,
    roundReceiveCTATitle: Colors.UFOGreen1,
    //
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
    secondaryHeadingColor: Colors.SonicSilver,
    bodyColor: Colors.Quartz,
    secondaryCtaTitleColor: Colors.White,
    ctaBackColor: Colors.White,
    disableCtaBackColor: Colors.ChineseWhite,
    inputBackground: Colors.CharlestonGreen,
    profileBackground: Colors.Black,
    accent1: Colors.Golden,
    primaryCTAText: Colors.Black,
    tagText: Colors.Black,
    disablePrimaryCTAText: Colors.SonicSilver,
    accent2: Colors.TurquoiseBlue,
    activeTabColor: Colors.White,
    toggleBackground: Colors.Golden,
    toggleButtonColor: Colors.White,
    toggleInActiveBtnColor: Colors.DimGray,
    toggleInActiveBackColor: Colors.Arsenic,
    modalBackColor: Colors.EerieBlack,
    coinsBorderColor: Colors.BrandeisBlue,
    successPopupBackColor: Colors.UFOGreen,
    successPopupBorderColor: Colors.UFOGreen1,
    disableCTATitle: Colors.Gray,
    greenText: Colors.Green,
    cardBackground: Colors.RaisinBlack,
    accent4: Colors.Golden,
    accent5: Colors.TurquoiseBlue,
    secondaryCTAGradient1: Colors.EerieBlack,
    secondaryCTAGradient2: Colors.VampireBlack,
    secondaryCTAGradient3: Colors.ChineseBlack,
    sendCtaBorderColor: Colors.Golden,
    recieveCtaBorderColor: Colors.TurquoiseBlue,
    roundSendCTAGradient1: Colors.EerieBlack,
    roundSendCTAGradient2: Colors.VampireBlack,
    roundSendCTAGradient3: Colors.ChineseBlack,
    roundReceiveCTAGradient1: Colors.EerieBlack,
    roundReceiveCTAGradient2: Colors.VampireBlack,
    roundReceiveCTAGradient3: Colors.ChineseBlack,
    roundSendCTATitle: Colors.White,
    roundReceiveCTATitle: Colors.White,
    //
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
