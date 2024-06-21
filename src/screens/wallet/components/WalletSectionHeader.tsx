import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import UserAvatar from 'src/components/UserAvatar';
import GoBack from 'src/assets/images/icon_back.svg';
import SettingIcon from 'src/assets/images/icon_settings.svg';
import { AppTheme } from 'src/theme';
import IconWrapper from 'src/components/IconWrapper';
import { windowHeight, wp } from 'src/constants/responsive';

type WalletSectionHeaderProps = {
  profile: string;
  onPress: () => void;
};
function WalletSectionHeader(props: WalletSectionHeaderProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { profile, onPress } = props;
  return (
    <View style={styles.headerWrapper}>
      <IconWrapper onPress={navigation.goBack} style={styles.leftIconWrapper}>
        {<GoBack />}
      </IconWrapper>
      <View style={styles.profileWrapper}>
        <UserAvatar size={70} imageSource={profile} />
      </View>
      <IconWrapper onPress={onPress} style={styles.rightIconWrapper}>
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
    leftIconWrapper: {
      width: '10%',
      borderRadius: 100,
      shadowColor: theme.colors.shodowColor,
      shadowRadius: 10,
      shadowOpacity: 0.8,
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },
    profileWrapper: {
      width: '70%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: wp(26),
      marginTop: windowHeight > 650 ? 0 : 10,
    },
    rightIconWrapper: {
      width: '20%',
      alignItems: 'flex-end',
    },
  });
export default WalletSectionHeader;
