import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppText from 'src/components/AppText';
import IconImage from 'src/assets/images/icon_image.svg';
import IconImageLight from 'src/assets/images/icon_image_light.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import UserAvatar from 'src/components/UserAvatar';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import Colors from 'src/theme/Colors';

type addPictureProps = {
  title: string;
  imageSource: any;
  onPress: any;
  edit?: boolean;
};
function EditProfilePic(props: addPictureProps) {
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
      <AppTouchable onPress={onPress}>
        <AppText variant="body2" style={styles.editPhotoTitle}>
          Edit
        </AppText>
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
      marginBottom: windowHeight > 670 ? hp(20) : hp(10),
    },
    wrapper: {
      alignItems: 'center',
    },
    iconImageWrapper: {
      height: windowHeight > 670 ? hp(200) : 200,
      width: windowHeight > 670 ? hp(200) : 200,
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
    wrapper1: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editPhotoCta: {
      minHeight: hp(36),
      minWidth: hp(90),
      borderRadius: hp(7),
      backgroundColor: theme.colors.inputBackground,
      marginLeft: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    editPhotoTitle: {
      color: theme.colors.accent1,
      marginBottom: hp(20),
    },
    removeCta: {
      minHeight: hp(36),
      minWidth: hp(80),
      borderRadius: hp(7),
      backgroundColor: Colors.CandyAppleRed1,
      marginLeft: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    removePhotoTitle: {
      color: theme.colors.removeProfileTitle,
    },
  });
export default EditProfilePic;
