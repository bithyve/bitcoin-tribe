import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
type activePageIndicatorProps = {
  totalPages: number;
  currentPage: number;
};
const ActivePageIndicator = ({
  totalPages = 3,
  currentPage = 0,
}: activePageIndicatorProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentPage === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: hp(5),
    },
    dot: {
      width: hp(6),
      height: hp(4),
      borderRadius: 5,
      marginHorizontal: hp(3),
    },
    activeDot: {
      backgroundColor: theme.colors.accent1,
      width: hp(30),
      height: hp(4),
    },
    inactiveDot: {
      backgroundColor: theme.colors.inActiveDotColor,
    },
  });

export default ActivePageIndicator;
