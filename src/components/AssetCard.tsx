import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import AssetChip from './AssetChip';

type AssetCardProps = {
  asset?: any;
  title?: string;
  details?: string;
  tag?: string;
};

const AssetCard = (props: AssetCardProps) => {
  const { asset, title, details, tag } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable
      onPress={() => console.log('asset card')}
      style={styles.container}>
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
          <AppText variant="body2" style={styles.detailsText} numberOfLines={2}>
            {details}
          </AppText>
        </View>
      </View>
    </AppTouchable>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      margin: wp(5),
      backgroundColor: theme.colors.cardBackground,
      position: 'relative',
    },
    imageStyle: {
      width: '100%',
      height: '60%',
      borderRadius: 10,
    },
    contentWrapper: {
      padding: 10,
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
      left: 5,
      top: 10,
    },
  });
export default AssetCard;
