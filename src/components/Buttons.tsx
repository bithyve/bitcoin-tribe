import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp } from 'src/constants/responsive';
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
        />
      )}
      <PrimaryCTA
        title={primaryTitle}
        onPress={primaryOnPress}
        width={width}
        loading={primaryLoading}
        disabled={disabled}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
  });
export default Buttons;
