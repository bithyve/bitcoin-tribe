import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { hp } from 'src/constants/responsive';

type AssetChipProps = {
  tagText: string;
  backColor: string;
  tagColor: string;
};
const AssetChip = (props: AssetChipProps) => {
  const { tagText, backColor, tagColor } = props;
  const styles = getStyles(backColor, tagColor);
  return (
    <Chip
      style={styles.container}
      textStyle={styles.textStyle}
      maxFontSizeMultiplier={1}>
      {tagText}
    </Chip>
  );
};
const getStyles = (backColor, tagColor) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(20),
      backgroundColor: backColor,
    },
    textStyle: {
      color: tagColor,
      fontSize: 11,
      fontWeight: 'bold',
    },
  });
export default AssetChip;
