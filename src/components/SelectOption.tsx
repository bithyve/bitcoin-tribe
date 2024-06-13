import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import Switch from './Switch';
import { AppTheme } from 'src/theme';

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
  } = props;
  const styles = getStyles(theme, backColor);

  return (
    <AppTouchable onPress={onPress} style={[styles.touchableWrapper, style]}>
      <View style={styles.container}>
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
        <View>
          {enableSwitch ? (
            <Switch
              onValueChange={onValueChange}
              value={toggleValue}
              testID="switch_selectOptn"
            />
          ) : (
            <IconArrow />
          )}
        </View>
      </View>
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
      paddingVertical: 15,
      backgroundColor: backColor,
    },
    touchableWrapper: {
      borderRadius: 10,
      width: '100%',
      backgroundColor: backColor,
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
