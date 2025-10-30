import { Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import ImportBackup from 'src/assets/images/import_rgb_backup.svg';
import { hp } from 'src/constants/responsive';
import { pickSingle } from 'react-native-document-picker';
import UploadFile from 'src/assets/images/uploadFile.svg';
import UploadAssetFileButton from '../collectiblesCoins/components/UploadAssetFileButton';
import UploadFileLight from 'src/assets/images/uploadFile_light.svg';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import Toast from 'src/components/Toast';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useNavigation, useRoute } from '@react-navigation/native';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { decrypt, hash512 } from 'src/utils/encryption';
import config from 'src/utils/config';
import * as SecureStore from 'src/storage/secure-store';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

const styles = StyleSheet.create({
  containerImg: {
    alignSelf: 'center',
    marginVertical: hp(40),
  },
});

const ImportRgbBackup = () => {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [visibleLoader, setVisibleLoader] = useState(false);
  const { mutateAsync, status, isLoading, error } = useMutation(
    ApiHandler.restoreWithBackupFile,
  );
  const route = useRoute();
  const navigation = useNavigation();
  const { setKey } = useContext(AppContext);

  useEffect(() => {
    Toast(onBoarding.backupFileNotFound, true);
  }, []);

  useEffect(() => {
    const onSuccess = async () => {
      const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
      const key = decrypt(hash, await SecureStore.fetch(hash));
      setKey(key);
      setVisibleLoader(false);
      Toast(onBoarding.appRecoveryMsg);
      setTimeout(() => {
        navigation.replace(NavigationRoutes.APPSTACK);
      }, 400);
    };

    if (status === 'success') {
      onSuccess();
    } else if (status === 'error') {
      setVisibleLoader(false);
      Toast(`Failed to restore ${error}`, true);
    }
  }, [status]);

  const pickFile = async () => {
    pickSingle({
      transitionStyle: 'flipHorizontal',
      copyTo: 'documentDirectory',
      mode: 'import',
    }).then(res => {
      console.log(res);
      if (
        res &&
        res.fileCopyUri.substring(res.fileCopyUri.lastIndexOf('.')) ===
          '.rgb_backup'
      ) {
        setVisibleLoader(true);
        mutateAsync({
          mnemonic: route.params.mnemonic,
          filePath: res.fileCopyUri.replace('file://', ''),
        });
      } else {
        setVisibleLoader(false);
        Toast('Invalid RGB backup file', true);
      }
    });
  };

  return (
    <ScreenContainer>
      <View>
        <ResponsePopupContainer
          visible={isLoading || visibleLoader}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={onBoarding.recoverLoadingTitle}
            subTitle={onBoarding.recoverLoadingSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/backupAndRecovery.json')
                : require('src/assets/images/jsons/backupAndRecovery_light.json')
            }
          />
        </ResponsePopupContainer>
      </View>
      <AppHeader
        title={'Recover Your Wallet'}
        subTitle={
          'We couldn’t find your RGB Asset file. Please upload the file from your phone.'
        }
      />
      <View style={styles.containerImg}>
        <ImportBackup />
      </View>

      <UploadAssetFileButton
        onPress={pickFile}
        title={'Choose File'}
        icon={isThemeDark ? <UploadFile /> : <UploadFileLight />}
      />
    </ScreenContainer>
  );
};

export default ImportRgbBackup;
