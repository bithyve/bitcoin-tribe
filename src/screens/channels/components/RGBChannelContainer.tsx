import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import EmptyStateView from 'src/components/EmptyStateView';
import RGBChannelIllustration from 'src/assets/images/RGBChannelIllustration.svg';
import { hp } from 'src/constants/responsive';
import RefreshControlView from 'src/components/RefreshControlView';
import AppText from 'src/components/AppText';

function RGBChannelContainer() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;

  return (
    <FlatList
      style={styles.container}
      data={[]}
      refreshControl={
        Platform.OS === 'ios' ? (
          <RefreshControlView refreshing={false} onRefresh={() => {}} />
        ) : (
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            colors={[theme.colors.accent1]} // You can customize this part
            progressBackgroundColor={theme.colors.inputBackground}
          />
        )
      }
      renderItem={({ item }) => (
        <View>
          <AppText>RGB Channels</AppText>
        </View>
      )}
      keyExtractor={item => item.txid}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          IllustartionImage={<RGBChannelIllustration />}
          title={node.channelEmptyTitle}
          subTitle={node.channelEmptySubTitle}
        />
      }
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(10),
      height: '100%',
    },
  });
export default RGBChannelContainer;
