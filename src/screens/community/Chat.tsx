import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@realm/react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { TouchableOpacity } from 'react-native';
import { Alert, Clipboard } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { HolepunchMessage } from 'src/services/messaging/holepunch/storage/MessageStorage';
import { RealmSchema } from 'src/storage/enum';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { ChatService } from 'src/services/messaging/ChatService';

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
});

// No-op handlers for required props
const noop = () => { };

const Chat = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { currentRoom: HolepunchRoom, leaveRoom: Function, sendMessage: Function, peerPubKey: string } }>>();
  const { currentRoom, leaveRoom, sendMessage, peerPubKey } = route.params;
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isRootPeerConnected, setIsRootPeerConnected] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const messages: HolepunchMessage[] = useQuery<HolepunchMessage>(RealmSchema.HolepunchMessage)
    .filtered('roomId == $0', currentRoom?.roomId) as any || [];


  useEffect(() => {
    syncMessages();
    setupRootPeerListeners();
    
    // Check initial root peer connection status
    const adapter = ChatService.getInstance().getAdapter();
    const initialStatus = adapter.isRootPeerConnected();
    setIsRootPeerConnected(initialStatus);
    
    if (!initialStatus) {
      Toast('⚠️ Server offline - messages cannot be sent', true);
    }
    
    return () => {
      cleanupRootPeerListeners();
    };
  }, [])

  const setupRootPeerListeners = () => {
    const adapter = ChatService.getInstance().getAdapter();
    
    adapter.on('chat:root-peer-connected', handleRootPeerConnected);
    adapter.on('chat:root-peer-disconnected', handleRootPeerDisconnected);
  };
  
  const cleanupRootPeerListeners = () => {
    const adapter = ChatService.getInstance().getAdapter();
    
    adapter.off('chat:root-peer-connected', handleRootPeerConnected);
    adapter.off('chat:root-peer-disconnected', handleRootPeerDisconnected);
  };
  
  const handleRootPeerConnected = () => {
    console.log('[Chat] 🏰 Root peer connected');
    setIsRootPeerConnected(true);
    Toast('✅ Server connected - you can now send messages', false);
  };
  
  const handleRootPeerDisconnected = () => {
    console.log('[Chat] 👋 Root peer disconnected');
    setIsRootPeerConnected(false);
    Toast('⚠️ Server disconnected - messages cannot be sent', true);
  };

  const syncMessages = async () => {
    try {
      const lastSyncedIndex = messages.length;
      console.log('[Chat] 🔄 Requesting sync from index:', lastSyncedIndex);
      const adapter = ChatService.getInstance().getAdapter();
      const { success } = await adapter.requestSync(currentRoom.roomId, lastSyncedIndex)
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

  const handleHeaderLongPress = () => {
    if (!currentRoom?.roomKey) return;
    Alert.alert(
      'Room Key',
      currentRoom.roomKey,
      [
        {
          text: 'Copy',
          onPress: () => {
            if (typeof Clipboard?.setString === 'function') {
              Clipboard.setString(currentRoom.roomKey);
            }
          },
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <ScreenContainer>
      <TouchableOpacity activeOpacity={0.8} onLongPress={handleHeaderLongPress}>
        <AppHeader
          title={currentRoom?.roomName || 'Chat'}
          onBackNavigation={() => {
            leaveRoom();
            navigation.goBack();
          }}
        />
      </TouchableOpacity>
      
      {/* Show disconnected banner when root peer is offline */}
      {!isRootPeerConnected && (
        <View style={styles.disconnectedBanner}>
          <Text style={styles.disconnectedText}>
            ⚠️ Server Offline - Cannot send messages
          </Text>
        </View>
      )}
      
      <ModalLoading visible={sending} />
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
            disabled={sending || !isRootPeerConnected}
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
