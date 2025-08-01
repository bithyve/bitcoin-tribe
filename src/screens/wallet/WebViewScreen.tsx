import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import LottieView from 'lottie-react-native';

import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import { Keys } from 'src/storage';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ScreenContainer from 'src/components/ScreenContainer';

export default function WebViewScreen() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { url, title } = route.params;
  const { translations } = React.useContext(LocalizationContext);
  const { wallet } = translations;

  return (
    <ScreenContainer>
      <AppHeader
        title={title || ''}
        enableBack={true}
        rightText={'Close'}
        onRightTextPress={() => navigation.goBack()}
      />

      {url ? (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          style={styles.container}
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <LottieView
                source={require('src/assets/images/jsons/loader.json')}
                autoPlay
                loop
                style={styles.refreshLoader}
              />
            </View>
          )}
        />
      ) : null}
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
    },
    loaderContainer: {
      marginBottom: '75%',
    },
    refreshLoader: {
      alignSelf: 'center',
      width: 120,
      height: 120,
    },
  });
