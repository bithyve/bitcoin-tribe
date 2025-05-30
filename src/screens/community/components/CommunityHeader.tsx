import React, { useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import GiftIcon from 'src/assets/images/gift.svg';
import SearchIcon from 'src/assets/images/search.svg';
import AddContactIcon from 'src/assets/images/addcontact.svg';
import IconWrapper from 'src/components/IconWrapper';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';

function CommunityHeader() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AppText variant="heading1" style={styles.titleStyle}>
          {community.fnfTitle}
        </AppText>

      </View>
      <View style={styles.iconWrapper}>
        <IconWrapper
          style={styles.icon}
          onPress={() => {
          }}>
        {<SearchIcon />}
      </IconWrapper>
      <IconWrapper
        style={styles.icon}
        onPress={() => {
          navigation.navigate(NavigationRoutes.CONTACTREQUEST);
        }}>
          {<AddContactIcon />}
        </IconWrapper>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      marginTop: Platform.OS === 'ios' ? hp(10) : hp(30),
      marginHorizontal: hp(5),
    },
    contentWrapper: {
      width: '85%',
    },
    iconWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginRight: hp(10),
    },
    titleStyle: {
      color: theme.colors.headingColor,
    },
    subTitleStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
    icon: {
      marginHorizontal: hp(2),
    },
  });
export default CommunityHeader;
