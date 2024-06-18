import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import UserAvatar from 'src/components/UserAvatar';
import GoBack from 'src/assets/images/icon_back.svg';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import { AppTheme } from 'src/theme';
import IconWrapper from 'src/components/IconWrapper';
import { windowHeight } from 'src/constants/responsive';

type WalletSectionHeaderProps = {
  profile: string;
};
function WalletSectionHeader(props: WalletSectionHeaderProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { profile } = props;
  return (
    <View style={styles.headerWrapper}>
      <IconWrapper onPress={navigation.goBack} style={styles.leftIconWrapper}>
        {<GoBack />}
      </IconWrapper>
      <View style={styles.profileWrapper}>
        <UserAvatar size={70} imageSource={profile} />
      </View>
      <IconWrapper
        onPress={() => console.log('wallet setting press')}
        style={styles.rightIconWrapper}>
        {<SettingIcon />}
      </IconWrapper>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerWrapper: {
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    leftIconWrapper: {},
    profileWrapper: {
      marginTop: windowHeight > 650 ? 0 : 10,
    },
    rightIconWrapper: {},
  });
export default WalletSectionHeader;
