import React, { useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Buttons from 'src/components/Buttons';
import { wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import VersionHistoryItem from './components/VersionHistoryItem';
import ModalLoading from 'src/components/ModalLoading';
import EmptyStateView from 'src/components/EmptyStateView';
import NoBackupIllustration from 'src/assets/images/backupHistory.svg';
import NoBackupIllustrationLight from 'src/assets/images/backupHistoryLight.svg';
import Toast from 'src/components/Toast';
import { Keys } from 'src/storage';

const CloudBackup = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetBackup, setAssetBackup] = useMMKVBoolean(Keys.ASSET_BACKUP);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const data = useQuery(RealmSchema.CloudBackupHistory).map(
    getJSONFromRealmObject,
  );
  const backup = useMutation(ApiHandler.backupRgbOnCloud);
  const lastIndex = data.length - 1;

  useEffect(() => {
    if (backup.isSuccess) {
      setAssetBackup(true);
      Toast(settings.CLOUD_BACKUP_CREATED);
    } else if (backup.isError) {
      Toast(settings.CLOUD_BACKUP_FAILED, true);
    }
  }, [backup.isSuccess, backup.isError, backup.isLoading]);

  return (
    <ScreenContainer>
      <ModalLoading visible={backup.isLoading} />
      <AppHeader
        title={settings.cloudBackupTitle}
        subTitle={
          settings.cloudBackupSubTitle +
          ' ' +
          `${Platform.select({
            ios: 'iCloud',
            android: 'Google Drive',
          })}`
        }
      />

      <FlatList
        data={data.reverse()}
        renderItem={({ item, index }) => (
          <VersionHistoryItem
            title={settings[item?.title]}
            date={item.date}
            releaseNotes={item.releaseNotes}
            lastIndex={lastIndex === index}
          />
        )}
        ListEmptyComponent={
          <EmptyStateView
            style={styles.emptyStateContainer}
            title={settings.noBackHistory}
            subTitle={''}
            IllustartionImage={
              !isThemeDark ? (
                <NoBackupIllustration />
              ) : (
                <NoBackupIllustrationLight />
              )
            }
          />
        }
      />

      <View>
        <Buttons
          primaryTitle={common.backup}
          primaryOnPress={async () => {
            backup.mutate();
          }}
          secondaryTitle={''}
          secondaryOnPress={() => navigation.goBack()}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    emptyStateContainer: {
      marginTop: '40%',
    },
  });
export default CloudBackup;
