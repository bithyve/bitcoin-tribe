import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

import { MD2LightTheme, MD2DarkTheme } from 'react-native-paper';
import Colors from './Colors';

const CombinedDefaultTheme = {
  ...MD2LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD2LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primaryBackground: Colors.Arsenic,
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
  },
};
const CombinedDarkTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primaryBackground: Colors.Arsenic,
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
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };
