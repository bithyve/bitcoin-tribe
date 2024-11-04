import React, { useContext } from 'react';
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

function SupportTermAndCondition() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const styles = getStyles(theme);
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
          title="Scope of Tribe RGB's Role"
          subTitle="Tribe RGB offers a feature to connect external nodes but does not provide support or assume responsibility for the connection process or related issues."
        />
        <TermAndConditionView
          index={2}
          title="External Support"
          subTitle="For assistance with setup or troubleshooting, please contact the external provider directly, as they manage all support for external node connectivity."
        />
        <TermAndConditionView
          index={3}
          title="Liability Disclaimer"
          subTitle="Tribe RGB is not liable for any data loss, misconfigurations, or other consequences resulting from connecting to an external node. Use this option at your discretion."
        />
        <TermAndConditionView
          index={4}
          title="Updates and Availability"
          subTitle="Tribe RGB may update this feature without notice. Any changes to support availability or terms should be confirmed with the external provider."
        />
        <TermAndConditionView
          index={5}
          title="Governing Law"
          subTitle="These terms are governed by the applicable jurisdiction’s laws"
        />
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
