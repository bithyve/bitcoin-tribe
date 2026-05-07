import { FlatList, StyleSheet, View } from 'react-native';
import React from 'react';
import MessageItem from './MessageItem';
import type { Message } from 'src/models/interfaces/Community';
import type { HolepunchMessage } from 'src/services/messaging/holepunch/storage/MessageStorage';
import type { HolepunchPeer } from 'src/services/messaging/holepunch/storage/PeerStorage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
  },
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
}: {
  messages: HolepunchMessage[];
  sending: boolean;
  flatListRef: React.RefObject<FlatList>;
  currentPeerPubKey: string;
  peersMap: Map<string, HolepunchPeer>;
  onImagePress: (image: string) => void;
  onPressReject: (message: Message) => void;
  onPressApprove: (message: Message) => void;
  viewTransaction: (message: Message) => void;
}) => {
  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);
  const keyExtractor = React.useCallback(
    (item: HolepunchMessage, index: number) =>
      item.messageId || `${item.senderId}-${item.timestamp}-${index}`,
    [],
  );
  const itemSeparator = React.useCallback(() => <View style={styles.divider} />, []);

  const renderItem = React.useCallback(
    ({ item, index }: { item: HolepunchMessage; index: number }) => {
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
    },
    [
      currentPeerPubKey,
      onImagePress,
      onPressApprove,
      onPressReject,
      peersMap,
      reversedMessages,
      viewTransaction,
    ],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={reversedMessages}
      style={styles.container}
      extraData={sending}
      contentContainerStyle={styles.list}
      inverted={true}
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      // ListEmptyComponent={() => (
      //   <Text style={styles.textEmpty}>No messages</Text>
      // )}
      ItemSeparatorComponent={itemSeparator}
      renderItem={renderItem}
    />
  );
};

export default MessageList;
