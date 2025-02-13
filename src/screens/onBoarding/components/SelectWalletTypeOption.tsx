import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';

type SelectOptionProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle?: string;
  backColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  borderColor?: string;
};
const SelectWalletTypeOption = (props: SelectOptionProps) => {
  const theme: AppTheme = useTheme();
  const {
    icon,
    title,
    subTitle,
    onPress,
    backColor,
    style,
    disabled = false,
    rightIcon,
    borderColor = theme.colors.borderColor,
  } = props;
  const styles = getStyles(theme, backColor, borderColor);
  return (
    <AppTouchable onPress={onPress} disabled={disabled}>
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

        <View>{rightIcon}</View>
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor, borderColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 15,
      borderColor: borderColor,
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
      color: theme.colors.headingColor,
    },
    subTitleStyle: {
      flexWrap: 'wrap',
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default SelectWalletTypeOption;
