import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import { hp } from 'src/constants/responsive';

type OptionCardProps = {
  icon?: any;
  title: string;
  subTitle: string;
  style?: any;
  onPress?: any;
};

function OptionCard(props: OptionCardProps) {
  const { icon, title, subTitle, style, onPress } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <TouchableRipple
      rippleColor={'gray'}
      style={[styles.container, style]}
      onPress={() => onPress()}>
      <View>
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
    </TouchableRipple>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      marginVertical: hp(10),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
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
      color: theme.colors.bodyColor,
    },
    menuCardSubTitle: {
      color: theme.colors.bodyColor,
    },
    iconWrapper: {
      width: '10%',
      justifyContent: 'center',
    },
  });
export default OptionCard;
