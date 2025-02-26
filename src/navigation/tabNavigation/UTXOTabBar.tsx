import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

const UTXOTabBar = ({ navigationState, position, jumpTo }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {navigationState.routes.map((route, index) => {
        const isActive = navigationState.index === index;

        return (
          <AppTouchable
            key={route.key}
            onPress={() => jumpTo(route.key)}
            style={styles.wrapper}>
            <AppText
              variant="heading2"
              style={{
                color: isActive
                  ? theme.colors.segmentSelectTitle
                  : theme.colors.secondaryHeadingColor,
              }}>
              {route.title}
            </AppText>
            <View
              style={[
                styles.activateView,
                {
                  height: isActive ? 1 : 0.2,
                  backgroundColor: isActive
                    ? theme.colors.segmentSelectTitle
                    : theme.colors.secondaryHeadingColor,
                },
              ]}
            />
          </AppTouchable>
        );
      })}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: hp(5),
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    activateView: {
      width: '100%',
      marginTop: hp(10),
    },
  });

export default UTXOTabBar;
