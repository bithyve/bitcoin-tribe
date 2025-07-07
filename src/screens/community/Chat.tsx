import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenContainer from 'src/components/ScreenContainer'
import AppHeader from 'src/components/AppHeader'
import { useRoute } from '@react-navigation/native'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import { TribeApp } from 'src/models/interfaces/TribeApp'
import { useObject, useQuery } from '@realm/react'
import { RealmSchema } from 'src/storage/enum'
import ContactsManager from 'src/services/p2p/ChatPeerManager'
import { v4 as uuidv4 } from 'uuid';
import dbManager from 'src/storage/realm/dbManager'
import { Community, Contact, Message, MessageType } from 'src/models/interfaces/Community'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const Chat = () => {
  const route = useRoute();
  const communityId = route.params.communityId;
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const cm = ContactsManager.getInstance()
  const community = useObject<Community>(RealmSchema.Community, communityId); 
  const messages = useQuery<Message>(RealmSchema.Message).filtered('communityId = $0', communityId).sorted('createdAt', true);
  const contact = useQuery<Contact>(RealmSchema.Contact).filtered('contactKey = $0', community.with)[0];

  useEffect(() => {
      cm.joinPeers(community.with)
  }, []);

  useEffect(() => {
    markAsRead();
  }, []);

  const onPressSend = async () => {
    try {
      const messageData = {
        id: uuidv4(),
        text: message,
        createdAt: Date.now(),
        type: MessageType.Text,
        sender: app.contactsKey.publicKey,
        communityId: communityId,
        unread: false,
      };
      cm.sendMessage(community.with, JSON.stringify({...messageData}));
      setMessage('');

      dbManager.createObject(RealmSchema.Message, messageData)

      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    } catch (error) {
      console.error('Error creating chat room: ', error);
    }
  }

  const markAsRead = async () => {
    try {
      const unreadMessages = messages.filter(message => message.unread);
      unreadMessages.forEach(message => {
        dbManager.updateObjectByPrimaryId(RealmSchema.Message, 'id', message.id, {
          unread: false,
        })
      })
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={contact.name} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      <View style={styles.container}>
        <MessageList messages={messages} sending={sending} flatListRef={flatListRef} appId={app.contactsKey.publicKey}/>
        <MessageInput onPressSend={onPressSend} message={message} setMessage={setMessage} loading={sending} disabled={sending} />
      </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default Chat
