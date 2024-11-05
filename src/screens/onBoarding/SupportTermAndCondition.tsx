import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import TermAndConditionView from './components/TermAndConditionView';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Buttons from 'src/components/Buttons';
import UnCheckIcon from 'src/assets/images/uncheckIcon.svg';
import AppTouchable from 'src/components/AppTouchable';

function SupportTermAndCondition() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const styles = getStyles(theme);
  const [checkedTermsCondition, SetCheckedTermsCondition] = useState(false);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.termAndConditionTitle} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <GradientView
          style={styles.termsContainer}
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}>
          <AppText variant="heading3">
            {onBoarding.termAndConditionBrief}
          </AppText>
        </GradientView>
        <TermAndConditionView
          index={1}
          title={onBoarding.termAndConditionTitle1}
          subTitle={onBoarding.termAndConditionSubTitle1}
        />
        <TermAndConditionView
          index={2}
          title={onBoarding.termAndConditionTitle2}
          subTitle={onBoarding.termAndConditionSubTitle2}
        />
        <TermAndConditionView
          index={3}
          title={onBoarding.termAndConditionTitle3}
          subTitle={onBoarding.termAndConditionSubTitle3}
        />
        <TermAndConditionView
          index={4}
          title={onBoarding.termAndConditionTitle4}
          subTitle={onBoarding.termAndConditionSubTitle4}
        />
        <TermAndConditionView
          index={5}
          title={onBoarding.termAndConditionTitle5}
          subTitle={onBoarding.termAndConditionSubTitle5}
        />
        <View style={styles.termConditionWrapper}>
          <AppTouchable
            onPress={() => SetCheckedTermsCondition(!checkedTermsCondition)}
            style={styles.checkIconWrapper}>
            {checkedTermsCondition ? <CheckIcon /> : <UnCheckIcon />}
          </AppTouchable>
          <View style={styles.termConditionWrapper1}>
            <Text style={styles.termConditionText}>
              {onBoarding.supportTermAndConditionTitle}&nbsp;
              <Text
                style={styles.readMoreText}
                onPress={() =>
                  navigation.navigate(NavigationRoutes.SUPPORTTERMANDCONDITION)
                }>
                {onBoarding.readMore}
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <Buttons
            primaryTitle={common.proceed}
            primaryOnPress={() => console.log('press')}
            width={wp(120)}
            disabled={!checkedTermsCondition}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    termsContainer: {
      padding: hp(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      marginBottom: hp(30),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
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
export default SupportTermAndCondition;
