import { FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import AppText from 'src/components/AppText';
import { Community } from 'src/models/interfaces/Community';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import CommunityItem from './CommnunityItem';

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

const CommunityList = ({ onRefresh }: { onRefresh: () => void }) => {
  const communities = useQuery<Community>(RealmSchema.Community);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={communities}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <AppText variant="heading3" style={styles.emptyText}>
          No communities found
        </AppText>
      }
      style={styles.flatList}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <CommunityItem item={item} />}
    />
  );
};

export default CommunityList;
