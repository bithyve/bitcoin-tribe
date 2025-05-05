import React, { useContext } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import VersionHistoryItem from './VersionHistoryItem';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';

function BackupHistoryList() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const BackupHistoryData = useQuery(RealmSchema.BackupHistory).map(
    getJSONFromRealmObject,
  );
  const lastIndex = BackupHistoryData.length - 1;
  return (
    <FlatList
      data={BackupHistoryData.reverse()}
      renderItem={({ item, index }) => (
        <VersionHistoryItem
          title={settings[item?.title]}
          date={item.date}
          releaseNotes={item.releaseNotes}
          lastIndex={lastIndex === index}
          showCollapseIcon={false}
        />
      )}
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
export default BackupHistoryList;
