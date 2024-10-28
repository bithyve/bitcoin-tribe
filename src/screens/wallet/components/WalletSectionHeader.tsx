import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import UserAvatar from 'src/components/UserAvatar';
import GoBack from 'src/assets/images/icon_back.svg';
import GoBackLight from 'src/assets/images/icon_back_light.svg';
import ReciveTestSatsIcon from 'src/assets/images/recieveTestSats.svg';
import ReciveTestSatsLightIcon from 'src/assets/images/recieveTestSats_light.svg';
import { AppTheme } from 'src/theme';
import IconWrapper from 'src/components/IconWrapper';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type WalletSectionHeaderProps = {
  profile: string;
  onPress: () => void;
};
function WalletSectionHeader(props: WalletSectionHeaderProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { profile, onPress } = props;
  return (
    <View style={styles.headerWrapper}>
      <IconWrapper onPress={navigation.goBack} style={styles.leftIconWrapper}>
        {!isThemeDark ? <GoBack /> : <GoBackLight />}
      </IconWrapper>
      <View style={styles.profileWrapper}>
        <UserAvatar size={80} imageSource={profile} />
      </View>
      <IconWrapper onPress={onPress} style={styles.rightIconWrapper}>
        <View style={styles.rightIconWrapper1}>
          {!isThemeDark ? <ReciveTestSatsIcon /> : <ReciveTestSatsLightIcon />}
        </View>
      </IconWrapper>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      marginTop: hp(30),
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftIconWrapper: {
      width: '20%',
    },
    profileWrapper: {
      width: '60%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: windowHeight > 650 ? 0 : 10,
    },
    rightIconWrapper: {
      width: '20%',
      alignItems: 'flex-end',
    },
    rightIconWrapper1: {
      borderRadius: 100,
    },
  });
export default WalletSectionHeader;
