import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import AssetDetailsContainer from './components/AssetDetailsContainer';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';

function AssetDetails() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <AppHeader enableBack={true} />
      </View>
      <AssetDetailsContainer tag="COLLECTIBLE" />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    headerWrapper: {
      marginHorizontal: hp(25),
      marginTop: hp(15),
    },
  });
export default AssetDetails;
