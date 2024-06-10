import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from '../../../components/AppText';
import IconArrow from '../../../assets/images/icon_arrowr2.svg';
import { hp } from '../../../constants/responsive';

type AppHeaderProps = {
  icon?: any;
  title: string;
  subTitle: string;
  style?: any;
};

function AppHeader(props: AppHeaderProps) {
  const { icon, title, subTitle, style } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.container, style]}>
      <View>{icon}</View>
      <View style={styles.detailsWrapper}>
        <View style={styles.contentWrapper}>
          <AppText style={styles.menuCardTitle}>{title}</AppText>
          <AppText style={styles.menuCardSubTitle}>{subTitle}</AppText>
        </View>
        <View style={styles.iconWrapper}>
          <IconArrow />
        </View>
      </View>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      marginVertical: hp(10),
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
      marginTop: hp(10),
    },
    menuCardTitle: {
      color: theme.colors.body,
    },
    menuCardSubTitle: {
      color: theme.colors.body,
    },
    iconWrapper: {
      width: '10%',
      justifyContent: 'center',
    },
  });
export default AppHeader;
