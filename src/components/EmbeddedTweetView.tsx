import React, { useRef, useState, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from 'react-native-paper';
import CardSkeletonLoader from './CardSkeletonLoader';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppText from './AppText';
import DeletedPost from 'src/assets/images/deletedPost.svg'
import DeletedPostLight from 'src/assets/images/deletedPostLight.svg'
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const EmbeddedTweetView = ({ tweetId }: { tweetId: string }) => {
  const webViewRef = useRef(null);
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [loading, setLoading] = useState(true);
  const [tweetVisible, setTweetVisible] = useState(true);
  const styles = getStyles(theme);

  if (!tweetId) {
    return <View />;
  }
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background-color: ${theme.colors.primaryBackground};
        }
        .twitter-tweet {
          background-color: ${theme.colors.primaryBackground} !important;
        }
      </style>
    </head>
    <body>
      <blockquote class="twitter-tweet" data-theme="${
        theme.dark ? 'dark' : 'light'
      }">
        <a href="https://twitter.com/twitter/status/${tweetId}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      <script>
        function waitForTweet() {
          const observer = new MutationObserver((mutations, obs) => {
            const tweet = document.querySelector('.twitter-tweet');
            if (tweet) {
              const iframe = tweet.querySelector('iframe');
              if (iframe) {
                const resizeObserver = new ResizeObserver(() => {
                  const height = document.body.scrollHeight;
                  window.ReactNativeWebView.postMessage(height);
                });
                resizeObserver.observe(tweet);
                const height = document.body.scrollHeight;
                window.ReactNativeWebView.postMessage(height);
                obs.disconnect();
              } else {
                window.ReactNativeWebView.postMessage("NOT_FOUND");
                obs.disconnect();
              }
            }
          });

          observer.observe(document.body, { childList: true, subtree: true });
          setTimeout(() => {
            const tweet = document.querySelector('.twitter-tweet');
            const iframe = tweet?.querySelector('iframe');
            if (!iframe) {
              window.ReactNativeWebView.postMessage("NOT_FOUND");
            }
          }, 5000);
        }

        window.onload = waitForTweet;
      </script>
    </body>
  </html>
`;

  const handleMessage = (event: any) => {
    const data = event.nativeEvent.data;
    if (data === 'NOT_FOUND' || data < 100) {
      setTweetVisible(false);
      setLoading(false);
      return;
    }
    const newHeight = parseInt(data, 10);
    if (!isNaN(newHeight) && newHeight > 0) {
      setLoading(false);
    }
  };

  if (!tweetVisible) {
    return (
      <View style={styles.deletedCtr}>
        {theme.dark ? <DeletedPost /> : <DeletedPostLight />}
        <AppText variant="caption" style={styles.deletedCtrTxt}>
          {assets.postDeletedOrUnavailable}
        </AppText>
      </View>
    );
  }

  return (
    <>
      {loading && <CardSkeletonLoader />}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{
          height: hp(320),
          backgroundColor: theme.colors.primaryBackground,
          marginTop: hp(10),
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        onMessage={handleMessage}
        scrollEnabled={false}
      />
    </>
  );
};

export default EmbeddedTweetView;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    deletedCtr: {
      backgroundColor: theme.colors.cardGradient1,
      width: '100%',
      padding: wp(28),
      marginTop: hp(20),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      alignItems: 'center',
      gap: hp(15),
    },
    deletedCtrTxt: { textAlign: 'center', maxWidth: '65%' },
  });