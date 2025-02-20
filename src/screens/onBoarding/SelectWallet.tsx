import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import SelectWalletTypeOption from './components/SelectWalletTypeOption';
import SupportIcon from 'src/assets/images/supportIcon.svg';
import SupportIconLight from 'src/assets/images/supportIcon_light.svg';
import { hp, wp } from 'src/constants/responsive';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import UnCheckIcon from 'src/assets/images/uncheckIcon.svg';
import UnCheckIconLight from 'src/assets/images/unCheckIcon_light.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Buttons from 'src/components/Buttons';
import AppTouchable from 'src/components/AppTouchable';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import AppType from 'src/models/enums/AppType';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import NodeConnectingPopupContainer from './components/NodeConnectingPopupContainer';
import NodeConnectSuccessPopupContainer from './components/NodeConnectSuccessPopupContainer';
import { Keys } from 'src/storage';
import MainnetIcon from 'src/assets/images/mainnetIcon.svg';
import MainnetIconLight from 'src/assets/images/mainnetIcon_light.svg';
import IconSettingArrow from 'src/assets/images/icon_arrowr2.svg';
import IconSettingArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import LightningIcon from 'src/assets/images/lightningIcon.svg';
import LightningIconLight from 'src/assets/images/lightningIcon_light.svg';
import WalletAdvanceDownIcon from 'src/assets/images/walletAdvanceDownIcon.svg';
import WalletAdvanceDownIconLight from 'src/assets/images/walletAdvanceDownIcon_light.svg';
import WalletAdvanceUpIcon from 'src/assets/images/walletAdvanceUpIcon.svg';
import WalletAdvanceUpIconLight from 'src/assets/images/walletAdvanceUpIcon_light.svg';
import AppText from 'src/components/AppText';
import LearnMoreTextView from './components/LearnMoreTextView';

function SelectWallet() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding, assets } = translations;
  const styles = getStyles(theme);
  const [openAdvanceOptions, setOpenAdvanceOptions] = useState(false);
  const [supportedMode, SetSupportedMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [checkedTermsCondition, SetCheckedTermsCondition] = useState(false);
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
        setTimeout(() => {
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
        }, 3000);
      }, 100);
    }
  }, [createNodeMutation.data, createNodeMutation.error]);

  return (
    <ScreenContainer>
      <AppHeader
        title={onBoarding.createWallet}
        rightIcon={
          !openAdvanceOptions ? (
            isThemeDark ? (
              <WalletAdvanceDownIcon />
            ) : (
              <WalletAdvanceDownIconLight />
            )
          ) : isThemeDark ? (
            <WalletAdvanceUpIcon />
          ) : (
            <WalletAdvanceUpIconLight />
          )
        }
        onSettingsPress={() => {
          SetSupportedMode(false);
          setOpenAdvanceOptions(!openAdvanceOptions);
        }}
      />
      <View style={styles.bodyWrapper}>
        <SelectWalletTypeOption
          title={onBoarding.mainnet}
          icon={isThemeDark ? <MainnetIcon /> : <MainnetIconLight />}
          rightIcon={
            isThemeDark ? <IconSettingArrow /> : <IconSettingArrowLight />
          }
          onPress={() => {
            SetSupportedMode(false);
            navigation.navigate(NavigationRoutes.PROFILESETUP);
          }}
        />
        <LearnMoreTextView
          title={onBoarding.onchainLearMoreInfo}
          onPress={() => navigation.navigate(NavigationRoutes.ONCHAINLEARNMORE)}
        />
        {openAdvanceOptions && (
          <>
            <View>
              <AppText variant="heading3" style={styles.advanceOptText}>
                {onBoarding.advanceOptionTitle}
              </AppText>
            </View>
            <View>
              <SelectWalletTypeOption
                title={onBoarding.mainnetAndLightning}
                icon={isThemeDark ? <LightningIcon /> : <LightningIconLight />}
                rightIcon={
                  isThemeDark ? <IconSettingArrow /> : <IconSettingArrowLight />
                }
                onPress={() => {
                  SetSupportedMode(false);
                  navigation.navigate(NavigationRoutes.RGBLIGHTNINGNODECONNECT);
                }}
                style={styles.selectTypeOptionWrapper}
              />
              <LearnMoreTextView
                title={onBoarding.lightningLearnMoreInfo}
                onPress={() =>
                  navigation.navigate(NavigationRoutes.LNLEARNMORE)
                }
              />
              <SelectWalletTypeOption
                title={onBoarding.supported}
                icon={isThemeDark ? <SupportIcon /> : <SupportIconLight />}
                onPress={() => {
                  SetSupportedMode(!supportedMode);
                }}
                borderColor={
                  supportedMode
                    ? theme.colors.accent1
                    : theme.colors.borderColor
                }
                style={styles.selectTypeOptionWrapper}
              />
              <LearnMoreTextView
                title={onBoarding.supportLearnMoreInfo}
                onPress={() =>
                  navigation.navigate(NavigationRoutes.SUPPORTLEARNMORE)
                }
              />
            </View>
          </>
        )}
      </View>
      {supportedMode && (
        <View>
          <View style={styles.termConditionWrapper}>
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
              primaryOnPress={() => createNodeMutation.mutate()}
              width={wp(120)}
              disabled={!checkedTermsCondition}
            />
          </View>
        </View>
      )}
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
            // onPress={() => {
            //   setVisible(false);
            //   navigation.navigate(NavigationRoutes.PROFILESETUP, {
            //     nodeConnectParams: {
            //       nodeUrl: createNodeMutation.data.apiUrl,
            //       nodeId: createNodeMutation.data.node.nodeId,
            //       authentication: createNodeMutation.data.token,
            //       peerDNS: createNodeMutation.data.peerDNS,
            //       mnemonic: createNodeMutation.data.node.mnemonic,
            //     },
            //     nodeInfo: {},
            //     appType: AppType.SUPPORTED_RLN,
            //   });
            // }}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    bodyWrapper: {
      height: '67%',
    },
    advanceOptText: {
      color: theme.colors.headingColor,
      marginTop: hp(20),
      marginBottom: hp(5),
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
    selectTypeOptionWrapper: {
      marginTop: hp(15),
    },
  });
export default SelectWallet;
