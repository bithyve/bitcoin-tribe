import React, { useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppTouchable from './AppTouchable';
import AppText from './AppText';

type seedCardProps = {
  item: string;
  index: number;
};
// need to work - visible only one seed
function SeedCard(props: seedCardProps) {
  const { item, index } = props;
  const theme: AppTheme = useTheme();
  const [showWordIndex, setShowWordIndex] = useState<string | number>('');
  const styles = getStyles(theme, showWordIndex, index);
  return (
    <AppTouchable
      style={styles.container}
      onPress={() =>
        setShowWordIndex(prev => {
          if (prev === index) {
            return '';
          }
          return index;
        })
      }>
      <AppText variant="body7" style={styles.indexStyle}>
        {index < 9 ? '0' : null}
        {index + 1}
      </AppText>
      <AppText variant="body6" style={styles.seedWordStyle}>
        {showWordIndex === index ? item : '******'}
      </AppText>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, showWordIndex, index) =>
  StyleSheet.create({
    container: {
      height: 70,
      width: '48%',
      flexDirection: 'row',
      paddingLeft: hp(10),
      alignItems: 'center',
      marginVertical: hp(8),
      marginRight: index % 2 ? 0 : hp(15),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      opacity: showWordIndex === index ? 1 : 0.6,
    },
    indexStyle: {
      color: theme.colors.accent1,
      marginRight: wp(10),
    },
    seedWordStyle: {
      color: theme.colors.bodyColor,
      paddingTop: showWordIndex === index ? 0 : hp(10),
      paddingBottom: showWordIndex === index ? 0 : hp(5),
    },
  });
export default SeedCard;
