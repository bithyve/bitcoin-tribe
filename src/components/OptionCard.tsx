import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';

type OptionCardProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

function OptionCard(props: OptionCardProps) {
  const { icon, title, subTitle, style, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable style={[styles.container, style]} onPress={() => onPress()}>
      <View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.menuCardTitle}>
              {title}
            </AppText>
            <AppText variant="body2" style={styles.menuCardSubTitle}>
              {subTitle}
            </AppText>
          </View>
          <View style={styles.iconWrapper}>
            <IconArrow />
          </View>
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: hp(20),
      paddingVertical: hp(10),
      marginVertical: hp(10),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      // need to work
      // shadowColor: theme.colors.cardShadowColor,
      // shadowRadius: 10,
      // shadowOpacity: 1,
      // elevation: 2,
      // shadowOffset: {
      //   width: 0,
      //   height: 4,
      // },
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
      marginVertical: hp(5),
    },
    menuCardTitle: {
      color: theme.colors.accent3,
      lineHeight: 26,
    },
    menuCardSubTitle: {
      color: theme.colors.bodyColor,
    },
    iconWrapper: {
      width: '10%',
      justifyContent: 'center',
    },
    iconContainer: {
      marginVertical: hp(10),
    },
  });
export default OptionCard;
