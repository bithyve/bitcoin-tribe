import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

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

function RegisterDomain() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [domainName, setDomainName] = useState('');
  const [domainValidationError, setDomainNameValidationError] = useState('');

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
          />
        </View>
      </KeyboardAvoidView>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() =>
            navigation.navigate(NavigationRoutes.VERIFYDOMAIN)
          }
          secondaryTitle={common.save}
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
