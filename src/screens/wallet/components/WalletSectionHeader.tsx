import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import UserAvatar from 'src/components/UserAvatar';
import AppTouchable from 'src/components/AppTouchable';
import GoBack from 'src/assets/images/icon_back.svg';
import SettingIcon from 'src/assets/images/icon_settings.svg';

type WalletSectionHeaderProps = {
  profile: string;
};
function WalletSectionHeader(props: WalletSectionHeaderProps) {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { profile } = props;
  return (
    <View style={styles.headerWrapper}>
      <AppTouchable onPress={navigation.goBack} style={styles.leftIconWrapper}>
        {<GoBack />}
      </AppTouchable>
      <View style={styles.profileWrapper}>
        <UserAvatar size={70} imageSource={profile} />
      </View>
      <AppTouchable
        onPress={() => console.log('wallet setting press')}
        style={styles.rightIconWrapper}>
        {<SettingIcon />}
      </AppTouchable>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    headerWrapper: {
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftIconWrapper: {},
    profileWrapper: {},
    rightIconWrapper: {},
  });
export default WalletSectionHeader;
