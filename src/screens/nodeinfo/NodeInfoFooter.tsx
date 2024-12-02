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
      <AppTouchable onPress={props.onPressRefresh}>
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
      </AppTouchable>
      <AppTouchable onPress={() => setNodeStatus('stop')}>
        {nodeStatus === 'stop' ? (
          isThemeDark ? (
            <IconPauseActive />
          ) : (
            <IconPauseActiveLight />
          )
        ) : isThemeDark ? (
          <IconPauseInActive />
        ) : (
          <IconPauseInActiveLight />
        )}
      </AppTouchable>
      <AppTouchable onPress={() => setNodeStatus('run')}>
        {nodeStatus === 'run' ? (
          isThemeDark ? (
            <IconPlayActive />
          ) : (
            <IconPlayActiveLight />
          )
        ) : isThemeDark ? (
          <IconPlayInActive />
        ) : (
          <IconPlayInActiveLight />
        )}
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: '10%',
      width: '100%',
      justifyContent: 'space-evenly',
      alignItems: 'flex-end',
    },
  });
export default NodeInfoFooter;
