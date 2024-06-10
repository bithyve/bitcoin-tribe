import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { hp } from '../constants/responsive';

type AssetChipProps = {
  tagText: string;
};
const AssetChip = (props: AssetChipProps) => {
  const { tagText } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <Chip style={styles.container} textStyle={styles.textStyle}>
      {tagText}
    </Chip>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(20),
      backgroundColor: theme.colors.cardBackground,
    },
    textStyle: {
      color: theme.colors.accent1,
      fontSize: 11,
      fontWeight: 'bold',
    },
  });
export default AssetChip;
