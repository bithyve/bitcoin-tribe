import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import GradientView from 'src/components/GradientView';

type SelectMenuProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle?: string;
  backColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleColor?: string;
};
const SelectProfileMenu = (props: SelectMenuProps) => {
  const theme: AppTheme = useTheme();
  const { icon, title, subTitle, onPress, backColor, style, titleColor } =
    props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = React.useContext(LocalizationContext);
  const { settings } = translations;
  const styles = getStyles(theme, backColor, titleColor);
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
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor, titleColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(16) : hp(10),
      backgroundColor: backColor,
      borderRadius: 10,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
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
      color: titleColor || theme.colors.headingColor,
    },
    subTitleStyle: {
      flexWrap: 'wrap',
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default SelectProfileMenu;
