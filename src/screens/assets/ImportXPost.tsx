import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MMKV, useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMutation } from 'react-query';

import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { Keys } from 'src/storage';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { Asset } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';

export const getRateLimitKey = (assetId: string) =>
  `${Keys.RATE_LIMIT_KEY}_${assetId}`;

export const getRateLimitedTweetUrlKey = (assetId: string) =>
  `${Keys.RATE_LIMITED_TWEET_URL_KEY}_${assetId}`;

function ImportXPost() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const storage = new MMKV();
  const RATE_LIMIT_DURATION = 15 * 60 * 1000;
  const { assetId, schema, asset } = useRoute().params;
  const [appId] = useMMKVString(Keys.APPID);
  const { translations } = useContext(LocalizationContext);
  const { common, assets, sendScreen } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [tweetUrl, setTweetUrl] = useState('');
  const [tweetId, setTweetId] = useState<string | null>(null);
  const [inputHeight, setInputHeight] = React.useState(50);
  const [tweetUrlValidationError, setTweetUrlValidationError] = useState('');
  const [isCtaEnabled, setIsCtaEnabled] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRemainingTime, setRateLimitRemainingTime] = useState(0);
  const styles = getStyles(theme, inputHeight);
  const verified = asset?.issuer?.verifiedBy?.some(
    item => item.verified === true,
  );

  const { mutateAsync, isLoading } = useMutation(
    ({
      tweetId,
      assetId,
      schema,
      asset,
    }: {
      tweetId: string;
      assetId: string;
      schema: RealmSchema;
      asset: Asset;
    }) =>
      ApiHandler.validateTweetForAsset(
        tweetId,
        assetId,
        schema,
        asset,
      ),
  );

  useEffect(() => {
    const rateLimitKey = getRateLimitKey(assetId);
    const rateLimitedUrlKey = getRateLimitedTweetUrlKey(assetId);

    const checkCooldown = () => {
      const saved = storage.getNumber(rateLimitKey);
      const savedUrl = storage.getString(rateLimitedUrlKey);
      if (saved) {
        const now = Date.now();
        const diff = now - saved;
        if (diff < RATE_LIMIT_DURATION) {
          setIsRateLimited(true);
          setRateLimitRemainingTime(RATE_LIMIT_DURATION - diff);
          if (savedUrl) {
            setTweetUrl(savedUrl);
          }
        } else {
          storage.delete(rateLimitKey);
          storage.delete(rateLimitedUrlKey);
          setIsRateLimited(false);
        }
      }
    };

    checkCooldown();

    const interval = setInterval(() => {
      setRateLimitRemainingTime(prev => {
        if (prev <= 1000) {
          setIsRateLimited(false);
          storage.delete(rateLimitKey);
          storage.delete(rateLimitedUrlKey);
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [assetId]);

  useEffect(() => {
    setIsCtaEnabled(!!tweetUrl && !tweetUrlValidationError);
  }, [tweetUrl, tweetUrlValidationError]);

  const navigateWithDelay = (callback: () => void) => {
    setTimeout(() => {
      callback();
    }, 1000);
  };

  const extractTweetId = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      const hostnameValid = ['x.com', 'twitter.com'].includes(
        parsed.hostname.replace('www.', ''),
      );
      const pathParts = parsed.pathname.split('/');

      if (!hostnameValid || pathParts.length < 4 || pathParts[2] !== 'status') {
        return null;
      }

      const tweetId = pathParts[3];
      return /^[0-9]+$/.test(tweetId) ? tweetId : null;
    } catch (e) {
      return null;
    }
  };

  const handleVerifyTweet = async () => {
    const id = extractTweetId(tweetUrl.trim());
    if (!id) {
      Toast('Could not extract tweet ID.', true);
      return;
    }

    const rateLimitKey = getRateLimitKey(assetId);
    const rateLimitedUrlKey = getRateLimitedTweetUrlKey(assetId);

    try {
      const result = await mutateAsync({ tweetId: id, assetId, schema, asset });
      if (result?.success) {
        setTweetId(id);
        storage.delete(rateLimitedUrlKey);
        Toast('X post added successfully.');
        navigateWithDelay(() => navigation.goBack());
      } else {
        if (result?.reason?.toLowerCase().includes('too many requests')) {
          const now = Date.now();
          storage.set(rateLimitKey, now);
          storage.set(rateLimitedUrlKey, tweetUrl.trim());
          setIsRateLimited(true);
          setRateLimitRemainingTime(RATE_LIMIT_DURATION);
        } else {
          Toast(result?.reason || 'Unknown error.', true);
        }
      }
    } catch (error) {
      Toast('Unexpected error occurred.', true);
      console.error('handleVerifyTweet error:', error);
    }
  };

  const handleXPostUrlChange = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      setTweetUrl('');
      setTweetUrlValidationError('Please enter url');
      return;
    }
    setTweetUrl(trimmed);
  };

  const handlePasteURL = async () => {
    const clipboardValue = await Clipboard.getString();
    setTweetUrl(clipboardValue);
    setTweetUrlValidationError('');
  };

  const handleClearURL = () => {
    setTweetUrl('');
    setTweetUrlValidationError('');
    const rateLimitedUrlKey = getRateLimitedTweetUrlKey(assetId);
    storage.delete(rateLimitedUrlKey);
  };

  return (
    <ScreenContainer>
      <AppHeader title={assets.importXPostTitle} />
      <ModalLoading visible={isLoading} />
      <KeyboardAvoidView style={styles.container}>
        <AppText variant="body1" style={styles.headText}>
          {assets.importXPostSubTitle}
        </AppText>
        <View style={styles.inputViewWrapper}>
          <AppText variant="body1" style={styles.labelText}>
            {assets.importXPostLabel}
          </AppText>
          <TextField
            value={tweetUrl}
            onChangeText={handleXPostUrlChange}
            placeholder={assets.importXPostPlaceholder}
            autoFocus={true}
            multiline={true}
            onContentSizeChange={event => {
              setInputHeight(event.nativeEvent.contentSize.height);
            }}
            numberOfLines={3}
            inputStyle={styles.inputStyle}
            contentStyle={tweetUrl ? styles.contentStyle : styles.contentStyle1}
            rightText={!tweetUrl && sendScreen.paste}
            rightIcon={
              tweetUrl && isThemeDark ? <ClearIcon /> : <ClearIconLight />
            }
            onRightTextPress={() =>
              tweetUrl ? handleClearURL() : handlePasteURL()
            }
            rightCTAStyle={styles.rightCTAStyle}
            rightCTATextColor={theme.colors.accent1}
            blurOnSubmit={false}
            returnKeyType="done"
            error={tweetUrlValidationError}
            keyboardType="url"
            autoCapitalize="none"
            onSubmitEditing={handleVerifyTweet}
          />
        </View>
      </KeyboardAvoidView>
      <View style={styles.ctaWrapper}>
        {isRateLimited && (
          <View style={styles.ratelimitMsgWrapper}>
            <AppText variant="body1" style={styles.ratelimitMsg}>
              {assets.rateLimitMsg}
            </AppText>
          </View>
        )}
        <Buttons
          primaryTitle={isRateLimited ? common.retry : common.proceed}
          primaryOnPress={() => handleVerifyTweet()}
          disabled={!isCtaEnabled || isRateLimited}
          width={'100%'}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme, inputHeight) =>
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
    inputStyle: {
      padding: 10,
      width: '80%',
    },
    ctaWrapper: {},
    ratelimitMsgWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(10),
    },
    ratelimitMsg: {
      textAlign: 'center',
      color: theme.colors.headingColor,
    },
    rightCTAStyle: {
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
    contentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
    },
  });
export default ImportXPost;
