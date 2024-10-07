import React from 'react';
import { FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

function VersionHistoryList() {
  const theme: AppTheme = useTheme();
  const VersionHistoryData = useQuery(RealmSchema.VersionHistory).map(
    getJSONFromRealmObject,
  );
  const lastIndex = VersionHistoryData.length - 1;
  return (
    <FlatList
      data={VersionHistoryData.reverse()}
      renderItem={({ item, index }) => (
        <VersionHistoryItem
          title={item.title}
          date={item.date}
          releaseNotes={item.releaseNotes}
          lastIndex={lastIndex === index}
        />
      )}
    />
  );
}
export default VersionHistoryList;
