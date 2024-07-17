import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppText from './AppText';

type AssetChipProps = {
  tagText: string;
  backColor: string;
  tagColor: string;
};
const AssetChip = (props: AssetChipProps) => {
  const theme: AppTheme = useTheme();
  const { tagText, backColor, tagColor } = props;
  const styles = getStyles(backColor, tagColor, theme);
  return (
    <View style={styles.container}>
      <AppText
        variant="smallCTA"
        style={styles.textStyle}
        maxFontSizeMultiplier={1}>
        {tagText}
      </AppText>
    </View>
  );
};
const getStyles = (backColor, tagColor, theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: hp(10),
      paddingVertical: hp(2.5),
      paddingHorizontal: hp(10),
      backgroundColor: backColor,
      shadowColor: theme.colors.cardShadowColor,
      shadowRadius: 10,
      shadowOpacity: 0.4,
      elevation: 10,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
    textStyle: {
      color: tagColor,
      fontSize: 11,
      fontWeight: 'bold',
      textAlignVertical: 'center',
    },
  });
export default AssetChip;
