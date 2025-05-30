import { FlatList, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenContainer from 'src/components/ScreenContainer'
import AppHeader from 'src/components/AppHeader'
import { useRoute } from '@react-navigation/native'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import { TribeApp } from 'src/models/interfaces/TribeApp'
import { useQuery } from '@realm/react'
import { RealmSchema } from 'src/storage/enum'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const Chat = () => {
  const room = useRoute().params.room;
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const encKey = room.keys[Object.keys(room.keys).find(key => key !== app.id)];


  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    try {

    } catch (error) {
      console.error('Error setting up rooms listener:', error);
    }
  };

  const onPressSend = async () => {
    try {
      const encrypted = {
        message: message,
        createdAt: new Date().toISOString(),
        messageType: 'TEXT',
      };
      setMessage('')
    } catch (error) {
      console.error('Error creating chat room: ', error);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title={room.name} />

      <View style={styles.container}>
        <MessageList messages={messages} sending={sending} flatListRef={flatListRef} appId={app.id}/>
        <MessageInput onPressSend={onPressSend} message={message} setMessage={setMessage} loading={sending} disabled={sending} />
      </View>
    </ScreenContainer>
  )
}

export default Chat
