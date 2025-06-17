import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import useRgbWallets from 'src/hooks/useRgbWallets';
import RGBServices from 'src/services/rgb/RGBServices';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import LoadingSpinner from 'src/components/LoadingSpinner';
import AppText from 'src/components/AppText';
import * as RNFS from '@dr.pogodin/react-native-fs';
import DownloadIcon from 'src/assets/images/downloadBtn.svg';
import DownloadIconLight from 'src/assets/images/downloadBtnLight.svg';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import Share from 'react-native-share';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    text: {
      fontSize: 10,
      color: theme.colors.text,
    },
  });

const ViewLogs = () => {
  const { wallets } = useRgbWallets({});
  const rgbWallet = useMemo(() => wallets[0], [wallets]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [filePath, setFilePath] = useState('');
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const readRgbLogs = useCallback(async () => {
    try {
      const walletData = await RGBServices.getWalletData();
      const logFile = `${walletData.dataDir}/${rgbWallet.accountXpubColoredFingerprint}/log`;
      setFilePath(logFile);
      const data = await RNFS.readFile(logFile);
      setContent(data);
    } catch (error) {
      console.error('Failed to read RGB logs:', error);
    } finally {
      setLoading(false);
    }
  }, [rgbWallet.accountXpubColoredFingerprint]);

  useEffect(() => {
    readRgbLogs();
  }, [readRgbLogs]);

  const handleShare = useCallback(async () => {
    try {
      await Share.open({ url: filePath });
    } catch (error) {
      console.error('Failed to share log file:', error);
    }
  }, [filePath]);

  return (
    <ScreenContainer>
      <AppHeader
        title="RGB Logs"
        enableBack
        rightIcon={isThemeDark ? <DownloadIcon /> : <DownloadIconLight />}
        onSettingsPress={handleShare}
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          style={styles.container}
          overScrollMode="never"
          bounces={false}>
          <AppText selectable variant="caption" style={styles.text}>
            {content}
          </AppText>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

export default ViewLogs;
