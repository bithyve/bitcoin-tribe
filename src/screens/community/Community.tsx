import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import CommunityScreen from 'src/assets/images/communityScreen.svg';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import CommunityHeader from './components/CommunityHeader';
import CommunityList from './components/CommunityList';
import AppText from 'src/components/AppText';

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <CommunityHeader />
      <CommunityList />
      <View>
        <AppText variant="heading1" style={styles.textStyle}>
          {common.commingSoon}
        </AppText>
        <AppText variant="body1" style={styles.subTextStyle}>
          {common.commingSoonSubTitle}
        </AppText>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    imageWrapper: {},
    textStyle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 36,
    },
    subTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
  });
export default Community;
