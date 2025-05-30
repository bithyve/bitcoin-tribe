import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MessageItem from './MessageItem'

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  divider: {
    height: 1,
  },
})

const MessageList = ({ messages, sending, flatListRef, appId }) => {
  return (
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        style={{ flex: 1 }}
        extraData={[messages, sending]}
        contentContainerStyle={styles.list}
        // ListEmptyComponent={() => (
        //   <Text style={styles.textEmpty}>No messages</Text>
        // )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item, index }) => <MessageItem message={item} appId={appId} />}
      />
  )
}

export default MessageList
