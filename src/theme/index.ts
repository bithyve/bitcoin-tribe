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
  roundBuyCTATitle: string;
  roundReceiveCTATitle: string;
  segmentSelectTitle: string;
  successPopupTitleColor: string;
  popupCTABackColor: string;
  popupCTATitleColor: string;
  popupSentCTATitleColor: string;
  popupText: string;
  suggestedText: string;
  btcCtaBackColor: string;
  lightningCtaBackColor: string;
  roundBuyCTAGradient1: string;
  roundBuyCTAGradient2: string;
  roundBuyCTAGradient3: string;
  buyCtaBorderColor: string;
  backupDoneBorder: string;
  closeChannelCTA: string;
  closeChannelCTATitle: string;
  assetsProgressFill: string;
  assetsProgressRemaining: string;
  satsProgressFill: string;
  satsProgressRemaining: string;
  errorPopupBackColor: string;
  errorPopupBorderColor: string;
  headerCardGradientColor: string;
  popupSentCTABackColor: string;
  assetCardGradient1: string;
  assetCardGradient2: string;
  assetCardGradient3: string;
  assetCardVerticalBorder: string;
  assetBalanceBackColor: string;
  appBackupStepLabel: string;
  swipeToActionThumbColor: string;
  errorBorderColor: string;
  serviceFeeBorder: string;
  txIDColor: string;
  settingMenuHeader: string;
  backupAlertBackColor: string;
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
    headerCardGradientColor: Colors.GhostWhite,
    borderColor: Colors.Platinum,
    headingColor: Colors.ChineseBlack,
    secondaryHeadingColor: Colors.SonicSilver,
    bodyColor: Colors.ChineseBlack,
    secondaryCtaTitleColor: Colors.BrandeisBlue,
    ctaBackColor: Colors.BrandeisBlue,
    popupCTABackColor: Colors.White,
    popupSentCTABackColor: Colors.BrandeisBlue,
    popupCTATitleColor: Colors.Black,
    popupSentCTATitleColor: Colors.White,
    popupText: Colors.White,
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
    successPopupTitleColor: Colors.White,
    successPopupBackColor: Colors.GOGreen,
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
    buyCtaBorderColor: Colors.BrandeisBlue,
    roundSendCTAGradient1: Colors.CandyAppleRed1,
    roundSendCTAGradient2: Colors.CandyAppleRed1,
    roundSendCTAGradient3: Colors.CandyAppleRed1,
    roundReceiveCTAGradient1: Colors.UFOGreen2,
    roundReceiveCTAGradient2: Colors.UFOGreen2,
    roundReceiveCTAGradient3: Colors.UFOGreen2,
    roundBuyCTAGradient1: Colors.BrandeisBlue2,
    roundBuyCTAGradient2: Colors.BrandeisBlue2,
    roundBuyCTAGradient3: Colors.BrandeisBlue2,
    roundSendCTATitle: Colors.ChineseBlack,
    roundBuyCTATitle: Colors.ChineseBlack,
    roundReceiveCTATitle: Colors.ChineseBlack,
    segmentSelectTitle: Colors.BrandeisBlue,
    suggestedText: Colors.White,
    //
    primaryCTA: Colors.ChineseOrange,
    accent3: Colors.SilverSand,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
    cardShadowColor: Colors.White,
    disabledCTAColor: Colors.DarkSalmon,
    btcCtaBackColor: Colors.TennesseeOrange,
    lightningCtaBackColor: Colors.Golden,
    backupDoneBorder: Colors.GOGreen,
    closeChannelCTA: Colors.FireOpal,
    closeChannelCTATitle: Colors.White,
    assetsProgressFill: Colors.Turquoise,
    assetsProgressRemaining: Colors.Cyclamen,
    satsProgressFill: Colors.VioletsAreBlue,
    satsProgressRemaining: Colors.DeepSaffron,
    errorPopupBackColor: Colors.FireOpal2,
    errorPopupBorderColor: Colors.FireOpal,
    assetCardGradient1: Colors.White,
    assetCardGradient2: Colors.White,
    assetCardGradient3: Colors.White,
    assetCardVerticalBorder: Colors.Platinum,
    assetBalanceBackColor: Colors.BrandeisBlue,
    appBackupStepLabel: Colors.BrandeisBlue,
    swipeToActionThumbColor: Colors.BrandeisBlue,
    errorBorderColor: Colors.ImperialRed,
    serviceFeeBorder: Colors.SonicSilver,
    txIDColor: Colors.BrandeisBlue,
    settingMenuHeader: Colors.BrightGray,
    backupAlertBackColor: Colors.VividGamboge,
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
    headerCardGradientColor: Colors.Black,
    borderColor: Colors.DarkCharcoal,
    headingColor: Colors.White,
    secondaryHeadingColor: Colors.SonicSilver,
    bodyColor: Colors.Quartz,
    secondaryCtaTitleColor: Colors.White,
    ctaBackColor: Colors.White,
    popupCTABackColor: Colors.White,
    popupSentCTABackColor: Colors.White,
    popupCTATitleColor: Colors.Black,
    popupSentCTATitleColor: Colors.Black,
    popupText: Colors.White,
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
    successPopupTitleColor: Colors.White,
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
    buyCtaBorderColor: Colors.BrandeisBlue,
    roundSendCTAGradient1: Colors.EerieBlack,
    roundSendCTAGradient2: Colors.VampireBlack,
    roundSendCTAGradient3: Colors.ChineseBlack,
    roundReceiveCTAGradient1: Colors.EerieBlack,
    roundReceiveCTAGradient2: Colors.VampireBlack,
    roundReceiveCTAGradient3: Colors.ChineseBlack,
    roundBuyCTAGradient1: Colors.EerieBlack,
    roundBuyCTAGradient2: Colors.VampireBlack,
    roundBuyCTAGradient3: Colors.ChineseBlack,
    roundSendCTATitle: Colors.White,
    roundBuyCTATitle: Colors.White,
    roundReceiveCTATitle: Colors.White,
    segmentSelectTitle: Colors.White,
    suggestedText: Colors.Black,
    //
    primaryCTA: Colors.ChineseOrange,
    accent3: Colors.SilverSand,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
    cardShadowColor: Colors.White,
    disabledCTAColor: Colors.DarkSalmon,
    btcCtaBackColor: Colors.TennesseeOrange,
    lightningCtaBackColor: Colors.Golden,
    backupDoneBorder: Colors.UFOGreen1,
    closeChannelCTA: Colors.FireOpal,
    closeChannelCTATitle: Colors.White,
    assetsProgressFill: Colors.Turquoise,
    assetsProgressRemaining: Colors.Cyclamen,
    satsProgressFill: Colors.VioletsAreBlue,
    satsProgressRemaining: Colors.DeepSaffron,
    errorPopupBackColor: Colors.FireOpal2,
    errorPopupBorderColor: Colors.FireOpal,
    assetCardGradient1: Colors.ZinnwalditeBrown,
    assetCardGradient2: Colors.VampireBlack,
    assetCardGradient3: Colors.SacramentoStateGreen,
    assetCardVerticalBorder: Colors.Arsenic,
    assetBalanceBackColor: Colors.Golden,
    appBackupStepLabel: Colors.Golden,
    swipeToActionThumbColor: Colors.Golden,
    errorBorderColor: Colors.ImperialRed,
    serviceFeeBorder: Colors.SonicSilver,
    txIDColor: Colors.BrandeisBlue,
    settingMenuHeader: Colors.CharlestonGreen,
    backupAlertBackColor: Colors.VividGamboge,
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
