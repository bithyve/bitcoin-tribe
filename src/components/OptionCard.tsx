import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppText from 'src/components/AppText';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import IconArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import IconRightArrow from 'src/assets/images/icon_right_arrow.svg';
import IconRightArrowLight from 'src/assets/images/icon_right_arrow_light.svg';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import GradientView from './GradientView';
import { Keys } from 'src/storage';

type OptionCardProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  showRightArrow?: React.ReactNode;
  showIcon?: boolean;
  rightIcon?: React.ReactNode;
};

function OptionCard(props: OptionCardProps) {
  const {
    icon,
    title,
    subTitle,
    style,
    onPress,
    showRightArrow = false,
    showIcon = true,
    rightIcon
  } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(
    () => getStyles(theme, showRightArrow),
    [theme, showRightArrow],
  );
  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={[styles.container, style]}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText variant="heading3" style={styles.menuCardTitle}>
              {title}
            </AppText>
            {subTitle && (
              <AppText variant="body1" style={styles.menuCardSubTitle}>
                {subTitle}
              </AppText>
            )}
          </View>
          {showIcon && (
            <View style={styles.iconWrapper}>
              {showRightArrow ? (
                isThemeDark ? (
                  <IconRightArrow
                    height={44}
                    width={44}
                  />
                ) : (
                  <IconRightArrowLight height={44} width={44} />
                )
              ) : isThemeDark ? (
                <IconArrow />
              ) : (
                <IconArrowLight />
              )}
            </View>
          )}
          {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
        </View>
      </GradientView>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, showRightArrow) =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      marginVertical: hp(10),
      borderRadius: 16,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
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
      color: theme.colors.headingColor,
      lineHeight: 26,
    },
    menuCardSubTitle: {
      color: theme.colors.secondaryHeadingColor,
    },
    iconWrapper: {
      width: '10%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      marginVertical: hp(10),
    },
  });
export default OptionCard;
