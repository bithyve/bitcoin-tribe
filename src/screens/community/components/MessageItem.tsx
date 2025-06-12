import { StyleSheet, View } from 'react-native'
import React from 'react'
import AppText from 'src/components/AppText'
import moment from 'moment'

const styles = StyleSheet.create({
  containerSender: {
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  containerReceiver: {
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  messageContainerSender: {
    backgroundColor: '#353B44',
    padding: 15,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  messageContainerReceiver: {
    backgroundColor: '#111111',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 10,
  },
  textTimeSender: {
    color: '#808080',
    textAlign: 'right',
  },
  textTimeReceiver: {
    color: '#808080',
  },
})

const MessageItem = ({ message, appId }) => {

  const isSender = React.useMemo(() => message.senderPublicKey === appId, [message.senderPublicKey, appId])
  const time = React.useMemo(() => moment(message.createdAt).format('hh:mm A'), [message.createdAt])

  return (
    <View style={isSender ? styles.containerSender : styles.containerReceiver}>
      <View style={isSender ? styles.messageContainerSender : styles.messageContainerReceiver}>
        <AppText style={{ color: 'white' }}>{message.message}</AppText>
      </View>
      <AppText variant='body2' style={isSender ? styles.textTimeSender : styles.textTimeReceiver}>{time}</AppText>
    </View>
  )
}

export default MessageItem
