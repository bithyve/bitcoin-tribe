import React from 'react';
import { FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

// const versionHistoryData = [
//   {
//     version: 'Upgraded from 1.1.18 to 1.1.20',
//     date: '2min ago',
//     releaseNotes:
//       'Major update with redesigned UI and performance improvements.',
//   },
//   {
//     version: 'Upgraded from 1.1.16 to 1.1.18',
//     date: 'Two weeks ago',
//     releaseNotes: 'Added new features and fixed bugs.',
//   },
//   {
//     version: 'Upgraded from 1.1.15 to 1.1.16',
//     date: 'A month ago',
//     releaseNotes: 'Initial release with basic features.',
//   },
// ];

function VersionHistoryList() {
  const theme: AppTheme = useTheme();
  const VersionHistoryData = useQuery(RealmSchema.VersionHistory).map(
    getJSONFromRealmObject,
  );

  return (
    <FlatList
      data={VersionHistoryData.reverse()}
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
export default VersionHistoryList;
