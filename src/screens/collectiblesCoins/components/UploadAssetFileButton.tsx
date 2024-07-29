import React, { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

type uploadFileProps = {
  title: string;
  icon: ReactNode;
  onPress: () => void;
  borderColor?: string;
  imagePath?: string;
};

function UploadAssetFileButton(props: uploadFileProps) {
  const theme: AppTheme = useTheme();
  const { title, icon, onPress, borderColor, imagePath } = props;
  const styles = getStyles(theme, borderColor);

  return (
    <AppTouchable onPress={onPress}>
      {!imagePath ? (
        <View style={styles.container}>
          <AppText variant="body1" style={styles.titleText}>
            {title}
          </AppText>
          {icon}
        </View>
      ) : (
        <Image source={{ uri: imagePath }} style={styles.imageStyle} />
      )}
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, borderColor) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: hp(60),
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: borderColor ? borderColor : theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 15,
      borderStyle: borderColor ? 'solid' : 'dashed',
      marginVertical: hp(5),
    },
    imageStyle: {
      height: hp(60),
      width: '100%',
      borderColor: borderColor ? borderColor : theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 15,
      borderStyle: borderColor ? 'solid' : 'dashed',
      marginVertical: hp(5),
    },
    titleText: {
      color: theme.colors.headingColor,
      marginRight: hp(10),
    },
  });
export default UploadAssetFileButton;
