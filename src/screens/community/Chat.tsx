import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useObject, useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import ContactsManager from 'src/services/p2p/ChatPeerManager';
import { v4 as uuidv4 } from 'uuid';
import dbManager from 'src/storage/realm/dbManager';
import {
  Community,
  Contact,
  Message,
  MessageType,
  RequestStatus,
} from 'src/models/interfaces/Community';
import { launchImageLibrary } from 'react-native-image-picker';
import Relay from 'src/services/relay';
import ModalLoading from 'src/components/ModalLoading';
import ImageViewing from 'react-native-image-viewing';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ChatKeyManager } from 'src/utils/ChatEnc';
import { ApiHandler } from 'src/services/handler/apiHandler';
import WalletUtilities from 'src/services/wallets/operations/utils';
import Toast from 'src/components/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Chat = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { communityId: string } }>>();
  const communityId = route.params.communityId;
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const cm = ContactsManager.getInstance();
  const community = useObject<Community>(RealmSchema.Community, communityId);
  const messages = useQuery<Message>(RealmSchema.Message)
    .filtered('communityId = $0', communityId)
    .sorted('createdAt', true);
  const contact = useQuery<Contact>(RealmSchema.Contact).filtered(
    'contactKey = $0',
    community.with,
  )[0];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    cm.joinPeers(community.with);
  }, []);

  useEffect(() => {
    markAsRead();
  }, []);

  useEffect(() => {
    const payload = route.params?.payload;
    if (payload) {
      _sendMessage(payload.type, undefined, payload);
    }
  }, [route.params?.payload]);

  const _sendMessage = useCallback(
    async (type: MessageType, fileUrl?: string, request?: object) => {
      try {
        const messageData = {
          id: uuidv4(),
          text: message.trim(),
          createdAt: Date.now(),
          type: type,
          sender: app.contactsKey.publicKey,
          communityId: communityId,
          unread: false,
          fileUrl: fileUrl,
          request: request,
        };
        dbManager.createObject(RealmSchema.Message, messageData);
        const encryptedMessage = ChatKeyManager.encryptMessage(JSON.stringify({ ...messageData }), community.key);
        cm.sendMessage(community.with, JSON.stringify({ ...encryptedMessage, communityId }));
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [
      message,
      app.contactsKey.publicKey,
      communityId,
      community.with,
      flatListRef,
      setMessage,
      cm,
    ],
  );

  const onPressSend = async () => {
    try {
      _sendMessage(MessageType.Text);
    } catch (error) {
      console.error('Error creating chat room: ', error);
    }
  };

  const markAsRead = async () => {
    try {
      const unreadMessages = messages.filter(message => message.unread === true);
      unreadMessages.forEach(message => {
        dbManager.updateObjectByPrimaryId(
          RealmSchema.Message,
          'id',
          message.id,
          {
            unread: false,
          },
        );
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const onPressImage = useCallback(async () => {
    try {
      const image = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.4,
      });
      if (image.assets?.length > 0) {
        setSending(true);
        const response = await Relay.uploadFile(image.assets[0], app.authToken);
        setSending(false);
        if (response.fileUrl) {
          _sendMessage(MessageType.Image, response.fileUrl);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, [app.authToken, _sendMessage]);

  const onImagePress = (image: string) => {
    setSelectedImage(image);
    setVisible(true);
  };

  const onPressRequest = async () => {
    navigation.navigate(NavigationRoutes.REQUESTORSEND, {
      type: 'Request',
      communityId
    });
  };

  const _onPressSend = async () => {
    // navigation.navigate(NavigationRoutes.REQUESTORSEND, {
    //   type: 'Send',
    // });
  };

  const onPressReject = (message: Message) => {
    const messageData = {
      ...message,
      request: {
        ...message.request,
        status: RequestStatus.Rejected,
      },
    };
    dbManager.updateObjectByPrimaryId(RealmSchema.Message, 'id', message.id, {
      request: {
        ...message.request,
        status: RequestStatus.Rejected,
      },
    });
    const encryptedMessage = ChatKeyManager.encryptMessage(JSON.stringify({ ...messageData }), community.key);
    cm.sendMessage(community.with, JSON.stringify({ ...encryptedMessage, communityId }));
  };

  const viewTransaction = (message: Message) => {
    console.log('message', message);
    if(message.request?.txid) {
      navigation.navigate(NavigationRoutes.TRANSACTIONDETAILS, {txid: message.request?.txid})
    }
  }

  const onPressApprove = async (message: Message) => {
    try {
    const { address, options } = WalletUtilities.decodePaymentURI(message.request?.invoice);
    const { txid } = await ApiHandler.sendToAddress({
      recipient: {
        address: address,
        amount: options.amount * 1e8,
      },
      skipSync: false,
    });
   if(txid) {
    const messageData = {
      ...message,
      request: {
        ...message.request,
        status: RequestStatus.Accepted,
        txid: txid,
      },
    };
    dbManager.updateObjectByPrimaryId(RealmSchema.Message, 'id', message.id, {
      request: {
        ...message.request,
        status: RequestStatus.Accepted,
        txid: txid,
      },
    });
    const encryptedMessage = ChatKeyManager.encryptMessage(JSON.stringify({ ...messageData }), community.key);
    cm.sendMessage(community.with, JSON.stringify({ ...encryptedMessage, communityId }));
   }
    } catch (error) {
      Toast(error.message, true);
      console.error('Error approving request:', error);
    }
    console.log('approve', message);
  };

  return (
    <ScreenContainer>
      <AppHeader title={contact.name} />
      <ModalLoading visible={sending} />

      <ImageViewing
        images={[
          {
            uri: selectedImage,
          },
        ]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.container}>
          <MessageList
            messages={messages}
            sending={sending}
            flatListRef={flatListRef}
            appId={app.contactsKey.publicKey}
            onImagePress={onImagePress}
            onPressReject={onPressReject}
            onPressApprove={onPressApprove}
            viewTransaction={viewTransaction}
          />
          <MessageInput
            message={message}
            loading={sending}
            disabled={sending}
            onPressSend={onPressSend}
            setMessage={setMessage}
            onPressImage={onPressImage}
            onPressRequest={onPressRequest}
            _onPressSend={_onPressSend}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default Chat;
