import React, { useContext } from 'react';
import { FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function BackupHistoryList() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const BackupHistoryData = useQuery(RealmSchema.BackupHistory).map(
    getJSONFromRealmObject,
  );

  return (
    <FlatList
      data={BackupHistoryData.reverse()}
      renderItem={({ item }) => (
        <VersionHistoryItem
          title={settings[item?.title]}
          date={item.date}
          releaseNotes={item.releaseNotes}
        />
      )}
    />
  );
}
export default BackupHistoryList;
