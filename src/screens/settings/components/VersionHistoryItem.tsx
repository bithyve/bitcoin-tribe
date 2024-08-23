import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

function VersionHistoryItem({ title, releaseNotes, date, lastIndex }) {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, lastIndex),
    [theme, lastIndex],
  );

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotView} />
      <View>
        <View style={styles.borderLeft} />
        <View style={styles.wrapper}>
          <AppTouchable onPress={toggleCollapse} style={styles.header}>
            <AppText variant="body1" style={styles.version}>
              {title}
            </AppText>
            <AppText variant="body2" style={styles.versionSubTitle}>
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
const getStyles = (theme: AppTheme, lastIndex) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    header: {
      marginLeft: hp(20),
    },
    wrapper: {
      // borderLeftColor: !lastIndex && theme.colors.accent2,
      // borderLeftWidth: !lastIndex && 1,
      paddingBottom: hp(30),
      //   borderStyle: 'dashed',
    },
    version: {
      color: theme.colors.headingColor,
    },
    versionSubTitle: {
      color: theme.colors.secondaryHeadingColor,
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
      marginTop: 5,
    },
    releaseNotes: {
      color: theme.colors.headingColor,
    },
    borderLeft: {
      position: 'absolute',
      left: 0,
      top: 5,
      bottom: -10,
      width: !lastIndex && 2,
      backgroundColor: !lastIndex && theme.colors.accent2,
    },
  });
export default VersionHistoryItem;
