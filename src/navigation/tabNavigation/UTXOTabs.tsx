import * as React from 'react';
import { StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from 'src/components/AppHeader';
import ColorableUTXO from 'src/screens/collectiblesCoins/components/ColorableUTXO';
import ColoredUTXO from 'src/screens/collectiblesCoins/components/ColoredUTXO';
import UTXOInfoModal from 'src/screens/collectiblesCoins/components/UTXOInfoModal';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { hp, windowHeight } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import UTXOTabBar from './UTXOTabBar';

const renderScene = SceneMap({
  colored: ColoredUTXO,
  colorable: ColorableUTXO,
});

const routes = [
  { key: 'colored', title: 'Colored' },
  { key: 'colorable', title: 'Colorable' },
];

export default function UTXOTabs() {
  const layout = useWindowDimensions();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [index, setIndex] = React.useState(0);
  const [visibleUTXOInfo, setVisibleUTXOInfo] = React.useState(false);
  const { translations } = React.useContext(LocalizationContext);
  const { wallet } = translations;

  return (
    <SafeAreaView style={{ ...styles.container }}>
      <StatusBar
        barStyle={isThemeDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primaryBackground}
      />
      <AppHeader
        title={wallet.unspentTitle || 'Unspent Outputs'}
        enableBack={true}
        rightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
        onSettingsPress={() => setVisibleUTXOInfo(true)}
      />
      <TabView
        renderTabBar={props => <UTXOTabBar {...props} />}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      <View>
        <UTXOInfoModal
          visible={visibleUTXOInfo}
          primaryCtaTitle={'Okay'}
          primaryOnPress={() => setVisibleUTXOInfo(false)}
        />
      </View>
    </SafeAreaView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
      paddingHorizontal: hp(16),
      paddingBottom: hp(16),
      paddingTop: windowHeight < 675 ? hp(16) : hp(10),
    },
  });
