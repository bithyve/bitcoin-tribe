import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconImage from 'src/assets/images/icon_image.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import UserAvatar from 'src/components/UserAvatar';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';

type addPictureProps = {
  title: string;
  imageSource: any;
  onPress: any;
  edit?: boolean;
};
function AddPicture(props: addPictureProps) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { imageSource, onPress, title, edit = false } = props;

  return (
    <AppTouchable onPress={onPress}>
      {!imageSource ? (
        <View style={styles.container}>
          <View style={styles.iconImageWrapper}>
            <IconImage />
          </View>
          <View>
            <AppText variant="smallCTA" style={styles.addPictureText}>
              {title}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <UserAvatar size={wp(75)} imageSource={imageSource} />
          {edit ? (
            <View style={styles.iconImageWrapper2}>
              <IconImage />
            </View>
          ) : null}
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
      marginTop: hp(30),
      marginBottom: hp(40),
      position: 'relative',
    },
    iconImageWrapper: {
      height: windowHeight > 650 ? hp(75) : 75,
      width: windowHeight > 650 ? hp(75) : 75,
      borderRadius: hp(70),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.profileBackground,
    },
    addPictureText: {
      color: theme.colors.accent1,
      marginLeft: wp(10),
    },
    iconImageWrapper2: {
      position: 'absolute',
      alignSelf: 'center',
      left: 25,
      opacity: 1,
    },
  });
export default AddPicture;
