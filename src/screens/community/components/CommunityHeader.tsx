import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import GiftIcon from 'src/assets/images/gift.svg';

function CommunityHeader() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="heading1" style={styles.titleStyle}>
          {community.fnfTitle}
        </AppText>
        <AppText variant="heading3" style={styles.subTitleStyle}>
          {community.fnfSubTitle}
        </AppText>
      </View>
      <View style={styles.iconWrapper}>
        <GiftIcon />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(5),
    },
    contentWrapper: {
      width: '87%',
    },
    iconWrapper: {
      width: '10%',
    },
    titleStyle: {
      color: theme.colors.headingColor,
    },
    subTitleStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default CommunityHeader;
