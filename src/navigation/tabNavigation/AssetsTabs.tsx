import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import Collectibles from 'src/screens/home/Collectibles';
import HomeHeader from 'src/screens/home/components/HomeHeader';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      margin: hp(16),
    },
    textTitle: {
      marginHorizontal: wp(16),
    }
  });

const AssetsTabs = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
        <HomeHeader showRegistry={true} showBalance={false} />
      </View>
      <AppText style={styles.textTitle} variant="heading1">{home.myAssets}</AppText>
      <Collectibles />
    </SafeAreaView>
  );
};

export default AssetsTabs;
