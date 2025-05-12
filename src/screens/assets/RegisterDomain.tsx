import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys } from 'src/storage';
import Relay from 'src/services/relay';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';

function RegisterDomain() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { assetId } = useRoute().params;
  const [appId] = useMMKVString(Keys.APPID);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [domainName, setDomainName] = useState('');
  const [domainValidationError, setDomainNameValidationError] = useState('');
  const [isCtaEnabled, setIsCtaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsCtaEnabled(!!domainName && !domainValidationError);
  }, [domainName, domainValidationError]);

  const navigateWithDelay = (callback: () => void) => {
    setIsLoading(false);
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const isValidDomain = (domain: string) => {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };
  const handleDomainNameChange = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      setDomainName('');
      setDomainNameValidationError('Please enter domain');
      return;
    }
    setDomainName(trimmed);
    if (!isValidDomain(trimmed)) {
      setDomainNameValidationError('Invalid domain format');
    } else {
      setDomainNameValidationError(null);
    }
  };
  const handleRegisterDomain = async () => {
    try {
      setIsLoading(true);
      const response = await Relay.registerIssuerDomain(
        appId,
        assetId,
        domainName,
      );
      if (response.status) {
        Toast('Your domain has been successfully registered.');
        navigateWithDelay(() => {
          navigation.navigate(NavigationRoutes.VERIFYDOMAIN, {
            record: response.record,
            recordType: response.recordType,
            domain: domainName,
            assetId: assetId,
          });
        });
      } else {
        setIsLoading(false);
        Toast(
          response.error || 'An error occurred during domain registration.',
          true,
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('handleRegisterDomain error:', error);
    }
  };
  return (
    <ScreenContainer>
      <AppHeader title={assets.verifyDomain} />
      <ModalLoading visible={isLoading} />
      <KeyboardAvoidView style={styles.container}>
        <AppText variant="body1" style={styles.headText}>
          {assets.registerDomainInfo1}
        </AppText>
        <View>
          <View style={styles.infoViewWrapper}>
            <View>
              <RightArrowIcon />
            </View>
            <AppText variant="body1" style={styles.subText}>
              {assets.registerDomainInfo2}
            </AppText>
          </View>
          <View style={styles.infoViewWrapper}>
            <View>
              <RightArrowIcon />
            </View>
            <AppText variant="body1" style={styles.subText}>
              {assets.registerDomainInfo3}
            </AppText>
          </View>
        </View>
        <View style={styles.inputViewWrapper}>
          <AppText variant="body1" style={styles.labelText}>
            {assets.enterDomain}
          </AppText>
          <TextField
            value={domainName}
            onChangeText={handleDomainNameChange}
            placeholder={assets.enterDomainName}
            maxLength={32}
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="done"
            error={domainValidationError}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
      </KeyboardAvoidView>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => handleRegisterDomain()}
          width={'100%'}
          disabled={!isCtaEnabled}
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
export default RegisterDomain;
