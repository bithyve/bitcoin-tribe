import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { wp } from 'src/constants/responsive';

import AppText from './AppText';
import AppTouchable from './AppTouchable';

type secondaryCTAProps = {
  title: string;
  onPress: () => void;
};
function SecondaryCTA(props: secondaryCTAProps) {
  const { title, onPress } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <AppTouchable onPress={onPress}>
      <AppText
        variant="secondaryCTATitle"
        style={styles.seconadryTitleStyle}
        testID={'text_secondaryBtnTitle'}>
        {title}
      </AppText>
    </AppTouchable>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    seconadryTitleStyle: {
      color: theme.colors.primaryCTA,
      marginRight: wp(10),
    },
  });
export default SecondaryCTA;
