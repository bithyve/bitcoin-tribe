import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import ScreenContainer from 'src/components/ScreenContainer';
import TextField from 'src/components/TextField';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import RecordCardView from './components/RecordCardView';
import AppTouchable from 'src/components/AppTouchable';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import UnCheckIcon from 'src/assets/images/uncheckIcon.svg';
import UnCheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import { Keys } from 'src/storage';
import Toast from 'src/components/Toast';
import Relay from 'src/services/relay';
import ModalLoading from 'src/components/ModalLoading';
import dbManager from 'src/storage/realm/dbManager';

function VerifyDomain() {
  const navigation = useNavigation();
  const popAction = StackActions.pop(3);
  const theme: AppTheme = useTheme();
  const [appId] = useMMKVString(Keys.APPID);
  const { record, recordType, domain, assetId, schema } = useRoute().params;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [domainName, setDomainName] = useState(domain || '');
  const [domainValidationError, setDomainNameValidationError] = useState('');
  const [checkedTermsCondition, SetCheckedTermsCondition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithDelay = (callback: () => void) => {
    setIsLoading(false);
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const handleDomainNameChange = text => {
    if (!text.trim()) {
      setDomainName('');
      setDomainNameValidationError('Please enter domain');
    } else {
      setDomainName(text);
      setDomainNameValidationError(null);
    }
  };

  const handleVerifyDomain = async () => {
    try {
      setIsLoading(true);
      const response = await Relay.verifyIssuerDomain(appId, assetId);
      if (response.status) {
        console.log('response', response?.data?.issuer);
        await dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          issuer: {
            isDomainVerified: true,
            verified: response?.data?.issuer?.verified,
            verifiedBy: response?.data?.issuer?.verifiedBy,
          },
        });
        navigateWithDelay(() => {
          navigation.dispatch(popAction);
        });
        Toast(assets.verifyDomainSuccessfully);
      } else {
        setIsLoading(false);
        Toast(
          response.error || 'An error occurred during domain verification.',
          true,
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('handleVerifyDomain error:', error);
    }
  };
  return (
    <ScreenContainer>
      <AppHeader title={assets.verifyDomain} />
      <ModalLoading visible={isLoading} />
      <KeyboardAvoidView style={styles.container}>
        <View>
          <TextField
            value={domainName}
            onChangeText={handleDomainNameChange}
            placeholder={assets.enterDomainName}
            maxLength={32}
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="done"
            error={domainValidationError}
            disabled={true}
          />
          <AppText variant="body1" style={styles.labelText}>
            {assets.addTXTrecordInfoText}
          </AppText>
        </View>
        <RecordCardView
          recordType={recordType}
          domain={domain}
          value={record}
        />
      </KeyboardAvoidView>
      <View style={styles.checkIconContainer}>
        <AppTouchable
          style={styles.checkIconWrapper}
          onPress={() => SetCheckedTermsCondition(!checkedTermsCondition)}>
          {checkedTermsCondition ? (
            isThemeDark ? (
              <CheckIcon />
            ) : (
              <CheckIconLight />
            )
          ) : isThemeDark ? (
            <UnCheckIcon />
          ) : (
            <UnCheckIconLight />
          )}
        </AppTouchable>
        <AppText variant="body2" style={styles.labelText}>
          {assets.addedDNSRecordInfoText}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={assets.verifyDomain}
          primaryOnPress={() => handleVerifyDomain()}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.dispatch(popAction)}
          width={windowWidth / 2.4}
          secondaryCTAWidth={windowWidth / 2.4}
          disabled={!checkedTermsCondition}
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
    input: {
      marginVertical: hp(5),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginVertical: hp(5),
    },
    scrollWrapper: {
      marginVertical: hp(15),
    },
    ctaWrapper: {},
    checkIconContainer: {
      marginVertical: hp(20),
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkIconWrapper: {
      width: '10%',
    },
  });
export default VerifyDomain;
