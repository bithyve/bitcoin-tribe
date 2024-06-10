import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

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
    <View style={styles.container}>
      <Image
        source={{
          uri: asset,
        }}
        style={{
          width: '100%',
          height: '55%',
          borderRadius: 10,
        }}
      />
      <View style={styles.contentWrapper}>
        <AppText variant="body1" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body2" style={styles.detailsText}>
          {details}
        </AppText>
      </View>
    </View>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      backgroundColor: theme.colors.cardBackground,
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
