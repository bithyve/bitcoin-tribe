import React, { useRef, useState, useContext, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from 'react-native-paper';
import CardSkeletonLoader from './CardSkeletonLoader';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppText from './AppText';
import DeletedPost from 'src/assets/images/deletedPost.svg';
import DeletedPostLight from 'src/assets/images/deletedPostLight.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const EmbeddedTweetView = ({ tweetId }: { tweetId: string }) => {
  const webViewRef = useRef<WebView | null>(null);
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [loading, setLoading] = useState(true);
  const [tweetVisible, setTweetVisible] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState<number>(100);
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
      <blockquote class="twitter-tweet" data-theme="${theme.dark ? 'dark' : 'light'}">
        <a href="https://twitter.com/twitter/status/${tweetId}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      <script>
        (function () {
          const postHeight = (h) => {
            try {
              if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(String(h));
              }
            } catch (e) {
              // ignore in non-RN envs
              console.warn(e);
            }
          };

          // Return true if iframe exists and appears to be a twitter embed
          function findTweetIframe() {
            const iframe = document.querySelector('iframe[src*="twitter.com"]');
            return iframe || null;
          }

          // When iframe is found, measure body height and observe for changes
          function watchHeight() {
            const send = () => postHeight(document.body.scrollHeight || document.documentElement.scrollHeight || 0);
            send(); // initial
            // Use ResizeObserver on body (supported in modern mobile webviews)
            try {
              const ro = new ResizeObserver(send);
              ro.observe(document.body);
            } catch (e) {
              // fallback: poll for height changes
              let last = document.body.scrollHeight;
              setInterval(function() {
                const h = document.body.scrollHeight;
                if (h !== last) {
                  last = h;
                  postHeight(h);
                }
              }, 300);
            }
          }

          // Wait for tweet iframe to appear; if not found within 6s -> NOT_FOUND
          let found = false;
          const timeoutMs = 6000;
          const start = Date.now();

          const mo = new MutationObserver(() => {
            if (found) return;
            const iframe = findTweetIframe();
            if (iframe) {
              found = true;
              watchHeight();
              mo.disconnect();
            } else if (Date.now() - start > timeoutMs) {
              // not found in reasonable time
              postHeight('NOT_FOUND');
              mo.disconnect();
            }
          });

          mo.observe(document.body, { childList: true, subtree: true });

          // Also run an initial check in case it's already present
          setTimeout(() => {
            const iframe = findTweetIframe();
            if (iframe && !found) {
              found = true;
              watchHeight();
              mo.disconnect();
            }
          }, 500);

        })();
      </script>
    </body>
  </html>
`;

  const handleMessage = useCallback((event: any) => {
    const data = event.nativeEvent?.data;
    if (typeof data !== 'string') {
      return;
    }

    if (data === 'NOT_FOUND') {
      setTweetVisible(false);
      setLoading(false);
      return;
    }

    const parsed = parseInt(data, 10);
    if(parsed < 100){
      setLoading(false);
      setTweetVisible(false);
      return 
    }

    if (!Number.isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(hp(80), parsed+50);
      setWebViewHeight(clamped);
      setLoading(false);
      return;
    }
  }, []);

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
        ref={(r) => (webViewRef.current = r)}
        originWhitelist={['*']}
        source={{ html }}
        style={{
          height: webViewHeight,
          backgroundColor: theme.colors.primaryBackground,
          marginTop: hp(10),
        }}
        onLoadStart={() => setLoading(true)}
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