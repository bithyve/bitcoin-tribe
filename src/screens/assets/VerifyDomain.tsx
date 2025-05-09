import React, { useContext, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import CardSkeletonLoader from 'src/components/CardSkeletonLoader';
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

const data = [
  {
    index: 1,
    recordType: 'A',
    domain: 'bitcointribe.com',
    Value: '199.36.158.100',
  },
  {
    index: 2,
    recordType: 'TXT',
    domain: 'bitcointribe.com',
    Value: 'hosting-site=bitcoin-tribe-rgb-hosting-site=bitcoin',
  },
];

function VerifyDomain() {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [domainName, setDomainName] = useState('');
  const [domainValidationError, setDomainNameValidationError] = useState('');
  const [checkedTermsCondition, SetCheckedTermsCondition] = useState(false);

  const handleDomainNameChange = text => {
    if (!text.trim()) {
      setDomainName('');
      setDomainNameValidationError('Please enter domain');
    } else {
      setDomainName(text);
      setDomainNameValidationError(null);
    }
  };
  return (
    <ScreenContainer>
      <AppHeader title={assets.verifyDomain} />
      <KeyboardAvoidView style={styles.container}>
        <View>
          <TextField
            value={domainName}
            onChangeText={handleDomainNameChange}
            placeholder={'Enter a domain name'}
            maxLength={32}
            style={styles.input}
            blurOnSubmit={false}
            returnKeyType="done"
            error={domainValidationError}
          />
          <AppText variant="body1" style={styles.labelText}>
            {assets.addTXTrecordInfoText}
          </AppText>
        </View>
        <FlatList
          style={styles.scrollWrapper}
          data={data}
          renderItem={({ item }) => (
            <RecordCardView
              index={item.index}
              recordType={item.recordType}
              domain={item.domain}
              value={item.Value}
            />
          )}
          keyExtractor={item => item.index}
          ListEmptyComponent={<CardSkeletonLoader />}
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
          primaryOnPress={() => {}}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => {}}
          width={windowWidth / 2.4}
          secondaryCTAWidth={windowWidth / 2.4}
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
