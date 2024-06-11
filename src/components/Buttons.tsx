import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp } from 'src/constants/responsive';
import AppText from './AppText';
import PrimaryCTA from './PrimaryCTA';
import AppTouchable from './AppTouchable';

type PrimaryCTAProps = {
  primaryOnPress: any;
  secondaryOnPress?: any;
  primaryTitle: string;
  width?: any;
  style?: any;
  secondaryTitle?: string;
};

function Buttons(props: PrimaryCTAProps) {
  const {
    primaryOnPress,
    primaryTitle,
    width,
    secondaryTitle,
    secondaryOnPress,
  } = props;
  const theme = useTheme();
  const styles = getStyles(theme, width);
  return (
    <View style={styles.container}>
      {secondaryTitle && (
        <AppTouchable onPress={secondaryOnPress}>
          <AppText
            variant="secondaryCTATitle"
            style={styles.seconadryTitleStyle}>
            {secondaryTitle}
          </AppText>
        </AppTouchable>
      )}
      <PrimaryCTA title={primaryTitle} onPress={primaryOnPress} width={width} />
    </View>
  );
}
const getStyles = (theme, width) =>
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
