import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconImage from 'src/assets/images/icon_image.svg';
import { hp, wp } from 'src/constants/responsive';
import UserAvatar from 'src/components/UserAvatar';

type addPictureProps = {
  imageSource: any;
};
function AddPicture(props: addPictureProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { imageSource } = props;
  return (
    <TouchableRipple onPress={() => console.log('pick image')}>
      {!imageSource ? (
        <View style={styles.container}>
          <View style={styles.iconImageWrapper}>
            <IconImage />
          </View>
          <View>
            <AppText variant="secondaryCTATitle" style={styles.addPictureText}>
              ADD PICTURE
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <UserAvatar size={70} imageSource={imageSource} />
        </View>
      )}
    </TouchableRipple>
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
