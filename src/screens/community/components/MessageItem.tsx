import { StyleSheet, View } from 'react-native';
import React from 'react';
import AppText from 'src/components/AppText';
import moment from 'moment';
import {
  Message,
} from 'src/models/interfaces/Community';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { HolepunchMessage, HolepunchMessageType } from 'src/services/messaging/holepunch/storage/MessageStorage';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
      fontSize: 11,
    },
    textTimeReceiver: {
      color: '#808080',
      textAlign: 'right',
      fontSize: 11,
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
    image: {
      width: 250,
      height: 250,
      resizeMode: 'contain',
      borderRadius: 10,
    },
    imageContainer: {
      justifyContent: 'center',
      gap: 10,
      width: 250,
    },
    requestContainer: {
      justifyContent: 'center',
      gap: 10,
      width: 200,
    },
    imgRequestSats: {
      width: 80,
      height: 80,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: 10,
    },
    containerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonApprove: {
      backgroundColor: '#4CD964',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonReject: {
      backgroundColor: '#EC5557',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

const MessageItem = ({
  message,
  previousMessage,
  peerPubKey,
  onImagePress,
  onPressReject,
  onPressApprove,
  viewTransaction,
}: {
  message: HolepunchMessage;
  previousMessage: HolepunchMessage;
  peerPubKey: string;
  onImagePress: (image: string) => void;
  onPressReject: (message: Message) => void;
  onPressApprove: (message: Message) => void;
  viewTransaction: (message: Message) => void;
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const isSender = React.useMemo(
    () => message.senderId === peerPubKey,
    [message.senderId],
  );
  const time = React.useMemo(
    () => moment(message.timestamp).format('hh:mm A'),
    [message.timestamp],
  );

  const isSameDay = React.useMemo(() => {
    if (!previousMessage) return false;
    return moment(message.timestamp).isSame(
      moment(previousMessage.timestamp),
      'day',
    );
  }, [message.timestamp, previousMessage?.timestamp]);

  const Message = () =>
   (
      <View
        style={isSender ? styles.containerSender : styles.containerReceiver}>
        <View
          style={
            isSender
              ? styles.messageContainerSender
              : styles.messageContainerReceiver
          }>
          {(() => {
            switch (message.messageType) {
              case HolepunchMessageType.TEXT:
                return (
                  <View>
                    <AppText style={{ color: theme.dark ? 'white' : 'black' }}>
                      {message.content}
                    </AppText>
                    <AppText
                      variant="body2"
                      style={
                        isSender
                          ? styles.textTimeSender
                          : styles.textTimeReceiver
                      }>
                      {time}
                    </AppText>
                  </View>
                );
            }
          })()}
        </View>
      </View>
    );

  return isSameDay ? (
    <Message />
  ) : (
    <View>
      <AppText variant="body2" style={styles.textDay}>
        {moment(message.timestamp).format('MMM DD, YYYY')}
      </AppText>
      <Message />
    </View>
  );
};

export default MessageItem;
