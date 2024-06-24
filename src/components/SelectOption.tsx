import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconArrow from 'src/assets/images/icon_arrowr1.svg';
import IconSettingArrow from 'src/assets/images/icon_arrowr2.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import Switch from './Switch';
import { AppTheme } from 'src/theme';
import { windowHeight } from 'src/constants/responsive';

type SelectOptionProps = {
  icon: React.ReactNode;
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
  } = props;
  const styles = getStyles(theme, backColor);

  return (
    <AppTouchable onPress={onPress} style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        {icon}
        <View style={styles.contentWrapper}>
          <AppText variant="body1" style={styles.titleStyle}>
            {title}
          </AppText>
          {subTitle && (
            <AppText variant="body2" style={styles.subTitleStyle}>
              {subTitle}
            </AppText>
          )}
        </View>
      </View>
      {showArrow ? (
        <View>
          {enableSwitch ? (
            <Switch
              onValueChange={onValueChange}
              value={toggleValue}
              testID={testID}
            />
          ) : backColor ? (
            <IconArrow />
          ) : (
            <IconSettingArrow />
          )}
        </View>
      ) : null}
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: windowHeight > 650 ? 25 : 20,
      backgroundColor: backColor,
      borderRadius: 10,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    titleStyle: {
      color: theme.colors.bodyColor,
    },
    subTitleStyle: {
      color: theme.colors.bodyColor,
    },
  });
export default SelectOption;
