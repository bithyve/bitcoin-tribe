import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import PrimaryCTA from './PrimaryCTA';
import SecondaryCTA from './SecondaryCTA';
import { AppTheme } from 'src/theme';

type PrimaryCTAProps = {
  primaryOnPress: () => void;
  secondaryOnPress?: () => void;
  primaryTitle: string;
  width?: any;
  style?: StyleProp<ViewStyle>;
  secondaryTitle?: string;
  primaryLoading?: boolean;
  disabled?: boolean;
  secondaryCTAWidth?: number;
  height?: number;
};

function Buttons(props: PrimaryCTAProps) {
  const {
    primaryOnPress,
    primaryTitle,
    width,
    secondaryCTAWidth,
    secondaryTitle,
    secondaryOnPress,
    primaryLoading,
    disabled,
    height = hp(20),
  } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {secondaryTitle && (
        <SecondaryCTA
          onPress={secondaryOnPress}
          title={secondaryTitle}
          width={secondaryCTAWidth}
          height={height}
        />
      )}
      <PrimaryCTA
        title={primaryTitle}
        onPress={primaryOnPress}
        width={width}
        loading={primaryLoading}
        disabled={disabled}
        height={height}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
export default Buttons;
