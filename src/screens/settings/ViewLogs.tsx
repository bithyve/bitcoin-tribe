import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import useRgbWallets from 'src/hooks/useRgbWallets';
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
import Toast from 'src/components/Toast';
import RGBServices from 'src/services/rgb/RGBServices';

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
  const [loadingProgress, setLoadingProgress] = useState('');
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const readRgbLogs = useCallback(async () => {
    try {
      const rgbDir = await RGBServices.getRgbDir();
      const logFile = `${rgbDir.dir.replace('file://', '')
      }/${rgbWallet.masterFingerprint}/log`;
      const fileExists = await RNFS.exists(logFile);
      if (!fileExists) {
        setContent('Log file not found');
        return;
      }
      setFilePath(logFile);
      const fileStats = await RNFS.stat(logFile);
      const fileSize = fileStats.size;

      const CHUNK_SIZE = 1024 * 1024;
      const MAX_DISPLAY_SIZE = 100 * 1024; // 100KB

      if (fileSize > MAX_DISPLAY_SIZE) {
        const startPosition = Math.max(0, fileSize - MAX_DISPLAY_SIZE);
        const data = await RNFS.read(logFile, MAX_DISPLAY_SIZE, startPosition);
        setContent(
          `[Showing last ${Math.round(
            MAX_DISPLAY_SIZE / 1024,
          )}KB of ${Math.round(fileSize / 1024 / 1024)}MB file]\n\n${data}`,
        );
      } else if (fileSize > CHUNK_SIZE) {
        let content = '';
        let position = 0;

        while (position < fileSize) {
          const remainingBytes = fileSize - position;
          const currentChunkSize = Math.min(CHUNK_SIZE, remainingBytes);

          const chunk = await RNFS.read(logFile, currentChunkSize, position);
          content += chunk;
          position += currentChunkSize;
          const progressPercent = Math.round((position / fileSize) * 100);
          setLoadingProgress(`Loading... ${progressPercent}%`);

          if (position % (CHUNK_SIZE * 2) === 0) {
            setContent(content + `\n[${progressPercent}% loaded...]`);
          }
        }
        setContent(content);
        setLoadingProgress('');
      } else {
        const data = await RNFS.readFile(logFile);
        setContent(data);
      }
    } catch (error) {
      Toast(`${error}`, true);
      console.error('Failed to read RGB logs:', error);
    } finally {
      setLoading(false);
    }
  }, [rgbWallet.masterFingerprint]);

  useEffect(() => {
    readRgbLogs();
  }, [readRgbLogs]);

  const handleShare = useCallback(async () => {
    try {
      if (!filePath) return;
      await Share.open({
        url: `file://${filePath}`,
        type: 'text/plain',
        title: 'RGB Logs',
        subject: 'RGB Logs',
        message: 'RGB Logs file',
      });
    } catch (error) {
      console.log('Failed to share log file:', error);
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
          {loadingProgress ? (
            <AppText variant="caption" style={styles.text}>
              {loadingProgress}
            </AppText>
          ) : null}
          <AppText selectable variant="caption" style={styles.text}>
            {content}
          </AppText>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

export default ViewLogs;
