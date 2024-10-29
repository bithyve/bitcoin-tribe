import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import IconRefreshActive from 'src/assets/images/refresh_active.svg';
import IconRefreshInActive from 'src/assets/images/refresh_inactive.svg';
import IconPauseActive from 'src/assets/images/pause_active.svg';
import IconPauseInActive from 'src/assets/images/pause_inactive.svg';
import IconPlayActive from 'src/assets/images/play_active.svg';
import IconPlayInActive from 'src/assets/images/play_inactive.svg';
import AppTouchable from 'src/components/AppTouchable';

type nodeInfoFooterProps = {
  nodeStatus: string;
  setNodeStatus: (text: string) => void;
};

function NodeInfoFooter(props: nodeInfoFooterProps) {
  const { nodeStatus, setNodeStatus } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <AppTouchable onPress={() => setNodeStatus('refresh')}>
        {nodeStatus === 'refresh' ? (
          <IconRefreshActive />
        ) : (
          <IconRefreshInActive />
        )}
      </AppTouchable>
      <AppTouchable onPress={() => setNodeStatus('stop')}>
        {nodeStatus === 'stop' ? <IconPauseActive /> : <IconPauseInActive />}
      </AppTouchable>
      <AppTouchable onPress={() => setNodeStatus('run')}>
        {nodeStatus === 'run' ? <IconPlayActive /> : <IconPlayInActive />}
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
