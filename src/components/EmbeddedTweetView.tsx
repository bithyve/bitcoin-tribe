import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from 'react-native-paper';

import CardSkeletonLoader from './CardSkeletonLoader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';

const EmbeddedTweetView = ({ tweetId }: { tweetId: string }) => {
  const webViewRef = useRef(null);
  const theme: AppTheme = useTheme();
  const [loading, setLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(100);
  const [tweetVisible, setTweetVisible] = useState(true);

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
    if (data === 'NOT_FOUND') {
      setTweetVisible(false);
      setLoading(false);
      return;
    }
    const newHeight = parseInt(data, 10);
    if (!isNaN(newHeight) && newHeight > 0) {
      setWebViewHeight(newHeight);
      setLoading(false);
    }
  };

  if (!tweetVisible) {
    return null;
  }

  return (
    <>
      {loading && <CardSkeletonLoader />}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{
          height: webViewHeight,
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
