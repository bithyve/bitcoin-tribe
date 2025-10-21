import { FlatList, StyleSheet, View } from 'react-native';
import React from 'react';
import MessageItem from './MessageItem';

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  divider: {
    height: 1,
  },
});

const MessageList = ({
  messages,
  sending,
  flatListRef,
  currentPeerPubKey,
  peersMap,
  onImagePress,
  onPressReject,
  onPressApprove,
  viewTransaction,
}) => {
  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  return (
    <FlatList
      ref={flatListRef}
      data={reversedMessages}
      style={{ flex: 1, paddingBottom: 10 }}
      extraData={[messages, sending]}
      contentContainerStyle={styles.list}
      inverted={true}
      showsVerticalScrollIndicator={false}
      // ListEmptyComponent={() => (
      //   <Text style={styles.textEmpty}>No messages</Text>
      // )}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      renderItem={({ item, index }) => {
        const peer = peersMap.get(item.senderId);

        return (<MessageItem
          message={item}
          previousMessage={reversedMessages[index + 1]}
          currentPeerPubKey={currentPeerPubKey}
          peer={peer}
          onImagePress={onImagePress}
          onPressReject={onPressReject}
          onPressApprove={onPressApprove}
          viewTransaction={viewTransaction}
        />);
      }}
    />
  );
};

export default MessageList;
