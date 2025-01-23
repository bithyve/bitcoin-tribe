import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

type UploadImageCtaProps = {
  title: string;
  icon: ReactNode;
  onPress: () => void;
};

function UploadImageCta(props: UploadImageCtaProps) {
  const theme: AppTheme = useTheme();
  const { title, icon, onPress } = props;
  const styles = getStyles(theme);

  return (
    <AppTouchable onPress={onPress}>
      <View style={styles.container}>
        {icon}
        <AppText variant="body1" style={styles.titleText}>
          {title}
        </AppText>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.popupCTABackColor,
      paddingVertical: hp(15),
      paddingHorizontal: hp(25),
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(10),
    },
    titleText: {
      color: theme.colors.popupCTATitleColor,
      marginLeft: hp(10),
    },
  });
export default UploadImageCta;
