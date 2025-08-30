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
  appId,
  onImagePress,
  onPressReject,
  onPressApprove,
  viewTransaction,
}) => {
  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      style={{ flex: 1, paddingBottom: 10 }}
      extraData={[messages, sending]}
      contentContainerStyle={styles.list}
      inverted={true}
      showsVerticalScrollIndicator={false}
      // ListEmptyComponent={() => (
      //   <Text style={styles.textEmpty}>No messages</Text>
      // )}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      renderItem={({ item, index }) => (
        <MessageItem
          message={item}
          previousMessage={messages[index + 1]}
          appId={appId}
          onImagePress={onImagePress}
          onPressReject={onPressReject}
          onPressApprove={onPressApprove}
          viewTransaction={viewTransaction}
        />
      )}
    />
  );
};

export default MessageList;
