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
        <View>{icon}</View>
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              style={styles.menuCardTitle}
              testID="text_optionTitle">
              {title}
            </AppText>
            <AppText
              variant="body2"
              style={styles.menuCardSubTitle}
              testID="text_optionSubTitle">
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
      color: theme.colors.accent3,
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
