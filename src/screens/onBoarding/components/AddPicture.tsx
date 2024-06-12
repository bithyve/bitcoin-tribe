import * as React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconImage from 'src/assets/images/icon_image.svg';
import { hp, wp } from 'src/constants/responsive';
import UserAvatar from 'src/components/UserAvatar';

type addPictureProps = {
  imageSource: any;
  onPress: any;
};
function AddPicture(props: addPictureProps) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { imageSource, onPress } = props;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {!imageSource ? (
        <View style={styles.container}>
          <View style={styles.iconImageWrapper}>
            <IconImage />
          </View>
          <View>
            <AppText
              variant="secondary"
              style={styles.addPictureText}
              testID={'text_addPicture'}>
              ADD PICTURE
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <UserAvatar size={70} imageSource={imageSource} />
        </View>
      )}
    </TouchableOpacity>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(25),
    },
    iconImageWrapper: {
      height: hp(70),
      width: wp(70),
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.profileBackground,
    },
    addPictureText: {
      color: theme.colors.accent1,
      marginLeft: wp(10),
    },
  });
export default AddPicture;
