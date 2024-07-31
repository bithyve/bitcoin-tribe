import React from 'react';
import { FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

function BackupHistoryList() {
  const theme: AppTheme = useTheme();
  const BackupHistoryData = useQuery(RealmSchema.BackupHistory).map(
    getJSONFromRealmObject,
  );

  return (
    <FlatList
      data={BackupHistoryData.reverse()}
      renderItem={({ item }) => (
        <VersionHistoryItem
          title={item.title}
          date={item.date}
          releaseNotes={item.releaseNotes}
        />
      )}
    />
  );
}
export default BackupHistoryList;
