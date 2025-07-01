import { Image, StyleSheet, View } from 'react-native'
import React from 'react'
import AppText from 'src/components/AppText'
import moment from 'moment'
import { Message, MessageType } from 'src/models/interfaces/Community'
import { AppTheme } from 'src/theme'
import { useTheme } from 'react-native-paper'

const getStyles = (theme: AppTheme) => StyleSheet.create({
  containerSender: {
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  containerReceiver: {
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  messageContainerSender: {
    backgroundColor: theme.dark ? '#353B44' : '#DADADA',
    padding: 15,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  messageContainerReceiver: {
    backgroundColor: theme.dark ? '#111111' : '#E9E9E9',
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
  textDay: {
    color: '#808080',
    textAlign: 'center',
    marginVertical: 10,
  },
  containerAlert: {
    alignSelf: 'center',
    marginVertical: 5,
    backgroundColor: theme.dark ? '#111111' : '#E9E9E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  textAlert: {
    color: theme.dark ? 'white' : 'black',
    textAlign: 'center',
    fontSize: 12,
  },
})

const MessageItem = ({ message, previousMessage, appId }: { message: Message, previousMessage: Message, appId: string }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const isSender = React.useMemo(() => message.sender === appId, [message.sender, appId])
  const time = React.useMemo(() => moment(message.createdAt).format('hh:mm A'), [message.createdAt])

  const isSameDay = React.useMemo(() => {
    if (!previousMessage) return false;
    return moment(message.createdAt).isSame(moment(previousMessage.createdAt), 'day');
  }, [message.createdAt, previousMessage?.createdAt])

  const Message = () => message.type === MessageType.Alert ? (
    <View style={styles.containerAlert}>
      <AppText style={styles.textAlert}>{message.text}</AppText>
    </View>
  ) : (
    <View style={isSender ? styles.containerSender : styles.containerReceiver}>
      <View style={isSender ? styles.messageContainerSender : styles.messageContainerReceiver}>
        {(() => {
          switch (message.type) {
            case MessageType.Image:
              return <Image source={{ uri: message.imageUrl }} style={{ width: 100, height: 100 }} />;
            default:
              return <AppText style={{ color: theme.dark ? 'white' : 'black' }}>{message.text || message.type}</AppText>;
          }
        })()}
      </View>
      <AppText variant='body2' style={isSender ? styles.textTimeSender : styles.textTimeReceiver}>{time}</AppText>
    </View>
  )

  return isSameDay ? <Message /> : 
  <View>
    <AppText variant='body2' style={styles.textDay}>{moment(message.createdAt).format('MMM DD, YYYY')}</AppText>
    <Message />
  </View>
}

export default MessageItem
