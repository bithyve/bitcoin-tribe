import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp } from 'src/constants/responsive';

function VersionHistoryList() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const VersionHistoryData = useQuery(RealmSchema.VersionHistory).map(
    getJSONFromRealmObject,
  );
  const lastIndex = VersionHistoryData.length - 1;
  const reversedData = [...VersionHistoryData].reverse();

  return (
    <FlatList
      data={reversedData}
      renderItem={({ item, index }) => {
        const previousItem =
          index < reversedData.length - 1 ? reversedData[index + 1] : null;

        const title = previousItem
          ? `Upgraded from ${previousItem.version} to ${item.version}`
          : `Initially installed ${item.version}`;

        return (
          <VersionHistoryItem
            title={title}
            date={item.date}
            releaseNotes={item.releaseNotes}
            lastIndex={lastIndex === index}
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
