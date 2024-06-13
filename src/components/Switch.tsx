import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppTouchable from './AppTouchable';

type Props = {
  value: boolean;
  onValueChange: () => void;
  loading?: boolean;
  testID: string;
};

function Switch({ value, onValueChange, loading, testID }: Props) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, value), [theme]);

  const generatedTestId = useMemo(() => {
    return `switch_${testID}` + (value ? '_on' : '_off');
  }, [testID, value]);

  return (
    <AppTouchable
      testID={generatedTestId}
      onPress={onValueChange}
      disabled={loading}
      activeOpacity={1}>
      <View style={styles.container}>
        <View style={styles.toggleWrapper}>
          {value ? (
            <View style={styles.leftWrapper} />
          ) : (
            <View style={styles.rightWrapper} />
          )}
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, value) =>
  StyleSheet.create({
    container: {
      borderRadius: wp(15),
      backgroundColor: value ? theme.colors.toggleBackground : 'gray',
      padding: 2,
    },
    toggleWrapper: {
      height: windowHeight > 600 ? 28 : 20,
      width: windowHeight > 600 ? 50 : 40,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    leftWrapper: {
      height: windowHeight > 600 ? 28 : 15,
      width: windowHeight > 600 ? 28 : 15,
      borderRadius: 30,
      backgroundColor: theme.colors.primaryCTA,
      alignSelf: 'flex-end',
      marginHorizontal: 1,
    },
    rightWrapper: {
      height: windowHeight > 600 ? 28 : 15,
      width: windowHeight > 600 ? 28 : 15,
      borderRadius: 30,
      backgroundColor: theme.colors.profileBackground,
      alignSelf: 'flex-start',
      marginHorizontal: 1,
    },
  });
export default Switch;
