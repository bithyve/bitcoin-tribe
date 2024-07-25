import * as React from 'react';
import { StyleSheet, View, Image, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import AssetChip from './AssetChip';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';

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
    <AppTouchable onPress={onPress} style={styles.container}>
      <View>
        <View style={styles.assetChipWrapper}>
          <AssetChip
            tagText={tag}
            backColor={theme.colors.cardBackground}
            tagColor={
              tag === 'COIN' ? theme.colors.accent2 : theme.colors.accent1
            }
          />
        </View>
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

        <View style={styles.contentWrapper}>
          <AppText variant="body1" style={styles.titleText}>
            {name}
          </AppText>
          <AppText variant="body2" style={styles.detailsText} numberOfLines={1}>
            {numberWithCommas(details)}
          </AppText>
        </View>
      </View>
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
      backgroundColor: theme.colors.cardBackground,
      position: 'relative',
    },
    imageStyle: {
      width: '100%',
      height: '70%',
      borderRadius: 10,
    },
    contentWrapper: {
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      height: '30%',
    },
    titleText: {
      color: theme.colors.headingColor,
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
      color: theme.colors.bodyColor,
      flexWrap: 'wrap',
    },
    assetChipWrapper: {
      position: 'absolute',
      zIndex: 999,
      left: 10,
      top: 10,
    },
  });
export default AssetCard;
