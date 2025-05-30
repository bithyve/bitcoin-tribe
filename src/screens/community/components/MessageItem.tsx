import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const styles = StyleSheet.create({
  containerSender: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#353B44',
    alignSelf: 'flex-end',
  },
  containerReceiver: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignSelf: 'flex-start',
  }
})

const MessageItem = ({ message, appId }) => {

  return (
    <View style={message.sender === appId ? styles.containerSender : styles.containerReceiver}>
      <Text style={{ color: 'white' }}>{message.data.message}</Text>
    </View>
  )
}

export default MessageItem
