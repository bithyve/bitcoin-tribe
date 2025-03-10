import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, Switch } from 'react-native-paper';

import IconArrow from 'src/assets/images/setting_right_icon.svg';
import IconArrowLight from 'src/assets/images/setting_right_icon.svg';
import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import CheckMarkGreen from 'src/assets/images/checkmarkGreen.svg';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import DotView from 'src/components/DotView';
import { AppContext } from 'src/contexts/AppContext';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

type SelectMenuProps = {
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
  lastIndex?: boolean;
  manualAssetBackupStatus?: boolean;
};
const SelectMenuItem = (props: SelectMenuProps) => {
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
    lastIndex,
    manualAssetBackupStatus,
  } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = React.useContext(LocalizationContext);
  const { settings } = translations;
  const styles = getStyles(theme, backColor, backup, lastIndex);
  return (
    <AppTouchable onPress={onPress}>
      <View style={[styles.container, style]}>
        <View style={styles.iconWrapper}>
          {icon}
          <View style={styles.contentWrapper}>
            <AppText variant="body1" style={styles.titleStyle}>
              {title}
            </AppText>
            {subTitle ? (
              <AppText variant="body2" style={styles.subTitleStyle}>
                {subTitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {manualAssetBackupStatus && (
          <DotView backColor={theme.colors.errorPopupBorderColor} />
        )}
        {!backup ? (
          showArrow ? (
            <View>
              {enableSwitch ? (
                <Switch
                  value={toggleValue}
                  onValueChange={onValueChange}
                  color={theme.colors.accent1}
                />
              ) : isThemeDark ? (
                <IconArrow />
              ) : (
                <IconArrowLight />
              )}
            </View>
          ) : null
        ) : (
          <CheckMarkGreen />
        )}
      </View>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor, backup, lastIndex) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(16) : hp(10),
      backgroundColor: backColor,
      borderRadius: 10,
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: lastIndex ? 0 : 1,
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
export default SelectMenuItem;
