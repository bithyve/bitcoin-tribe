import * as React from 'react';
import { StyleSheet, View, Image, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import AssetChip from './AssetChip';
import { AppTheme } from 'src/theme';

type AssetCardProps = {
  asset?: string;
  title?: string;
  details?: string;
  tag?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const AssetCard = (props: AssetCardProps) => {
  const { asset, title, details, tag, onPress } = props;
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
        <Image
          source={{
            uri: asset,
          }}
          style={styles.imageStyle}
        />
        <View style={styles.contentWrapper}>
          <AppText variant="body1" style={styles.titleText}>
            {title}
          </AppText>
          <AppText variant="body2" style={styles.detailsText} numberOfLines={1}>
            {details}
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
