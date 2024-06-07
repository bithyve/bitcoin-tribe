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
    primaryBackgroundColor: Colors.Arsenic,
    primaryCTA: Colors.ChineseOrange,
    recieveCTA: Colors.Eucalyptus,
    buyCTA: Colors.SelectiveYellow,
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyTextColor: Colors.DarkGray,
    placeholderColor: Colors.SonicSilver,
    textColor: Colors.RaisinBlack,
  },
};
const CombinedDarkTheme = {
  ...MD2DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD2DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primaryBackgroundColor: Colors.Arsenic,
    primaryCTA: Colors.ChineseOrange,
    recieveCTA: Colors.Eucalyptus,
    buyCTA: Colors.SelectiveYellow,
    inputBackground: Colors.Jet,
    headingColor: Colors.ChineseWhite,
    bodyTextColor: Colors.DarkGray,
    placeholderColor: Colors.SonicSilver,
    textColor: Colors.RaisinBlack,
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };
