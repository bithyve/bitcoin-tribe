import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { windowHeight } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

const KeyboardAvoidView = props => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      enabled
      keyboardVerticalOffset={Platform.select({
        ios: windowHeight > 670 ? 0 : 5,
        android: 0,
      })}
      style={{ ...styles.container, ...props.style }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {props.children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: Platform.OS == 'ios' ? 'auto' : 0,
      flex: Platform.OS == 'ios' ? 0 : 1,
    },
  });
export default KeyboardAvoidView;
