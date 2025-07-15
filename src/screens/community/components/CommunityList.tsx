import { FlatList, StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';

import { Community } from 'src/models/interfaces/Community';
import { RealmSchema } from 'src/storage/enum';
import CommunityItem from './CommnunityItem';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import EmptyStateView from 'src/components/EmptyStateView';
import { Keys } from 'src/storage';
import EmptyCommunityIllustration from 'src/assets/images/emptyCommunityIllustration.svg';
import EmptyCommunityIllustrationLight from 'src/assets/images/emptyCommunityIllustration_light.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flatList: {
      flex: 1,
      marginTop: 10,
    },
    emptyStateWrapper: {
      marginTop: '42%',
    },
  });

const CommunityList = ({ onRefresh }: { onRefresh: () => void }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;

  const communities = useQuery<Community>(RealmSchema.Community).sorted(
    'createdAt',
    true,
  );
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
        <EmptyStateView
          title={community.noConnectionTitle}
          subTitle={community.noConnectionSubTitle}
          IllustartionImage={
            isThemeDark ? (
              <EmptyCommunityIllustration />
            ) : (
              <EmptyCommunityIllustrationLight />
            )
          }
          style={styles.emptyStateWrapper}
        />
      }
      style={styles.flatList}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <CommunityItem item={item} />}
    />
  );
};

export default CommunityList;
