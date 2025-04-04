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
    <AppTouchable onPress={onPress}>
      {!imageSource ? (
        <View style={styles.container}>
          <View style={styles.iconImageWrapper}>
            {isThemeDark ? <IconImage /> : <IconImageLight />}
          </View>
          <View>
            <AppText variant="heading3" style={styles.addPictureText}>
              {title}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <UserAvatar size={wp(75)} imageSource={imageSource} />
        </View>
      )}
    </AppTouchable>
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
