import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

function VersionHistoryItem({ title, releaseNotes, date }) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotView} />
      <View style={styles.wrapper}>
        <AppTouchable onPress={toggleCollapse} style={styles.header}>
          <AppText variant="body1" style={styles.version}>
            {title}
          </AppText>
          <AppText variant="body2" style={styles.version}>
            {moment(date).fromNow()}
          </AppText>
        </AppTouchable>
        {!isCollapsed && releaseNotes && (
          <View style={styles.content}>
            <AppText variant="body2" style={styles.releaseNotes}>
              {releaseNotes}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: 10,
      marginVertical: hp(10),
      paddingTop: hp(15),
    },
    header: {
      marginLeft: hp(20),
    },
    wrapper: {
      borderLeftColor: theme.colors.primaryCTA,
      borderLeftWidth: 1,
      //   borderStyle: 'dashed',
    },
    version: {
      color: theme.colors.bodyColor,
    },
    content: {
      backgroundColor: theme.colors.cardBackground,
      padding: 15,
      marginHorizontal: 15,
      color: theme.colors.bodyColor,
      borderRadius: 10,
      shadowColor: theme.colors.shodowColor,
      shadowRadius: 0,
      shadowOpacity: 0.2,
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 1,
      },
    },
    dotView: {
      backgroundColor: theme.colors.primaryCTA,
      height: 12,
      width: 12,
      borderRadius: 40,
      shadowColor: theme.colors.cardShadowColor,
      shadowRadius: 5,
      shadowOpacity: 1,
      elevation: 8,
      shadowOffset: {
        width: 1,
        height: 1,
      },
      top: 0,
      right: -6,
    },
    releaseNotes: {
      color: theme.colors.bodyColor,
    },
  });
export default VersionHistoryItem;
