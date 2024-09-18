import React, { useContext } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import EmptyStateView from 'src/components/EmptyStateView';
import RefreshControlView from 'src/components/RefreshControlView';
import FnfNext from 'src/assets/images/fnfNext.svg';
import AppTouchable from 'src/components/AppTouchable';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';

const data = [
  {
    id: 1,
    name: 'Peter Parker',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'P',
  },
  {
    id: 2,
    name: 'Sonny Foster',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'S',
  },
  {
    id: 3,
    name: 'Raymond Parr',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'R',
  },
  {
    id: 4,
    name: 'Sol Parr',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'S',
  },
  {
    id: 5,
    name: 'Sol Smith',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'S',
  },
  {
    id: 6,
    name: 'Sol Parker',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'S',
  },
];

const CommunityListItem = ({ name, giftTime, profileText }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.listItemContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.profileWrapper}>
          <AppText variant="heading3" style={styles.profileTextStyle}>
            {profileText}
          </AppText>
        </View>
      </View>
      <View style={styles.listItemContentWrapper}>
        <AppText variant="heading3" style={styles.nameText}>
          {name}
        </AppText>
        <AppText variant="caption" style={styles.giftTimeText}>
          {giftTime}
        </AppText>
      </View>
      <View style={styles.itemIconWrapper}>
        <FnfNext />
      </View>
    </View>
  );
};
function CommunityList() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView refreshing={false} onRefresh={() => {}} />
          ) : (
            <RefreshControl
              refreshing={false}
              onRefresh={() => {}}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item, index }) => (
          <CommunityListItem
            name={item.name}
            giftTime={item.giftTime}
            profileText={item.profileText}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={<NoTransactionIllustration />}
            title={''}
            subTitle={''}
          />
        }
      />
      <AppTouchable style={styles.addNewIconWrapper}>
        <AddNewAsset />
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
      height: '100%',
      width: '100%',
    },
    listItemContainer: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(10),
    },
    profileWrapper: {
      backgroundColor: theme.colors.inputBackground,
      height: hp(50),
      width: hp(50),
      borderRadius: hp(50),
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileContainer: {
      width: '18%',
    },
    listItemContentWrapper: {
      width: '67%',
    },
    itemIconWrapper: {
      width: '15%',
      alignItems: 'flex-end',
    },
    nameText: {
      color: theme.colors.headingColor,
    },
    giftTimeText: {
      color: theme.colors.secondaryHeadingColor,
    },
    profileTextStyle: {
      color: theme.colors.headingColor,
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: 180,
      right: 30,
    },
  });
export default CommunityList;
