import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppTheme } from 'src/theme';
import IconArrowUp from 'src/assets/images/icon_arrowUp.svg';
import IconArrowUpLight from 'src/assets/images/icon_arrowUp_light.svg';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowd_light.svg';
import { Keys } from 'src/storage';

type Props = {
  title: string;
  releaseNotes: string;
  date: string;
  lastIndex: boolean;
  version: string;
};
function VersionHistoryItem({
  title,
  releaseNotes,
  date,
  lastIndex,
  version,
}: Props) {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(
    () => getStyles(theme, lastIndex),
    [theme, lastIndex],
  );
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handlePressItem = version => {
    setIsCollapsed(!isCollapsed);
    ApiHandler.loadGithubReleaseNotes(version);
  };
  const renderIcon = () => {
    if (isCollapsed) {
      return isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />;
    } else {
      return isThemeDark ? <IconArrowUp /> : <IconArrowUpLight />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotView} />
      <View>
        <View style={styles.borderLeft} />
        <View style={styles.wrapper}>
          <AppTouchable
            onPress={() => {
              handlePressItem(version);
            }}
            style={styles.header}>
            <View style={styles.titleViewWrapper}>
              <AppText variant="body1" style={styles.version}>
                {title}
              </AppText>
              <AppText variant="body2" style={styles.versionSubTitle}>
                {moment(date).fromNow()}
              </AppText>
            </View>
            <View style={styles.dropDownIconWrapper}>{renderIcon()}</View>
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
      flexDirection: 'row',
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
      marginTop: hp(10),
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
    titleViewWrapper: {
      width: '90%',
    },
    dropDownIconWrapper: {
      width: '10%',
    },
  });
export default VersionHistoryItem;
