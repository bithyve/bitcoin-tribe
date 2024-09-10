import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import CommunityScreen from 'src/assets/images/communityScreen.svg';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.imageWrapper}>
        <CommunityScreen height={windowHeight > 670 ? '94%' : '96%'} />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: windowHeight > 670 ? 0 : hp(20),
    },
    imageWrapper: {},
  });
export default Community;
