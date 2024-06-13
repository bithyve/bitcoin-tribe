import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { windowHeight, wp } from 'src/constants/responsive';

type Props = {
  value: boolean;
  onValueChange: () => void;
  loading?: boolean;
  testID?: string;
};

function Switch({ value, onValueChange, loading, testID }: Props) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, value), [theme]);
  console.log('value', value);
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onValueChange}
      disabled={loading}>
      <View style={styles.container}>
        <View style={styles.toggleWrapper}>
          {value ? (
            <View style={styles.leftWrapper} />
          ) : (
            <View style={styles.rightWrapper} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
const getStyles = (theme, value) =>
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
