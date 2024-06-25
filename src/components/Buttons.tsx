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
};

function Buttons(props: PrimaryCTAProps) {
  const {
    primaryOnPress,
    primaryTitle,
    width,
    secondaryTitle,
    secondaryOnPress,
    primaryLoading,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {secondaryTitle && (
        <SecondaryCTA onPress={secondaryOnPress} title={secondaryTitle} />
      )}
      <PrimaryCTA
        title={primaryTitle}
        onPress={primaryOnPress}
        width={width}
        loading={primaryLoading}
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
    seconadryTitleStyle: {
      color: theme.colors.primaryCTA,
      marginRight: wp(10),
    },
  });
export default Buttons;
