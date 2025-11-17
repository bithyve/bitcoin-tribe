import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, View, FlatList, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AppText from 'src/components/AppText';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ShowQr from 'src/assets/images/showQr.svg';
import ShowQrLight from 'src/assets/images/showQrLight.svg';
import AppTouchable from 'src/components/AppTouchable';
import GoBack from 'src/assets/images/icon_back.svg';
import GoBackLight from 'src/assets/images/icon_back_light.svg';
import { HolepunchRoom, HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { HolepunchPeer } from 'src/services/messaging/holepunch/storage/PeerStorage';

export const GroupInfo = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { room: HolepunchRoom, peersMap: Map<string, HolepunchPeer> } }>>();
  const { room, peersMap } = route.params;
  const [members, setMembers] = useState<HolepunchPeer[]>(Array.from(peersMap.values()));

  const renderMemberItem = ({ item }: { item: HolepunchPeer }) => (
    <View style={styles.card}>
      {item.peerImage ? (
        <Image source={{ uri: item.peerImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderImage]}>
          <AppText variant="heading3SemiBold">{(item.peerName || item.peerId)?.charAt(0).toUpperCase() || '?'}</AppText>
        </View>
      )}
      <AppText variant="heading3SemiBold">{item.peerName || item.peerId?.substring(0, 20)}</AppText>
      {/* <AppText variant="body2" style={{ fontSize: 11 }}>{` pubKey: ${item.peerId?.substring(0, 20)}`}</AppText> */}
    </View>
  );

  const handleScan = () => {
    try {

      if (room.roomType === HolepunchRoomType.DIRECT_MESSAGE) {
        Toast('Group info is not available for DM', true);
        return;
      }

      navigation.dispatch(
        CommonActions.navigate(NavigationRoutes.GROUPQR, {
          room,
        }),
      );
    } catch (error) {
      console.error('Error navigating to scan screen:', error);
      Toast(common.failedToOpenScanner, true);
    }
  };

  const HeaderComponent = () => {
    return (
      <>
        <View style={styles.groupImageCtr}>
          {room.roomImage ? (
            <Image
              source={{ uri: room.roomImage }}
              style={styles.groupImage}
            />
          ) : (
            <View style={[styles.groupImage, styles.placeholderImage]}>
              <AppText variant="heading1" style={styles.placeholderText}>
                {room.roomName?.charAt(0).toUpperCase() || '?'}
              </AppText>
            </View>
          )}
        </View>

        <AppText variant="heading3SemiBold" style={styles.title}>
          {room.roomName || 'Unnamed Group'}
        </AppText>
        <AppText variant="body2" style={styles.subTitle}>
          {room.roomDescription || 'No description available'}
        </AppText>
        <View style={styles.divider} />
        {members.length ? (
          <AppText variant="body1Bold" style={{ marginBottom: hp(20) }}>
            {`${members.length > 1 ? community.members : 'Member'}`}
          </AppText>
        ) : null}

      </>
    );
  };

  // TODO: Implement edit group functionality
  // const onEditGroupInfo = () => {
  //   navigation.dispatch(
  //     CommonActions.navigate(NavigationRoutes.EDITGROUP, {
  //       groupName: room.roomName,
  //       groupDesc: room.roomDescription,
  //       groupImage: room.roomImage,
  //       roomKey: room.roomKey,
  //     }),
  //   );
  // };

  return (
    <ScreenContainer>
      {
        room.roomType === HolepunchRoomType.DIRECT_MESSAGE ? null : (
          <CustomHeader
            title={community.groupInfo}
            onBackNavigation={() => navigation.goBack()}
            rightIcon={theme.dark ? <ShowQr /> : <ShowQrLight />}
            onSettingsPress={handleScan}
          // ternaryIcon={theme.dark ? <Edit /> : <EditLight />}
          // onTernaryIconPress={onEditGroupInfo}
          />
        )
      }

      <View style={styles.bodyWrapper}>
        <FlatList
          ListHeaderComponent={HeaderComponent}
          data={members}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMemberItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bodyWrapper: {
      flex: 1,
    },
    groupImageCtr: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: wp(10),
    },
    groupImage: {
      height: wp(150),
      width: wp(150),
      borderRadius: wp(150)
    },
    title: {
      marginTop: hp(22),
      textAlign: 'center',
    },
    subTitle: {
      marginTop: hp(10),
      textAlign: 'center',
      paddingHorizontal: wp(20),
      color: theme.colors.secondaryHeadingColor,
    },
    divider: {
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.optionsCardGradient2,
      marginTop: hp(20),
      marginBottom: hp(16),
    },
    desc: {
      color: theme.colors.secondaryHeadingColor,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(15),
      marginBottom: hp(17),
    },
    avatar: {
      width: wp(50),
      height: wp(50),
      borderRadius: wp(50),
    },
    placeholderImage: {
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: wp(75),
    },
    placeholderText: {
      color: '#FFFFFF',
      fontSize: 60,
    },
  });

const CustomHeader = ({
  title,
  onBackNavigation,
  rightIcon,
  onSettingsPress,
  // ternaryIcon,
  // onTernaryIconPress,
}) => {
  const theme: AppTheme = useTheme();
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginTop: Platform.OS === 'android' ? hp(20) : 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    flexOne: { flex: 1 },
    headerTitle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
    },
    endCtr: { flexDirection: 'row', gap: wp(4), justifyContent: 'flex-end' },
  });
  return (
    <View style={styles.container}>
      <View style={styles.flexOne}>
        <AppTouchable onPress={onBackNavigation}>
          {theme.dark ? <GoBack /> : <GoBackLight />}
        </AppTouchable>
      </View>
      <View style={styles.flexOne}>
        <AppText variant="heading3" style={styles.headerTitle}>
          {title}
        </AppText>
      </View>
      <View style={[styles.flexOne, styles.endCtr]}>
        <AppTouchable onPress={onSettingsPress}>{rightIcon}</AppTouchable>
        {/* <AppTouchable onPress={onTernaryIconPress}>{ternaryIcon}</AppTouchable> */}
      </View>
    </View>
  );
};
