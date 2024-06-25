import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

import { MD2LightTheme, MD2DarkTheme, MD2Theme } from 'react-native-paper';

import Colors from './Colors';

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
    primaryBackground: Colors.RaisinBlack,
    cardBackground: Colors.RaisinBlack,
    primaryCTA: Colors.ChineseOrange,
    accent1: Colors.SelectiveYellow,
    accent2: Colors.Eucalyptus,
    accent3: Colors.SilverSand,
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyColor: Colors.DarkGray,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    profileBackground: Colors.Black,
    toggleBackground: Colors.Quartz,
    borderColor: Colors.BorderChineseWhite,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
  },
};
const CombinedDarkTheme: AppTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primaryBackground: Colors.RaisinBlack,
    cardBackground: Colors.RaisinBlack,
    primaryCTA: Colors.ChineseOrange,
    accent1: Colors.SelectiveYellow,
    accent2: Colors.Eucalyptus,
    accent3: Colors.SilverSand,
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyColor: Colors.DarkGray,
    placeholder: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    profileBackground: Colors.Black,
    toggleBackground: Colors.Quartz,
    borderColor: Colors.BorderChineseWhite,
    shodowColor: Colors.ChineseWhite,
    inActiveDotColor: Colors.QuickSilver,
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };
