import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { ProgressBar, useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

type Props = {
  name: string;
  inbound: number;
  outbound: number;
  channel: object;
};

const ChannelItem = (props: Props) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, theme.colors.ctaBackColor);
  const navigation = useNavigation();

  const progress = useMemo(() => {
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
        <View>
          <AppText numberOfLines={1}>{props.name}</AppText>
          <View style={styles.containerAmts}>
            <AppText>{`${props.outbound}`}</AppText>
            <AppText>{`${props.inbound}`}</AppText>
          </View>

          <ProgressBar progress={progress} color={theme.colors.accent4} />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 20,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    containerAmts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(5),
    },
  });
