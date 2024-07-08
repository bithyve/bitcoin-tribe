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
  console.log('windowHeight', windowHeight)
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      enabled
      keyboardVerticalOffset={Platform.select({ ios: windowHeight>670? 40 : 5 , android: 500 })}
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
      flex: 1,
    },
  });
export default KeyboardAvoidView;
