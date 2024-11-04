import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import SelectWalletCollapse from './components/SelectWalletCollapse';
import SelectWalletTypeOption from './components/SelectWalletTypeOption';
import SupportIcon from 'src/assets/images/supportIcon.svg';
import { hp, wp } from 'src/constants/responsive';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Buttons from 'src/components/Buttons';

function SelectWallet() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding, assets } = translations;
  const styles = getStyles(theme);
  const [supportedMode, SetSupportedMode] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.selectWalletType} />
      <View style={styles.bodyWrapper}>
        <SelectWalletCollapse />
        <SelectWalletTypeOption
          title={onBoarding.supported}
          icon={<SupportIcon />}
          onPress={() => SetSupportedMode(!supportedMode)}
          borderColor={
            supportedMode ? theme.colors.accent1 : theme.colors.borderColor
          }
        />
      </View>
      {supportedMode && (
        <View>
          <View style={styles.termConditionWrapper}>
            <View style={styles.checkIconWrapper}>
              <CheckIcon />
            </View>
            <View style={styles.termConditionWrapper1}>
              <Text style={styles.termConditionText}>
                {onBoarding.supportTermAndConditionTitle}&nbsp;
                <Text
                  style={styles.readMoreText}
                  onPress={() =>
                    navigation.navigate(
                      NavigationRoutes.SUPPORTTERMANDCONDITION,
                    )
                  }>
                  {onBoarding.readMore}
                </Text>
              </Text>
            </View>
          </View>
          <View>
            <Buttons
              primaryTitle={common.proceed}
              primaryOnPress={() => SetSupportedMode(false)}
              width={wp(120)}
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    bodyWrapper: {
      height: '68%',
    },
    textStyle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 36,
    },
    subTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
    termConditionWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(20),
    },
    checkIconWrapper: {
      width: '10%',
    },
    termConditionWrapper1: {
      width: '90%',
      flexDirection: 'row',
    },
    termConditionText: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.secondaryHeadingColor,
    },
    readMoreText: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.accent1,
      textDecorationLine: 'underline',
    },
  });
export default SelectWallet;
