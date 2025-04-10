import React, { ReactNode, useContext } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type collectMoreProps = {
  icon: ReactNode;
  title: string;
  subTitle: string;
  customStyle?: StyleProp<ViewStyle>;
};

function CollectMoreAssetView(props: collectMoreProps) {
  const { icon, title, subTitle, customStyle } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <View style={[styles.container, customStyle]}>
      <View>{icon}</View>
      <View>
        <AppText variant="heading2" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body2" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      bottom: '23%',
    },
    titleText: {
      textAlign: 'center',
      color: theme.colors.headingColor,
      marginTop: hp(10),
    },
    subTitleText: {
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
      lineHeight: hp(20),
    },
  });
export default CollectMoreAssetView;
