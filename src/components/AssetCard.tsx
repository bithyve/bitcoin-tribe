import * as React from 'react';
import { StyleSheet, View, Image, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import AssetChip from './AssetChip';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import GradientView from './GradientView';
import Capitalize from 'src/utils/capitalizeUtils';

type AssetCardProps = {
  image?: string;
  name?: string;
  ticker?: string;
  details?: string;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const AssetCard = (props: AssetCardProps) => {
  const { image, name, details, tag, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.assetImageWrapper}>
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageStyle}
            />
          ) : (
            <AppText variant="heading1" style={styles.textTicker}>
              {props.ticker}
            </AppText>
          )}
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.contentWrapper2}>
            <AppText
              variant="body2"
              style={[
                styles.tagTextStyle,
                {
                  color:
                    tag === 'COIN'
                      ? theme.colors.accent2
                      : theme.colors.accent1,
                },
              ]}>
              {Capitalize(tag)}
            </AppText>
            <AppText
              variant="caption"
              style={styles.detailsText}
              numberOfLines={1}>
              {numberWithCommas(details)}&nbsp;sats
            </AppText>
          </View>
          <AppText variant="caption" style={styles.titleText}>
            {name}
          </AppText>
        </View>
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      margin: hp(5),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    imageStyle: {
      width: '100%',
      height: '70%',
      borderRadius: 10,
    },
    contentWrapper: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      height: '30%',
      justifyContent: 'center',
    },
    contentWrapper2: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleText: {
      lineHeight: hp(15),
      fontWeight: '300',
      color: theme.colors.secondaryHeadingColor,
    },
    textTicker: {
      color: theme.colors.accent1,
      width: '100%',
      height: '35%',
      textAlign: 'center',
      marginTop: '40%',
      fontSize: 35,
    },
    detailsText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    tagTextStyle: {
      lineHeight: hp(20),
    },
    assetImageWrapper: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 0.8,
    },
  });
export default AssetCard;
