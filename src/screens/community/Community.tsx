import React, { useEffect, useState, useCallback, useContext } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import HomeHeader from '../home/components/HomeHeader';
import { StyleSheet, View, FlatList, Text, Image, Modal, Share } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { useChat } from 'src/hooks/useChat';
import { HolepunchRoom, HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import { formatSmartTime } from 'src/utils/snakeCaseToCamelCaseCase';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import EmptyCommunityIllustration from 'src/assets/images/emptyCommunityIllustration.svg';
import EmptyCommunityIllustrationLight from 'src/assets/images/emptyCommunityIllustration_light.svg';
import { AppContext } from 'src/contexts/AppContext';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';

function Community() {
  const theme: AppTheme = useTheme();
  const [rooms, setRooms] = useState<HolepunchRoom[]>([]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;
  const {communityStatus,setCommunityStatus } =
    useContext(AppContext);

  // Initialize P2P chat with useChat hook
  const {
    isInitializing,
    isRootPeerConnected,
    isReconnecting,
    error,
    getAllRooms,
    reconnectRootPeer,
    initializeInbox,
    getCurrentPeerPubKey,
  } = useChat();

  // Only get public key if service is initialized
  const userPublicKey = !isInitializing ? getCurrentPeerPubKey() : null;

  // Load rooms from storage and filter by type
  const loadRooms = useCallback(async () => {
    try {
      const savedRooms = await getAllRooms();
      
      // Filter out inbox rooms
      const filteredRooms = (savedRooms || []).filter(
        r => r.roomType !== HolepunchRoomType.INBOX
      );
      
      setRooms(filteredRooms);
    } catch (e) {
      setRooms([]);
    }
  }, [getAllRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Reload rooms and initialize inbox when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[Community] Screen focused, reloading rooms and initializing inbox...');
      loadRooms();
      
      // Initialize inbox if root peer is connected
      const initInbox = async () => {
        if (!isRootPeerConnected) {
          console.warn('[Community] Root peer not connected yet, skipping inbox initialization');
          return;
        }
        
        try {
          await initializeInbox();
          console.log('[Community] ✅ Inbox initialized successfully');
        } catch (error) {
          console.error('[Community] Failed to initialize inbox:', error);
        }
      };
      
      initInbox();
    }, [loadRooms, isRootPeerConnected, initializeInbox]),
  );

  useEffect(() => {
    if (error) {
      Toast(error, true);
    }
  }, [error]);

  const handleOpenRoom = (room: HolepunchRoom) => {
    // Navigate immediately without waiting for join
    (navigation as any).navigate(NavigationRoutes.CHAT, {
      roomId: room.roomId,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // If root peer is disconnected, try to reconnect
      if (!isRootPeerConnected) {
        console.log(
          '[Community] 🔄 Root peer disconnected, attempting reconnection...',
        );
        try {
          await reconnectRootPeer();
          setCommunityStatus('connected');
        } catch (reconnectError) {
          console.error('[Community] Failed to reconnect:', reconnectError);
          Toast('Could not reconnect to server', true);
        }
      }

      // Always reload rooms list
      await loadRooms();
    } catch (error) {
      console.error('[Community] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
  if(!isInitializing && !isRootPeerConnected)
    setCommunityStatus('offline');
  else if(communityStatus)
    setCommunityStatus('online');
  }, [isInitializing,isRootPeerConnected]);


  const renderRoomItem = ({ item }: { item }) => {
    return (
      <AppTouchable
        style={styles.roomCard}
        onPress={() => handleOpenRoom(item)}
        activeOpacity={0.7}>
        <View style={styles.roomCardRow}>
          {item.roomImage ? (
            <Image
              style={styles.roomImage}
              source={{ uri: item.roomImage ?? '' }}
            />
          ) : (
            <View style={styles.roomImage} />
          )}
          <View>
            <AppText variant="heading3SemiBold">{item.roomName}</AppText>
            <AppText variant="caption" style={styles.roomDesc}>
              {item.roomDescription}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" style={styles.roomTime}>
          {formatSmartTime(item?.lastActive)}
        </AppText>
      </AppTouchable>
    );
  };

  const ItemSeparatorComponent = () => <View style={styles.listSeparator} />;

  return (
    <ScreenContainer style={styles.container}>
      <ModalLoading visible={isInitializing || isReconnecting} />
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showAdd />
      </View>

      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <Text>Initializing P2P chat...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.roomKey}
          renderItem={renderRoomItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <EmptyStateView
              title={community.noConnectionTitle}
              subTitle={community.noConnectionSubTitle}
              IllustartionImage={
                isThemeDark ? (
                  <EmptyCommunityIllustration />
                ) : (
                  <EmptyCommunityIllustrationLight />
                )
              }
            />
          }
          style={styles.flatList}
          ItemSeparatorComponent={ItemSeparatorComponent}
        />
      )}
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 0,
    },
    listSeparator: {
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.optionsCardGradient2,
      marginVertical: hp(15),
    },
    roomCard: { flexDirection: 'row', justifyContent: 'space-between' },
    roomCardRow: {
      gap: wp(15),
      flexDirection: 'row',
      alignItems: 'center',
    },
    roomTime: {
      color: theme.colors.mutedTab,
      paddingTop: hp(10),
    },
    roomImage: {
      height: wp(50),
      width: wp(50),
      borderRadius: wp(50),
      backgroundColor: theme.colors.mutedTab,
    },

    //
    disconnectedBanner: {
      backgroundColor: '#FFA500',
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    disconnectedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    headerWrapper: {
      marginVertical: hp(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flatList: {
      flex: 1,
    },
    emptyListContent: {
      // flexGrow: 1,
    },

    roomName: {
      marginBottom: hp(3),
    },
    roomDesc: {
      color: theme.colors.mutedTab,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: '#666666',
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });

export default Community;
