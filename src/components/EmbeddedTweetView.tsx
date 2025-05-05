import React, { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import CardSkeletonLoader from './CardSkeletonLoader';

const EmbeddedTweetView = ({ tweetId }: { tweetId: string }) => {
  const [loading, setLoading] = useState(true);
  if (!tweetId) {
    return <View />;
  }
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <blockquote class="twitter-tweet">
          <a href="https://twitter.com/twitter/status/${tweetId}"></a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </body>
    </html>
  `;

  return (
    <>
      {loading && <CardSkeletonLoader />}
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ height: 400 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </>
  );
};

export default EmbeddedTweetView;
