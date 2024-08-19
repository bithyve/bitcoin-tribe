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
      <View>
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
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    header: {
      marginLeft: hp(20),
    },
    wrapper: {
      borderLeftColor: theme.colors.accent2,
      borderLeftWidth: 1,
      paddingBottom: hp(25),
      //   borderStyle: 'dashed',
    },
    version: {
      color: theme.colors.headingColor,
    },
    content: {
      backgroundColor: theme.colors.cardBackground,
      padding: 15,
      marginHorizontal: 15,
      color: theme.colors.headingColor,
      borderRadius: 10,
    },
    dotView: {
      backgroundColor: theme.colors.accent2,
      height: 11,
      width: 11,
      borderRadius: 40,
      top: 0,
      left: 6,
    },
    releaseNotes: {
      color: theme.colors.headingColor,
    },
  });
export default VersionHistoryItem;
