import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@realm/react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import Toast from 'src/components/Toast';
import { HolepunchMessage, HolepunchMessageType } from 'src/services/messaging/holepunch/storage/MessageStorage';
import { RealmSchema } from 'src/storage/enum';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { useChat } from 'src/hooks/useChat';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppTouchable from 'src/components/AppTouchable';
import InfoIconLight from 'src/assets/images/ic_info_light.svg';
import InfoIcon from 'src/assets/images/ic_info.svg';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import GoBack from 'src/assets/images/icon_back.svg';
import GoBackLight from 'src/assets/images/icon_back_light.svg';
import AppText from 'src/components/AppText';
import { wp } from 'src/constants/responsive';
import { HolepunchPeer } from 'src/services/messaging/holepunch/storage/PeerStorage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // header
  headerCtr: { flexDirection: 'row' },
  headerLeftCtr: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  headerLoadCtr: { flexDirection: 'row', gap: wp(10) },
});

// No-op handlers for required props
const noop = () => { };

const Chat = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { roomId: string } }>>();
  const { roomId } = route.params;
  const [peersMap, setPeersMap] = useState<Map<string, HolepunchPeer>>(new Map());

  // Use chat hook for all operations
  const {
    isJoiningRoom,
    isRootPeerConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    getCurrentPeerPubKey,
    getPeersForRoom,
    sessionMessages,
  } = useChat();
  const currentPeerPubKey = getCurrentPeerPubKey();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const room: HolepunchRoom = useQuery<HolepunchRoom>(RealmSchema.HolepunchRoom).filtered('roomId == $0', roomId)[0] as any;
  const commitedMessages: HolepunchMessage[] =
    (useQuery<HolepunchMessage>(RealmSchema.HolepunchMessage).filtered(
      'roomId == $0',
      room?.roomId,
    ) as any) || [];
  const [messages, setMessages] = useState<HolepunchMessage[]>([]);

  useEffect(() => {
    const combinedMessages = [...commitedMessages, ...sessionMessages];
    setMessages(combinedMessages);
  }, [commitedMessages.length, sessionMessages])

  const loadPeers = async () => {
    try {
      const peers = await getPeersForRoom(room.roomId);
      // create a map of peerId to Peer object
      const peersMap: Map<string, HolepunchPeer> = new Map(peers.map((peer: HolepunchPeer) => [peer.peerId, peer]));
      setPeersMap(peersMap);
    } catch (err) {
      console.error('[Chat] ❌ Failed to load peers:', err);
      Toast('Failed to load peers', true);
    }
  };

  const loginToRoom = async () => {
    try {
      console.log('[Chat] 🔄 Joining room:', room.roomName);
      const lastSyncedIndex = commitedMessages.length;
      await joinRoom(room.roomKey, lastSyncedIndex);
      console.log('[Chat] ✅ Joined room successfully');
      setHasJoinedRoom(true);
    } catch (error) {
      console.error('[Chat] ❌ Failed to join room:', error);
      Toast('Failed to join room', true);
      setHasJoinedRoom(false);
    }
  };


  useEffect(() => {
    loginToRoom();
  }, []);

  useEffect(() => {
    loadPeers(); // Load peers for the room
  }, [room.peers.length])

  const onPressSend = async () => {
    if (!message.trim()) return;

    // Check root peer connection before sending
    if (!isRootPeerConnected) {
      Toast('Cannot send message - server is offline', true);
      return;
    }

    setSending(true);
    try {
      await sendMessage(message.trim(), HolepunchMessageType.TEXT);
      setMessage('');
    } catch (error) {
      Toast(error.message, true);
    } finally {
      setSending(false);
    }
  };

  const handleInfoPress = () => {
    (navigation as any).navigate(NavigationRoutes.GROUPINFO, { room, peersMap });
  };

  return (
    <ScreenContainer>
      <CustomHeader
        title={room?.roomName || 'Chat'}
        joining={isJoiningRoom && !hasJoinedRoom}
        onBackNavigation={() => {
          leaveRoom();
          setMessages([]);
          (navigation as any).navigate(NavigationRoutes.COMMUNITY);
        }}
        rightIcon={
          <AppTouchable onPress={handleInfoPress}>
            {theme.dark ? <InfoIcon /> : <InfoIconLight />}
          </AppTouchable>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.container}>
        <View style={styles.container}>
          <MessageList
            messages={messages}
            sending={sending}
            flatListRef={flatListRef}
            currentPeerPubKey={currentPeerPubKey}
            peersMap={peersMap}
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

const CustomHeader = ({
  title,
  onBackNavigation = null,
  rightIcon,
  joining,
}) => {
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={styles.headerCtr}>
      <View style={styles.headerLeftCtr}>
        <AppTouchable onPress={onBackNavigation}>
          {isThemeDark ? <GoBack /> : <GoBackLight />}
        </AppTouchable>
        <View>
          {joining ? (
            <View style={styles.headerLoadCtr}>
              <ActivityIndicator />
              <AppText variant="heading3" numberOfLines={1}>
                Joining...
              </AppText>
            </View>
          ) : (
            <AppText variant="heading3" numberOfLines={1}>
              {title}
            </AppText>
          )}
        </View>
      </View>
      <View>{rightIcon}</View>
    </View>
  );
};
