import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import AppTouchable from 'src/components/AppTouchable';

type AppInfoCardProps = {
  title: string;
  subTitle: string;
  icon?: ReactNode;
  value: string;
  navigation?: undefined;
};

function AppInfoCard(props: AppInfoCardProps) {
  const { title, subTitle, icon, value, navigation } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable
      style={styles.container}
      onPress={() => console.log('press')}
      disabled={!navigation}>
      <View>
        <AppText variant="subTitle" style={styles.titleText}>
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
            <IconArrow />
          </View>
        )}
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardBackground,
      width: '100%',
      borderRadius: hp(10),
      padding: hp(15),
      marginVertical: hp(10),
      shadowColor: theme.colors.cardShadowColor,
      shadowRadius: 1,
      shadowOpacity: 0.2,
      elevation: 0.5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
    },
    titleText: {
      color: theme.colors.accent2,
    },
    subTitleText: {
      color: theme.colors.bodyColor,
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(20),
      alignItems: 'center',
    },
    contentWrapper2: {
      flexDirection: 'row',
      width: '90%',
      alignItems: 'center',
    },
    valueText: {
      marginLeft: wp(10),
      color: theme.colors.headingColor,
    },
  });
export default AppInfoCard;
