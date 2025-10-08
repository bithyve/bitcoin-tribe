import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import IconSettingArrow from 'src/assets/images/icon_arrowr2.svg';
import IconSettingArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { hp, windowHeight } from 'src/constants/responsive';
import GradientView from './GradientView';
import Colors from 'src/theme/Colors';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type RibbonCardProps = {
  icon?: React.ReactNode;
  title: string;
  subTitle?: string;
  backColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};
const RibbonCard = (props: RibbonCardProps) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const {
    icon,
    title,
    subTitle,
    onPress,
    backColor,
    style,
  } = props;
  const styles = getStyles(theme, backColor);
  const [cardHeight, setCardHeight] = React.useState(0);
  const handleLayout = event => {
    const { height } = event.nativeEvent.layout;
    setCardHeight(height);
  };

  return (
    <AppTouchable onPress={onPress}>
      <View style={[styles.bgContainer, { height: cardHeight }]} />
      <View onLayout={handleLayout} style={styles.ribbon}>
        <GradientView
          style={[styles.container, style]}
          colors={[
            theme.colors.optionsCardGradient1,
            theme.colors.optionsCardGradient1,
            theme.colors.optionsCardGradient2,
          ]}>
          <View style={styles.iconWrapper}>
            {icon}
            <View style={styles.contentWrapper}>
              <AppText variant="body1Bold" style={styles.titleStyle}>
                {title}
              </AppText>
              {subTitle ? (
                <AppText variant="caption" style={styles.subTitleStyle}>
                  {subTitle}
                </AppText>
              ) : null}
            </View>
          </View>
          {isThemeDark ? (
                <IconSettingArrow height={20} width={20} />
              ) : (
                <IconSettingArrowLight height={20} width={20} />
              )}
        </GradientView>
      </View>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    bgContainer: {
      backgroundColor: Colors.ElectricViolet,
      width: '100%',
      borderRadius: 15,
    },
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(17) : hp(10),
      backgroundColor: backColor,
      borderRadius: 15,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '85%',
    },
    contentWrapper: {
      gap:hp(3)
    },
    titleStyle: {
      color: theme.colors.headingColor,
    },
    subTitleStyle: {
      flexWrap: 'wrap',
      color: theme.colors.secondaryHeadingColor,
    },
    ribbon: {
      position: 'absolute',
      top: 0,
      left: 1,
      padding: 0,
      margin: 0,
    },
  });
export default RibbonCard;
