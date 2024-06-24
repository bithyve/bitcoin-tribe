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

function SeedCard(props: seedCardProps) {
  const { item, index } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [showWordIndex, setShowWordIndex] = useState<string | number>('');
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
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: 70,
      width: '50%',
      flexDirection: 'row',
      paddingLeft: hp(15),
      alignItems: 'center',
      margin: hp(10),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      opacity: 0.6,
    },
    indexStyle: {
      color: theme.colors.accent1,
      marginRight: wp(5),
    },
    seedWordStyle: {
      color: theme.colors.bodyColor,
    },
  });
export default SeedCard;
