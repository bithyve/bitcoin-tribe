import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import Switch from './Switch';

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
  const theme = useTheme();
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
  console.log('select opt toggleValue', toggleValue);
  return (
    <AppTouchable onPress={onPress} style={[styles.touchableWrapper, style]}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          {icon}
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              testID="text_SelectOptionTitle"
              style={styles.titleStyle}>
              {title}
            </AppText>
            {subTitle && (
              <AppText
                variant="body2"
                testID="text_SelectOptionSubTitle"
                style={styles.subTitleStyle}>
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
const getStyles = (theme, backColor) =>
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
