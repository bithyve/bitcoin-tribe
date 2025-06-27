import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import IconRefreshActive from 'src/assets/images/refresh_active.svg';
import IconRefreshInActive from 'src/assets/images/refresh_inactive.svg';
import IconPauseActive from 'src/assets/images/pause_active.svg';
import IconPauseInActive from 'src/assets/images/pause_inactive.svg';
import IconPlayActive from 'src/assets/images/play_active.svg';
import IconPlayInActive from 'src/assets/images/play_inactive.svg';
import IconRefreshActiveLight from 'src/assets/images/refresh_active_light.svg';
import IconPauseActiveLight from 'src/assets/images/pause_active_light.svg';
import IconPlayActiveLight from 'src/assets/images/play_active_light.svg';
import IconRefreshInActiveLight from 'src/assets/images/refresh_inactive_light.svg';
import IconPauseInActiveLight from 'src/assets/images/pause_inactive_light.svg';
import IconPlayInActiveLight from 'src/assets/images/play_inactive_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';

type nodeInfoFooterProps = {
  nodeStatus: string;
  setNodeStatus: (text: string) => void;
  onPressRefresh: () => void;
};

function NodeInfoFooter(props: nodeInfoFooterProps) {
  const { nodeStatus, setNodeStatus } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={styles.container}>
      <AppTouchable onPress={props.onPressRefresh} style={styles.iconWrapper}>
        {nodeStatus === 'refresh' ? (
          isThemeDark ? (
            <IconRefreshActive />
          ) : (
            <IconRefreshActiveLight />
          )
        ) : isThemeDark ? (
          <IconRefreshInActive />
        ) : (
          <IconRefreshInActiveLight />
        )}
        <AppText style={styles.labelText}>Refresh</AppText>
      </AppTouchable>
      <AppTouchable
        onPress={() => setNodeStatus('run')}
        style={styles.iconWrapper}>
        {nodeStatus === 'run' ? (
          isThemeDark ? (
            <IconPlayActive height={57} width={57} />
          ) : (
            <IconPlayActiveLight />
          )
        ) : isThemeDark ? (
          <IconPlayInActive />
        ) : (
          <IconPlayInActiveLight />
        )}
        <AppText style={styles.labelText}>Play</AppText>
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: '15%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    iconWrapper: {
      marginHorizontal: hp(10),
    },
    labelText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginTop: hp(3),
    },
  });
export default NodeInfoFooter;
