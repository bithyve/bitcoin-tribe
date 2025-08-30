import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import IconImage from 'src/assets/images/icon_image.svg';
import IconImageLight from 'src/assets/images/icon_image_light.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import UserAvatar from 'src/components/UserAvatar';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';

type addPictureProps = {
  title: string;
  imageSource: any;
  onPress: any;
  edit?: boolean;
};
function AddPicture(props: addPictureProps) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { imageSource, onPress, title, edit = false } = props;

  return (
    <View style={styles.wrapper}>
      <AppTouchable onPress={onPress}>
        {!imageSource ? (
          <View style={styles.container}>
            <View style={styles.iconImageWrapper}>
              {isThemeDark ? (
                <IconImage height={200} width={200} />
              ) : (
                <IconImageLight height={200} width={200} />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <UserAvatar size={wp(200)} imageSource={imageSource} />
          </View>
        )}
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: windowHeight > 670 ? hp(30) : hp(20),
      marginBottom: windowHeight > 670 ? hp(40) : hp(20),
    },
    wrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      height: '50%',
    },
    iconImageWrapper: {
      height: windowHeight > 670 ? hp(75) : 75,
      width: windowHeight > 670 ? hp(75) : 75,
      borderRadius: hp(70),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.profileBackground,
      marginHorizontal: hp(3),
    },
    addPictureText: {
      color: theme.colors.headingColor,
      marginLeft: wp(10),
    },
  });
export default AddPicture;
