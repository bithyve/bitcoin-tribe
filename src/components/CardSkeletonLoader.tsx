import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';

const CardSkeletonLoader = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.smallPill}
          shimmerColors={[
            theme.colors.inputBackground,
            theme.colors.cardGradient3,
            theme.colors.inputBackground,
          ]}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.toggle}
          shimmerColors={[
            theme.colors.inputBackground,
            theme.colors.cardGradient3,
            theme.colors.inputBackground,
          ]}
        />
      </View>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.fullPill}
        shimmerColors={[
          theme.colors.inputBackground,
          theme.colors.cardGradient3,
          theme.colors.inputBackground,
        ]}
      />
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.fullPill}
        shimmerColors={[
          theme.colors.inputBackground,
          theme.colors.cardGradient3,
          theme.colors.inputBackground,
        ]}
      />
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      marginTop: hp(25),
      marginHorizontal: hp(16),
    },
    smallPill: {
      height: 12,
      width: 120,
      borderRadius: 10,
      marginBottom: 20,
    },
    fullPill: {
      height: 12,
      borderRadius: 12,
      marginBottom: 5,
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggle: {
      height: 15,
      width: 15,
      borderRadius: 15,
    },
  });

export default CardSkeletonLoader;
