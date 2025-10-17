import React, { useEffect, useState, useCallback } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import HomeHeader from '../home/components/HomeHeader';
import { StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { hp } from 'src/constants/responsive';
import { useChat } from 'src/hooks/useChat';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';

function Community() {
  const [rooms, setRooms] = useState<HolepunchRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  

  // Initialize P2P chat with useChat hook
  const {
    isInitializing,
    isRootPeerConnected,
    isReconnecting,
    error,
    getAllRooms,
    reconnectRootPeer,
  } = useChat();

  // Load rooms from storage
  const loadRooms = useCallback(async () => {
    try {
      const savedRooms = await getAllRooms();
      setRooms(savedRooms || []);
    } catch (e) {
      setRooms([]);
    }
  }, [getAllRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Reload rooms when screen comes into focus (e.g., navigating back from Chat)
  useFocusEffect(
    useCallback(() => {
      console.log('[Community] Screen focused, reloading rooms...');
      loadRooms();
    }, [loadRooms])
  );

  useEffect(() => {
    if (error) {
      Toast(error, true);
    }
  }, [error]);
  
  const handleOpenRoom = (room: HolepunchRoom) => {
    // Navigate immediately without waiting for join
    (navigation as any).navigate(NavigationRoutes.CHAT, { 
      room: room
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // If root peer is disconnected, try to reconnect
      if (!isRootPeerConnected) {
        console.log('[Community] 🔄 Root peer disconnected, attempting reconnection...');
        try {
          await reconnectRootPeer();
          Toast('✅ Reconnected to server', false);
        } catch (reconnectError) {
          console.error('[Community] Failed to reconnect:', reconnectError);
          Toast('⚠️ Could not reconnect to server', true);
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

  const renderRoomItem = ({ item }: { item }) => {
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => handleOpenRoom(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.roomName}>{item.roomName}</Text>
        <Text style={styles.roomKey}>{item.roomDescription}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <ScreenContainer style={styles.container}>
      <ModalLoading visible={isInitializing || isReconnecting} />
      
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showAdd />
      </View>

      {/* Root Peer Connection Status Banner */}
      {!isInitializing && !isRootPeerConnected && (
        <View style={styles.disconnectedBanner}>
          <Text style={styles.disconnectedText}>
            ⚠️ Server Offline - Pull down to reconnect
          </Text>
        </View>
      )}

      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <Text>Initializing P2P chat...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.roomKey }
          renderItem={renderRoomItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerStyle={rooms.length === 0 ? styles.emptyListContent : undefined}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No communities yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to create or join a community
              </Text>
            </View>
          }
          style={styles.flatList}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
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
    paddingHorizontal: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  roomItem: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roomKey: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
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
