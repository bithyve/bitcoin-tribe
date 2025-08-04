import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';

export default function WebViewScreen() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const { url, title } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={title || ''}
        enableBack={true}
      />

      {url ? (
        <>
          <WebView
            source={{ uri: url }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            style={[
              styles.container,
              { backgroundColor: theme.colors.primaryBackground },
            ]}
            containerStyle={{
              backgroundColor: theme.colors.primaryBackground,
            }}
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
        </>
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
