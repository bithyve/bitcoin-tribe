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
// import AppTouchable from 'src/components/AppTouchable';
// import AddNewAsset from 'src/assets/images/AddNewAsset.svg';

import User1 from 'src/assets/images/user1.svg';
import User2 from 'src/assets/images/user2.svg';
import User3 from 'src/assets/images/user3.svg';
import User4 from 'src/assets/images/user4.svg';
import User5 from 'src/assets/images/user5.svg';

const data = [
  {
    id: 1,
    name: 'Rhaenyra Targaryen',
    giftTime: 'Added just now',
    profileText: 'P',
    profileImage: <User1 />,
  },
  {
    id: 2,
    name: 'Larys Strong',
    giftTime: 'Last seen 4 hours ago',
    profileText: 'S',
    profileImage: <User2 />,
  },
  {
    id: 3,
    name: 'Lady Baela Targaryen',
    giftTime: 'Sent 10,000 sats 3 days back',
    profileText: 'R',
    profileImage: <User3 />,
  },
  {
    id: 4,
    name: 'Ser Simon Strong',
    giftTime: 'Gift received on 5th Feb 2024',
    profileText: 'S',
    profileImage: <User4 />,
  },
  {
    id: 5,
    name: 'Ser Harrold Westerling',
    giftTime: 'Last gift at 15 March 2024',
    profileText: 'S',
    profileImage: <User5 />,
  },
];

const CommunityListItem = ({ name, giftTime, profileImage, index }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, index);
  return (
    <View style={styles.listItemContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.profileWrapper}>
          {profileImage}
          {/* <AppText variant="heading3" style={styles.profileTextStyle}>
            {profileText}
          </AppText> */}
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
      <View style={styles.itemIconWrapper}>{/* <FnfNext /> */}</View>
    </View>
  );
};
function CommunityList() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
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
            profileImage={item.profileImage}
            index={index}
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
      {/* <AppTouchable style={styles.addNewIconWrapper}>
        <AddNewAsset />
      </AppTouchable> */}
    </View>
  );
}
const getStyles = (theme: AppTheme, index) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
      height: '60%',
      width: '100%',
    },
    listItemContainer: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(15),
      opacity: 0.4,
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
      width: '15%',
      alignItems: 'center',
    },
    listItemContentWrapper: {
      width: '70%',
      marginLeft: hp(15),
    },
    itemIconWrapper: {
      // width: '15%',
      alignItems: 'flex-end',
    },
    nameText: {
      color: theme.colors.secondaryHeadingColor,
    },
    giftTimeText: {
      color: theme.colors.secondaryHeadingColor,
    },
    profileTextStyle: {
      color: theme.colors.headingColor,
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 180 : 200,
      right: 30,
    },
  });
export default CommunityList;
