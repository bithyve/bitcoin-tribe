import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVString } from 'react-native-mmkv';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import RightArrowIcon from 'src/assets/images/icon_rightArrowSecondary.svg';
import TextField from 'src/components/TextField';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { Keys } from 'src/storage';
import Relay from 'src/services/relay';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import dbManager from 'src/storage/realm/dbManager';
import { IssuerVerificationMethod } from 'src/models/interfaces/RGBWallet';
import { loginWithTwitter } from 'src/services/twitter';
import { AppContext } from 'src/contexts/AppContext';
import { saveTwitterHandle } from 'src/utils/socialHandleUtils';
import TwitterVerificationInfoModal from './components/TwitterVerificationInfoModal';

function VerifyX() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const {
    setCompleteVerification,
    isVerifyXInfoVisible,
    setIsVerifyXInfoVisible,
  } = React.useContext(AppContext);
  const { assetId, schema, savedTwitterHandle } = useRoute().params;
  const [appId] = useMMKVString(Keys.APPID);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [xhandleName, setXhandleName] = useState(savedTwitterHandle || '');
  const [xhandleValidationError, setXhandleValidationError] = useState('');
  const [isCtaEnabled, setIsCtaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsCtaEnabled(!!xhandleName && !xhandleValidationError);
  }, [xhandleName, xhandleValidationError]);

  const navigateWithDelay = (callback: () => void) => {
    setIsLoading(false);
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const isValidTwitterHandle = (input: string): boolean => {
    const handle = input.startsWith('@') ? input.slice(1) : input;
    return /^[A-Za-z0-9_]{4,15}$/.test(handle);
  };
  const handleXhandleNameChange = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      setXhandleName('');
      setXhandleValidationError('Please enter X handle');
      return;
    }
    setXhandleName(trimmed);
    if (!isValidTwitterHandle(trimmed)) {
      setXhandleValidationError('Invalid x handle format');
    } else {
      setXhandleValidationError(null);
    }
  };

  const handleVerifyWithTwitter = React.useCallback(async () => {
    try {
      const result = await loginWithTwitter();
      if (result.username) {
        setIsLoading(true);
        const response = await Relay.verifyIssuer('appID', assetId, {
          type: IssuerVerificationMethod.TWITTER,
          id: result.id,
          name: result.name,
          username: result.username,
        });
        setIsLoading(false);
        if (response.status) {
          setCompleteVerification(true);
          const existingAsset = await dbManager.getObjectByPrimaryId(
            schema,
            'assetId',
            assetId,
          );
          const existingIssuer =
            JSON.parse(JSON.stringify(existingAsset?.issuer)) || {};
          const filteredVerifiedBy = (existingIssuer.verifiedBy || []).filter(
            entry => entry.type !== IssuerVerificationMethod.TWITTER,
          );
          const updatedVerifiedBy = [
            ...filteredVerifiedBy,
            {
              type: IssuerVerificationMethod.TWITTER,
              id: result.id,
              name: result.name,
              username: result.username,
              verified: true,
            },
          ];
          await dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
            issuer: {
              ...existingIssuer,
              verified: true,
              verifiedBy: updatedVerifiedBy,
            },
          });
          navigation.goBack();
        }
      }
    } catch (error) {
      setIsLoading(false);
      if(error.message.includes('The operation couldn’t be completed')) {
        Toast(`Failed to verify X handle, please try again later.`, true);
      } else {
        Toast(`${error}`, true);
      }
      console.log(error);
    }
  }, [assetId, schema]);

  const storeTwitterHandle = async () => {
    try {
      setIsLoading(true);
      await saveTwitterHandle(schema, assetId, xhandleName);
      Toast('X handle saved successfully!');
      navigateWithDelay(() => {
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error saving Twitter handle:', error);
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={assets.verifyXTitle} />
      <ModalLoading visible={isLoading} />
      <KeyboardAvoidView style={styles.container}>
        <AppText variant="body1" style={styles.headText}>
          {assets.verifyXSubTitle}
        </AppText>
        <View>
          <View style={styles.infoViewWrapper}>
            <View>
              <RightArrowIcon />
            </View>
            <AppText variant="body1" style={styles.subText}>
              {assets.verifyXInfo1}
            </AppText>
          </View>
          <View style={styles.infoViewWrapper}>
            <View>
              <RightArrowIcon />
            </View>
            <AppText variant="body1" style={styles.subText}>
              {assets.verifyXInfo2}
            </AppText>
          </View>
        </View>
        <View style={styles.inputViewWrapper}>
          <AppText variant="body1" style={styles.labelText}>
            {assets.enterXhandleLabel}
          </AppText>
          <TextField
            value={xhandleName}
            onChangeText={handleXhandleNameChange}
            placeholder={assets.enterXhandlePlaceholder}
            maxLength={32}
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="done"
            error={xhandleValidationError}
            keyboardType="url"
            autoCapitalize="none"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
          />
        </View>
        <>
          <TwitterVerificationInfoModal
            visible={isVerifyXInfoVisible}
            primaryOnPress={() => setIsVerifyXInfoVisible(false)}
          />
        </>
      </KeyboardAvoidView>
      <View style={styles.ctaWrapper}>
        <Buttons
          secondaryTitle={common.save}
          secondaryOnPress={storeTwitterHandle}
          primaryTitle={assets.verifyXTitle}
          primaryOnPress={handleVerifyWithTwitter}
          width={windowWidth / 2.2}
          secondaryCTAWidth={windowWidth / 2.4}
          secondaryCTADisabled={!isCtaEnabled}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headText: {
      color: theme.colors.headingColor,
      marginVertical: hp(20),
    },
    subText: {
      color: theme.colors.secondaryHeadingColor,
      marginLeft: hp(5),
      width: '90%',
    },
    infoViewWrapper: {
      flexDirection: 'row',
      marginVertical: hp(5),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginVertical: hp(5),
    },
    inputViewWrapper: {
      marginTop: hp(15),
    },
    input: {
      marginVertical: hp(5),
    },
    ctaWrapper: {},
  });
export default VerifyX;
