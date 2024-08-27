import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { FlatList, Platform, View } from 'react-native';
import Buttons from 'src/components/Buttons';
import { wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import VersionHistoryItem from './components/VersionHistoryItem';
import AppText from 'src/components/AppText';
import { useMutation } from 'react-query';
import ModalLoading from 'src/components/ModalLoading';

const CloudBackup = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const data = useQuery(RealmSchema.CloudBackupHistory).map(
    getJSONFromRealmObject,
  );
  const backup = useMutation(ApiHandler.backupRgbOnCloud);
  const lastIndex = data.length - 1;
  return (
    <ScreenContainer>
      <ModalLoading visible={backup.isLoading} />

      <AppHeader
        title={'Cloud Backup'}
        subTitle={`Backup RGB state on  ${Platform.select({
          ios: 'iCloud',
          android: 'Google Drive',
        })}`}
      />

      <FlatList
        data={data.reverse()}
        ListEmptyComponent={() => <AppText>No backup history</AppText>}
        renderItem={({ item, index }) => (
          <VersionHistoryItem
            title={settings[item?.title]}
            date={item.date}
            releaseNotes={item.releaseNotes}
            lastIndex={lastIndex === index}
          />
        )}
      />

      <View>
        <Buttons
          primaryTitle={'Backup'}
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

export default CloudBackup;
