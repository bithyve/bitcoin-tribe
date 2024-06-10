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
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyColor: Colors.DarkGray,
    placeholderColor: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    profileBackground: Colors.Black,
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
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyColor: Colors.DarkGray,
    placeholderColor: Colors.SonicSilver,
    primaryText: Colors.RaisinBlack,
    profileBackground: Colors.Black,
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };
