import Clipboard from '@react-native-clipboard/clipboard';
import React, { useContext, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMMKVBoolean } from 'react-native-mmkv';
import { RadioButton, useTheme } from 'react-native-paper';

import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import CustomYesNoSwitch from 'src/components/CustomYesNoSwitch';
import TextField from 'src/components/TextField';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

type LightningNodeProps = {
  onChangeConnectionURLText: (text: string) => void;
  inputConnectionURLValue: string;
  onChangeUsernameText: (text: string) => void;
  inputUsernameValue: string;
  onChangePasswordText: (text: string) => void;
  inputPasswordValue: string;
  onBearerTokenText: (text: string) => void;
  inputBearerTokenValue: string;
  onChangeAuthentication: (text: boolean) => void;
  authChangeValue: boolean;
  onChangeAuthType: (text: string) => void;
  authTypeValue: string;
  primaryOnPress: () => void;
  isLoading: boolean;
  handlePasteURL: () => void;
};

function LightningNodeDetailsContainer(props: LightningNodeProps) {
  const theme: AppTheme = useTheme();
  const {
    onChangeConnectionURLText,
    inputConnectionURLValue,
    onChangeUsernameText,
    inputUsernameValue,
    onChangePasswordText,
    inputPasswordValue,
    onBearerTokenText,
    inputBearerTokenValue,
    onChangeAuthentication,
    authChangeValue,
    onChangeAuthType,
    authTypeValue,
    primaryOnPress,
    isLoading,
    handlePasteURL,
  } = props;
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding, sendScreen } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [inputURLHeight, setURLInputHeight] = useState(50);
  const [inputBearerHeight, setBearerInputHeight] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const styles = getStyles(theme, inputURLHeight, inputBearerHeight);

  return (
    <>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={windowHeight > 670 ? 150 : 100}
        keyboardOpeningTime={0}>
        <ScrollView>
          <AppText variant="body2" style={styles.labelText1}>
            {onBoarding.apiUrlLabel}
          </AppText>
          <TextField
            value={inputConnectionURLValue}
            onChangeText={onChangeConnectionURLText}
            placeholder={onBoarding.nodeConURL}
            keyboardType={'default'}
            returnKeyType={'Enter'}
            contentStyle={
              inputConnectionURLValue
                ? styles.inputURLWrapper
                : styles.inputWrapper1
            }
            inputStyle={styles.inputStyle}
            style={styles.multilineTextInput}
            disabled={isLoading}
            onContentSizeChange={event => {
              setURLInputHeight(event.nativeEvent.contentSize.height);
            }}
            rightText={!inputConnectionURLValue && sendScreen.paste}
            rightIcon={
              inputConnectionURLValue && isThemeDark ? (
                <ClearIcon />
              ) : (
                <ClearIconLight />
              )
            }
            onRightTextPress={() =>
              inputConnectionURLValue
                ? onChangeConnectionURLText('')
                : handlePasteURL()
            }
            rightCTAStyle={styles.rightCTAStyle1}
            rightCTATextColor={theme.colors.accent1}
            multiline={true}
            numberOfLines={3}
          />
          <View style={styles.authContainer}>
            <View style={styles.authWrapper}>
              <AppText variant="heading2" style={styles.authTitleText}>
                {onBoarding.authentication}
              </AppText>
              <AppText variant="caption" style={styles.authSubTitleText}>
                {onBoarding.authSubTitle}
              </AppText>
            </View>
            <View style={styles.toggleWrapper}>
              <CustomYesNoSwitch
                value={authChangeValue}
                onValueChange={onChangeAuthentication}
              />
            </View>
          </View>

          {authChangeValue && (
            <View>
              <View style={styles.radioBtnContainer}>
                <View style={styles.radioBtnWrapper}>
                  <RadioButton.Android
                    color={theme.colors.accent1}
                    uncheckedColor={theme.colors.headingColor}
                    value={'Bearer'}
                    status={
                      authTypeValue === 'Bearer' ? 'checked' : 'unchecked'
                    }
                    onPress={() => {
                      onChangeAuthType('Bearer');
                    }}
                  />
                  <AppText variant="body2" style={styles.labelText}>
                    Bearer
                  </AppText>
                </View>
                <View style={styles.radioBtnWrapper}>
                  <RadioButton.Android
                    color={theme.colors.accent1}
                    uncheckedColor={theme.colors.headingColor}
                    value={'Basic'}
                    status={authTypeValue === 'Basic' ? 'checked' : 'unchecked'}
                    onPress={() => {
                      onChangeAuthType('Basic');
                    }}
                  />
                  <AppText variant="body2" style={styles.labelText}>
                    Basic
                  </AppText>
                </View>
              </View>
              {authTypeValue === 'Basic' ? (
                <View>
                  <TextField
                    value={inputUsernameValue}
                    onChangeText={onChangeUsernameText}
                    placeholder={onBoarding.enterUsername}
                    keyboardType={'default'}
                    returnKeyType={'done'}
                    style={styles.inputWrapper2}
                    disabled={isLoading}
                  />
                  <TextField
                    value={inputPasswordValue}
                    onChangeText={onChangePasswordText}
                    placeholder={onBoarding.enterPassword}
                    keyboardType={'default'}
                    returnKeyType={'done'}
                    style={styles.inputWrapper2}
                    inputStyle={styles.inputStyle}
                    contentStyle={styles.contentStyle}
                    disabled={isLoading}
                    secureTextEntry={!showPassword}
                    rightText={showPassword ? onBoarding.hide : onBoarding.show}
                    onRightTextPress={() => setShowPassword(!showPassword)}
                    rightCTAStyle={styles.rightCTAStyle}
                    rightCTATextColor={theme.colors.primaryCTAText}
                  />
                </View>
              ) : (
                <TextField
                  value={inputBearerTokenValue}
                  onChangeText={onBearerTokenText}
                  placeholder={onBoarding.enterBearerToken}
                  keyboardType={'default'}
                  returnKeyType={'Enter'}
                  disabled={isLoading}
                  contentStyle={
                    inputBearerTokenValue
                      ? styles.inputBearerWrapper
                      : styles.inputWrapper1
                  }
                  style={styles.multilineTextInput}
                  // onContentSizeChange={event => {
                  //   setBearerInputHeight(event.nativeEvent.contentSize.height);
                  // }}
                  multiline={true}
                  numberOfLines={5}
                />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAwareScrollView>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={primaryOnPress}
          width={'100%'}
          primaryLoading={isLoading}
          disabled={isLoading}
        />
      </View>
    </>
  );
}
const getStyles = (theme: AppTheme, inputURLHeight, inputBearerHeight) =>
  StyleSheet.create({
    container: {
      flex: Platform.OS === 'ios' ? 1 : 0,
      height: '100%',
    },
    inputURLWrapper: {
      borderRadius: 10,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(45, inputURLHeight),
      marginTop: 0,
    },
    inputBearerWrapper: {
      borderRadius: 10,
      // marginVertical: hp(25),
      marginBottom: 0,
      // height: Math.max(0, inputBearerHeight),
      marginTop: 0,
    },
    inputWrapper1: {
      height: hp(50),
    },
    multilineTextInput: {
      marginVertical: hp(5),
    },
    inputWrapper2: {
      marginVertical: hp(5),
    },
    inputStyle: {
      width: '80%',
    },
    contentStyle: {
      marginTop: 0,
    },
    authContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(20),
    },
    authWrapper: {
      width: '69%',
    },
    toggleWrapper: {
      width: '31%',
      justifyContent: 'flex-end',
    },
    authTitleText: {
      color: theme.colors.headingColor,
    },
    authSubTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
    radioBtnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: hp(10),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '40%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
    labelText1: {
      color: theme.colors.headingColor,
      marginBottom: hp(3),
    },
    ctaWrapper: {},
    rightCTAStyle: {
      backgroundColor: theme.colors.ctaBackColor,
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginHorizontal: hp(5),
    },
    rightCTAStyle1: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
export default LightningNodeDetailsContainer;
