import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import TermAndConditionView from './components/TermAndConditionView';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import UnCheckIcon from 'src/assets/images/uncheckIcon.svg';
import UnCheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import Buttons from 'src/components/Buttons';
import AppTouchable from 'src/components/AppTouchable';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import NodeConnectingPopupContainer from './components/NodeConnectingPopupContainer';
import NodeConnectSuccessPopupContainer from './components/NodeConnectSuccessPopupContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppType from 'src/models/enums/AppType';
import { Keys } from 'src/storage';

function SupportTermAndCondition() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [checkedTermsCondition, SetCheckedTermsCondition] = useState(false);
  const [visible, setVisible] = useState(false);
  const createNodeMutation = useMutation(ApiHandler.createSupportedNode);

  useEffect(() => {
    if (createNodeMutation.error) {
      let errorMessage;
      // Check if the error is an instance of Error and extract the message
      if (createNodeMutation.error instanceof Error) {
        errorMessage = createNodeMutation.error.message;
      } else if (typeof createNodeMutation.error === 'string') {
        errorMessage = createNodeMutation.error;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      Toast(errorMessage, true);
    } else if (createNodeMutation.data) {
      setTimeout(() => {
        setVisible(true);
      }, 100);
    }
  }, [createNodeMutation.data, createNodeMutation.error]);

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
          <View style={styles.termConditionWrapper1}>
            <Text style={styles.termConditionText}>
              {onBoarding.supportTermAndConditionTitle}&nbsp;
            </Text>
          </View>
        </View>
        <View>
          <Buttons
            primaryTitle={common.proceed}
            primaryOnPress={() => createNodeMutation.mutate()}
            width={'100%'}
            disabled={!checkedTermsCondition}
          />
        </View>
      </ScrollView>
      {createNodeMutation.isLoading && (
        <View>
          <ResponsePopupContainer
            visible={createNodeMutation.isLoading}
            enableClose={true}
            backColor={theme.colors.modalBackColor}
            borderColor={theme.colors.modalBackColor}>
            <NodeConnectingPopupContainer
              title={onBoarding.supportNodeConnectingTitle}
              subTitle={onBoarding.supportNodeConnectingSubTitle}
            />
          </ResponsePopupContainer>
        </View>
      )}
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <NodeConnectSuccessPopupContainer
            title={onBoarding.nodeconnectSuccessfulTitle}
            subTitle={onBoarding.nodeconnectSuccessfulSubTitle}
            onPress={() => {
              setVisible(false);
              navigation.navigate(NavigationRoutes.PROFILESETUP, {
                nodeConnectParams: {
                  nodeUrl: createNodeMutation.data.apiUrl,
                  nodeId: createNodeMutation.data.node.nodeId,
                  authentication: createNodeMutation.data.token,
                  peerDNS: createNodeMutation.data.peerDNS,
                  mnemonic: createNodeMutation.data.node.mnemonic,
                },
                nodeInfo: {},
                appType: AppType.SUPPORTED_RLN,
              });
            }}
          />
        </ResponsePopupContainer>
      </View>
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
