import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { ProgressBar, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useNavigation } from '@react-navigation/native';

import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { formatNumber } from 'src/utils/numberWithCommas';

type Props = {
  name: string;
  inbound: number;
  outbound: number;
  channel: object;
  localBalanceMsat: number;
  capacitySat: number;
};

const ChannelItem = (props: Props) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, theme.colors.ctaBackColor);
  const navigation = useNavigation();

  const satsProgress = useMemo(() => {
    const total = props.capacitySat;
    return props.localBalanceMsat / 1000 / total;
  }, [props.capacitySat, props.localBalanceMsat]);

  const assetsProgress = useMemo(() => {
    const total = props.inbound + props.outbound;
    return props.outbound / total;
  }, [props.inbound, props.outbound]);

  return (
    <AppTouchable
      onPress={() =>
        navigation.navigate(NavigationRoutes.CHANNELDETAILS, {
          channel: props.channel,
        })
      }>
      <GradientView
        style={[styles.container]}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.progressbarWrapper}>
          <AppText numberOfLines={1} style={styles.assetIDText}>
            {props.name}
          </AppText>
          <View style={styles.containerAmts}>
            <View style={styles.contentWrapper}>
              <View
                style={[
                  styles.dotView,
                  { backgroundColor: theme.colors.assetsProgressFill },
                ]}
              />
              <AppText variant="caption" style={styles.titleText}>
                {formatNumber(`${props.outbound}`)} assets
              </AppText>
            </View>
            <View style={styles.contentWrapper}>
              <View
                style={[
                  styles.dotView,
                  { backgroundColor: theme.colors.assetsProgressRemaining },
                ]}
              />
              <AppText variant="caption" style={styles.titleText}>
                {formatNumber(`${props.inbound}`)} assets
              </AppText>
            </View>
          </View>
          {assetsProgress > 0 && (
            <ProgressBar
              progress={isNaN(assetsProgress) ? 0 : assetsProgress}
              style={{ backgroundColor: theme.colors.assetsProgressRemaining }}
              color={theme.colors.assetsProgressFill}
            />
          )}
        </View>
        <View style={styles.progressbarWrapper}>
          <View style={styles.containerAmts}>
            <View style={styles.contentWrapper}>
              <View
                style={[
                  styles.dotView,
                  { backgroundColor: theme.colors.satsProgressFill },
                ]}
              />
              <AppText variant="caption" style={styles.titleText}>
                {formatNumber(`${props.localBalanceMsat / 1000}`)}
              </AppText>
            </View>
            <View style={styles.contentWrapper}>
              <View
                style={[
                  styles.dotView,
                  { backgroundColor: theme.colors.satsProgressRemaining },
                ]}
              />
              <AppText variant="caption" style={styles.titleText}>
                {`${formatNumber(
                  `${props.capacitySat - props.localBalanceMsat / 1000}`,
                )}`}
              </AppText>
            </View>
          </View>
          {satsProgress > 0 && (
            <ProgressBar
              progress={isNaN(satsProgress) ? 0 : satsProgress}
              style={{ backgroundColor: theme.colors.satsProgressRemaining }}
              color={theme.colors.satsProgressFill}
            />
          )}
        </View>
      </GradientView>
    </AppTouchable>
  );
};

export default ChannelItem;

const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 20,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    assetIDText: {
      color: theme.colors.headingColor,
      marginBottom: hp(15),
    },
    containerAmts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(10),
    },
    progressbarWrapper: {
      width: '100%',
      marginVertical: hp(5),
    },
    contentWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dotView: {
      height: 15,
      width: 15,
      borderRadius: 5,
    },
    titleText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
  });
