import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';

import { wp, hp } from '../constants/responsive';
import AppText from './AppText';

type AssetCardProps = {
  asset?: any;
  title?: string;
  details?: string;
};

const AssetCard = (props: AssetCardProps) => {
  const { asset, title, details } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <TouchableRipple
      rippleColor={'gray'}
      onPress={() => console.log('asset card')}
      style={styles.container}>
      <View>
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
    </TouchableRipple>
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
  });
export default AssetCard;
