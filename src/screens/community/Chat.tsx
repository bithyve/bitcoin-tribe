import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@realm/react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import Toast from 'src/components/Toast';
import { HolepunchMessage } from 'src/services/messaging/holepunch/storage/MessageStorage';
import { RealmSchema } from 'src/storage/enum';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { ChatService } from 'src/services/messaging/ChatService';
import { useChat } from 'src/hooks/useChat';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppTouchable from 'src/components/AppTouchable';
import InfoIcon from 'src/assets/images/icon_info.svg';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disconnectedBanner: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  disconnectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joiningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  joiningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// No-op handlers for required props
const noop = () => { };

const Chat = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { room: HolepunchRoom } }>>();
  const { room } = route.params;
  
  // Use chat hook for all operations
  const { isJoiningRoom, isRootPeerConnected, joinRoom, leaveRoom, sendMessage, getPubKey } = useChat();
  const peerPubKey = getPubKey();
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const messages: HolepunchMessage[] = useQuery<HolepunchMessage>(RealmSchema.HolepunchMessage)
    .filtered('roomId == $0', room?.roomId) as any || [];


  useEffect(() => {
    joinRoomAndSync();
  }, [])
  
  const joinRoomAndSync = async () => {
    try {
      console.log('[Chat] 🔄 Joining room:', room.roomName);
      await joinRoom(room.roomKey, room.roomName, room.roomType, room.roomDescription, room.roomImage);
      console.log('[Chat] ✅ Joined room successfully');
      setHasJoinedRoom(true);
      
      // Sync messages after joining
      await syncMessages();
    } catch (error) {
      console.error('[Chat] ❌ Failed to join room:', error);
      Toast('Failed to join room', true);
      setHasJoinedRoom(false);
    }
  };

  const syncMessages = async () => {
    try {
      const lastSyncedIndex = messages.length;
      console.log('[Chat] 🔄 Requesting sync from index:', lastSyncedIndex);
      const adapter = ChatService.getInstance().getAdapter();
      const { success } = await adapter.requestSync(room.roomId, lastSyncedIndex)
      if (!success) throw new Error('Sync unsuccessful');
    } catch (error) {
      console.error('Failed to sync messages:', error);
      Toast('Failed to sync messages', true);
    }
  }

  const onPressSend = async () => {
    if (!message.trim()) return;
    
    // Check root peer connection before sending
    if (!isRootPeerConnected) {
      Toast('⚠️ Cannot send message - server is offline', true);
      return;
    }
    
    setSending(true);
    try {
      await sendMessage(message.trim());
      setMessage('');
    } catch (error) {
      Toast(error.message, true);
    } finally {
      setSending(false);
    }
  };



  const handleInfoPress = () => {
    (navigation as any).navigate(NavigationRoutes.GROUPINFO, { room });
  };

  return (
    <ScreenContainer>
        <AppHeader
          title={room?.roomName || 'Chat'}
          onBackNavigation={() => {
            leaveRoom();
            (navigation as any).navigate(NavigationRoutes.COMMUNITY);
          }}
          rightIcon={
            <AppTouchable onPress={handleInfoPress}>
                <InfoIcon width={24} height={24} />
            </AppTouchable>
          }
        />
      
      {/* Show joining banner while joining room */}
      {isJoiningRoom && !hasJoinedRoom && (
        <View style={styles.joiningContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.joiningText}>Joining room...</Text>
        </View>
      )}
      
      {/* Show disconnected banner when root peer is offline */}
      {!isRootPeerConnected && (
        <View style={styles.disconnectedBanner}>
          <Text style={styles.disconnectedText}>
            ⚠️ Server Offline - Cannot send messages
          </Text>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.container}>
        <View style={styles.container}>
          <MessageList
            messages={messages}
            sending={sending}
            flatListRef={flatListRef}
            peerPubKey={peerPubKey}
            onImagePress={noop}
            onPressReject={noop}
            onPressApprove={noop}
            viewTransaction={noop}
          />
          
          <MessageInput
            message={message}
            loading={sending}
            disabled={sending || !isRootPeerConnected || !hasJoinedRoom}
            onPressSend={onPressSend}
            setMessage={setMessage}
            onPressImage={noop}
            onPressRequest={noop}
            _onPressSend={noop}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default Chat;
