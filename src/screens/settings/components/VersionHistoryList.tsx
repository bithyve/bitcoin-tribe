import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp } from 'src/constants/responsive';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';

function VersionHistoryList() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const versionHistory = useQuery<VersionHistory[]>(RealmSchema.VersionHistory)
    .map(getJSONFromRealmObject)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime(),
    );
  const lastIndex = versionHistory.length - 1;
  return (
    <FlatList
      data={versionHistory}
      renderItem={({ item, index }) => {
        const title =
          index === versionHistory.length - 1
            ? String(item.title)
            : `Upgraded to ${item.version}`;
        return (
          <VersionHistoryItem
            title={title}
            date={item.date}
            releaseNotes={item.releaseNote}
            lastIndex={lastIndex === index}
            version={item.version}
            showCollapseIcon={true}
          />
        );
      }}
      style={styles.container}
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default VersionHistoryList;
