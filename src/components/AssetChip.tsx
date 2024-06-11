import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';

type AssetChipProps = {
  tagText: string;
  backColor: any;
};
const AssetChip = (props: AssetChipProps) => {
  const { tagText, backColor } = props;
  const theme = useTheme();
  const styles = getStyles(theme, backColor);
  return (
    <Chip style={styles.container} textStyle={styles.textStyle}>
      {tagText}
    </Chip>
  );
};
const getStyles = (theme, backColor) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(20),
      backgroundColor: backColor,
    },
    textStyle: {
      color: theme.colors.accent1,
      fontSize: 11,
      fontWeight: 'bold',
    },
  });
export default AssetChip;
