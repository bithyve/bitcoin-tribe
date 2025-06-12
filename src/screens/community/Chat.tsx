import { FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenContainer from 'src/components/ScreenContainer'
import AppHeader from 'src/components/AppHeader'
import { useRoute } from '@react-navigation/native'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import { TribeApp } from 'src/models/interfaces/TribeApp'
import { useObject, useQuery } from '@realm/react'
import { RealmSchema } from 'src/storage/enum'
import ContactsManager from 'src/services/p2p/ContactsManager'
import { v4 as uuidv4 } from 'uuid';
import dbManager from 'src/storage/realm/dbManager'

interface Community {
  id: string;
  name?: string;
  publicKey?: string;
  messages?: Array<{
    id: string;
    message?: string;
    createdAt: number;
    type?: string;
    senderPublicKey: string;
    senderName: string;
  }>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const Chat = () => {
  const route = useRoute();
  const room = route.params.room;
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const cm = ContactsManager.getInstance()
  const community = useObject<Community>(RealmSchema.Community, room.publicKey);  

  useEffect(() => {
      cm.joinPeers(room.publicKey)
  }, []);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    try {

      cm.setOnMessageListener(handleMessage)
    } catch (error) {
      console.error('Error setting up rooms listener:', error);
    }
  };

  const handleMessage = (data) => { 
    const payload = JSON.parse(data.data)
    dbManager.updateObjectByPrimaryId(RealmSchema.Community, 'id', room.publicKey, {
      messages: [...(community.messages || []), {
        id: payload.id,
        message: payload.message,
        createdAt: new Date().getTime(),
        type: payload.type,
        senderPublicKey: payload.senderPublicKey,
        senderName: payload.senderName,
      }]
    })
  }

  const onPressSend = async () => {
    try {
      const messageData = {
        id: uuidv4(),
        message,
        createdAt: Date.now(),
        type: 'TEXT', // TODO: add type
        senderPublicKey: app.contactsKey.publicKey,
        senderName: 'Satoshi',
        publicKey: room.publicKey,
      };
      cm.sendMessage(room.publicKey, JSON.stringify({...messageData}));
      setMessage('');
      dbManager.updateObjectByPrimaryId(RealmSchema.Community, 'id', room.publicKey, {
        messages: [...(community.messages || []), messageData]
      });
    } catch (error) {
      console.error('Error creating chat room: ', error);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={room.name} />

      <View style={styles.container}>
        <MessageList messages={community.messages} sending={sending} flatListRef={flatListRef} appId={app.contactsKey.publicKey}/>
        <MessageInput onPressSend={onPressSend} message={message} setMessage={setMessage} loading={sending} disabled={sending} />
      </View>
    </ScreenContainer>
  )
}

export default Chat
