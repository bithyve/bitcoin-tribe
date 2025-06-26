import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import RGBChannelIllustration from 'src/assets/images/RGBChannelIllustration.svg';
import EmptyStateView from 'src/components/EmptyStateView';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import PrimaryCTA from 'src/components/PrimaryCTA';
import AppText from 'src/components/AppText';

type emptyStateProps = {
  onPress: () => void;
};

const EmptyChannelsStateView = (props: emptyStateProps) => {
  const { onPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = React.useContext(LocalizationContext);
  const { node, common, channel } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);

  return (
    <View>
      <EmptyStateView
        IllustartionImage={<RGBChannelIllustration />}
        title={node.channelEmptyTitle}
        subTitle={node.channelEmptySubTitle}
      />
      <View style={styles.createChannelWrapper}>
        <View>
          <AppText variant="caption" style={styles.bulletText}>
            {'\u2022'}&nbsp;&nbsp;{channel.createChannelBulletPoint1}
          </AppText>
          <AppText variant="caption" style={styles.bulletText}>
            {'\u2022'}&nbsp;&nbsp;{channel.createChannelBulletPoint2}
          </AppText>
          <AppText variant="caption" style={styles.bulletText}>
            {'\u2022'}&nbsp;&nbsp;{channel.createChannelBulletPoint3}
          </AppText>
        </View>
        <View style={styles.ctaWrapper}>
          <PrimaryCTA
            title={common.createChannel}
            onPress={onPress}
            width={hp(250)}
          />
        </View>
      </View>
    </View>
  );
};

export default EmptyChannelsStateView;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    createChannelWrapper: {
      alignItems: 'center',
      marginTop: hp(20),
    },
    ctaWrapper: {
      marginVertical: hp(20),
    },
    bulletText: {
      color: theme.colors.headingColor,
      lineHeight: 20,
    },
  });
