import React, { useEffect, useState, useCallback } from 'react';
import { TextInput } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import HomeHeader from '../home/components/HomeHeader';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { hp } from 'src/constants/responsive';
import { useChat } from 'src/hooks/useChat';
import { HolepunchRoom, HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';


type RouteParams = {
  roomKey?: string;
  roomName?: string;
};

function CommunityNew() {
  const route = useRoute<RouteProp<{ params: RouteParams }>>();
  const [rooms, setRooms] = useState<HolepunchRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [manualRoomKey, setManualRoomKey] = useState('');
  const navigation = useNavigation();
  

  // Initialize P2P chat with useChat hook
  const {
    isInitializing,
    isCreatingRoom,
    error,
    isJoiningRoom,
    currentRoom,
    getAllRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    getPubKey,
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


  useEffect(() => {
    if (error) {
      Toast(error, true);
    }
  }, [error]);

  useEffect(() => {
    if(currentRoom) navigation.navigate(NavigationRoutes.CHAT, { currentRoom, leaveRoom, sendMessage, peerPubKey: getPubKey() });
  }, [currentRoom]);

  const [joiningRoomKey, setJoiningRoomKey] = useState<string | null>(null);
  const handleJoinRoom = async (roomKey: string, roomName?: string) => {
    if (isJoiningRoom || joiningRoomKey === roomKey) {
      console.log('Joining already in progress, preventing multiple joins...');
      return;
    }
    setJoiningRoomKey(roomKey);
    try {
      await joinRoom(roomKey, roomName);
      Toast('Joined room successfully', false);
      // Reload rooms after joining (case: new room joined)
      await loadRooms();
    } catch (err) {
      console.error('Failed to join room:', err);
      Toast('Failed to join room', true);
    } finally {
      setJoiningRoomKey(null);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const roomNumber = (Math.random() * 1000).toFixed(0);
      await createRoom(`New Tribe Room ${roomNumber}`, HolepunchRoomType.GROUP, `Description for room ${roomNumber}`, '');
      Toast('Room created! Share the room key to invite others.', false);
      // Reload rooms after creation
      await loadRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
      Toast('Failed to create room', true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const renderRoomItem = ({ item }: { item }) => {
    const isJoiningThisRoom = joiningRoomKey === item.roomKey && isJoiningRoom;
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => handleJoinRoom(item.roomKey, item.roomName)}
        disabled={isJoiningThisRoom}
        activeOpacity={isJoiningThisRoom ? 1 : 0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.roomName}>{item.roomName}</Text>
          {isJoiningThisRoom && <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />}
        </View>
        <Text style={styles.roomKey}>{item.roomKey.substring(0, 16)}...</Text>
      </TouchableOpacity>
    );
  };


  return (
    <ScreenContainer style={styles.container}>
      <ModalLoading visible={isInitializing || isCreatingRoom} />
      
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showAdd />
      </View>

      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <Text>Initializing P2P chat...</Text>
        </View>
      ) : (
        <>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateRoom}
              disabled={isCreatingRoom}
            >
              <Text style={styles.buttonText}>
                {isCreatingRoom ? 'Creating...' : 'Create New Community'}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                placeholder="Enter Room Key"
                value={manualRoomKey}
                onChangeText={setManualRoomKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.createButton, { paddingHorizontal: 12 }]}
                onPress={() => handleJoinRoom(manualRoomKey)}
                disabled={(manualRoomKey && isJoiningRoom) || !manualRoomKey.trim()}
              >
                <Text style={styles.buttonText}>
                  {(manualRoomKey && isJoiningRoom) ? 'Joining...' : 'Join Room'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={rooms}
            keyExtractor={(item) => item.roomKey }
            renderItem={renderRoomItem}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No communities yet</Text>
                <Text style={styles.emptySubtext}>
                  Create a new community or join one
                </Text>
              </View>
            }
            style={styles.flatList}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#24262B',
  },
  headerWrapper: {
    marginVertical: hp(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    padding: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
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
  },
});

export default CommunityNew;
