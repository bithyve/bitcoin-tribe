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

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer style={styles.container}>
      <CommunityHeader />
      <CommunityList />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    imageWrapper: {},
  });
export default Community;
