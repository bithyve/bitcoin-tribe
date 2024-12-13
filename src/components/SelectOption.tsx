import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, Switch } from 'react-native-paper';

import IconArrow from 'src/assets/images/icon_right_arrow.svg';
import IconArrowLight from 'src/assets/images/icon_right_arrow_light.svg';
import IconSettingArrow from 'src/assets/images/icon_arrowr2.svg';
import IconSettingArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import GradientView from './GradientView';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import CheckMarkGreen from 'src/assets/images/checkmarkGreen.svg';

type SelectOptionProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle?: string;
  backColor?: string;
  onPress?: () => void;
  onValueChange?: () => void;
  enableSwitch?: boolean;
  toggleValue?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  showArrow?: boolean;
  backup?: boolean;
};
const SelectOption = (props: SelectOptionProps) => {
  const theme: AppTheme = useTheme();
  const {
    icon,
    title,
    subTitle,
    onPress,
    backColor,
    style,
    onValueChange,
    enableSwitch = false,
    toggleValue,
    testID,
    showArrow = true,
    backup = false,
  } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, backColor, backup);
  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={[styles.container, style]}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.iconWrapper}>
          {icon}
          <View style={styles.contentWrapper}>
            <AppText variant="heading3" style={styles.titleStyle}>
              {title}
            </AppText>
            {subTitle ? (
              <AppText variant="body2" style={styles.subTitleStyle}>
                {subTitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {!backup ? (
          showArrow ? (
            <View>
              {enableSwitch ? (
                <Switch
                  value={toggleValue}
                  onValueChange={onValueChange}
                  color={theme.colors.accent1}
                />
              ) : backColor ? (
                isThemeDark ? (
                  <IconArrow />
                ) : (
                  <IconArrowLight />
                )
              ) : isThemeDark ? (
                <IconSettingArrow />
              ) : (
                <IconSettingArrowLight />
              )}
            </View>
          ) : null
        ) : (
          <CheckMarkGreen />
        )}
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor, backup) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 20,
      borderColor: backup
        ? theme.colors.backupDoneBorder
        : theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(10),
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '80%',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    titleStyle: {
      color: theme.colors.headingColor,
    },
    subTitleStyle: {
      flexWrap: 'wrap',
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default SelectOption;
