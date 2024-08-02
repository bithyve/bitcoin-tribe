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
  visible: boolean;
  callback: (index, item) => void;
};

function SeedCard(props: seedCardProps) {
  const { item, index, visible, callback } = props;
  const theme: AppTheme = useTheme();

  const styles = getStyles(theme, visible, index);
  return (
    <AppTouchable
      style={styles.container}
      onPress={() => callback(index, item)}>
      <AppText variant="heading3" style={styles.indexStyle}>
        {index < 9 ? '0' : null}
        {index + 1}
      </AppText>
      <AppText variant="heading2" style={styles.seedWordStyle}>
        {visible ? item : '******'}
      </AppText>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, visible, index) =>
  StyleSheet.create({
    container: {
      height: 70,
      width: '48%',
      flexDirection: 'row',
      paddingLeft: hp(10),
      alignItems: 'center',
      marginVertical: hp(7),
      marginRight: index % 2 ? 0 : hp(15),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
      opacity: visible ? 1 : 0.8,
    },
    indexStyle: {
      color: theme.colors.accent1,
      marginRight: wp(10),
      fontWeight: 'bold',
    },
    seedWordStyle: {
      color: theme.colors.headingColor,
      opacity: visible ? 1 : 0.8,
      paddingTop: visible ? 0 : hp(10),
      paddingBottom: visible ? 0 : hp(5),
    },
  });
export default SeedCard;
