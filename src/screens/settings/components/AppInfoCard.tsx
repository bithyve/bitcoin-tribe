import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import IconArrow from 'src/assets/images/icon_right_arrow.svg';
import IconSettingArrowLight from 'src/assets/images/icon_right_arrow_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type AppInfoCardProps = {
  title: string;
  subTitle: string;
  icon?: ReactNode;
  value: string;
  navigation?: undefined;
};

function AppInfoCard(props: AppInfoCardProps) {
  const { title, subTitle, icon, value, navigation } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable onPress={navigation} disabled={!navigation}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View>
          <AppText variant="body1" style={styles.titleText}>
            {title}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {subTitle}
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.contentWrapper2}>
            {icon}
            <AppText
              variant="body3"
              style={styles.valueText}
              numberOfLines={1}
              ellipsizeMode="middle">
              {value}
            </AppText>
          </View>
          {navigation && (
            <View>
              {isThemeDark ? <IconArrow /> : <IconSettingArrowLight />}
            </View>
          )}
        </View>
      </GradientView>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardBackground,
      width: '100%',
      borderRadius: hp(20),
      padding: hp(20),
      marginVertical: hp(10),
    },
    titleText: {
      color: theme.colors.accent2,
    },
    subTitleText: {
      lineHeight: 20,
      fontWeight: '400',
      width: '70%',
      color: theme.colors.secondaryHeadingColor,
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(20),
      alignItems: 'center',
    },
    contentWrapper2: {
      flexDirection: 'row',
      width: '88%',
      alignItems: 'center',
    },
    valueText: {
      marginLeft: wp(10),
      color: theme.colors.headingColor,
    },
  });
export default AppInfoCard;
