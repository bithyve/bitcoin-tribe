import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useNavigation } from '@react-navigation/native';

import AppTouchable from 'src/components/AppTouchable';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

type TransactionInfoCardViewProps = {
  style?: StyleProp<ViewStyle>;
};

const TransactionInfoCard = (props: TransactionInfoCardViewProps) => {
  const { style } = props;
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View>
      <View style={styles.txnInfoContainer}>
        <AppText variant="body2" style={styles.titleText}>
          {assets.assetTxnInfoTitle}
        </AppText>
        <AppTouchable
          onPress={() =>
            navigation.navigate(NavigationRoutes.TRANSACTIONTYPEINFO)
          }
          style={styles.infoButton}>
          {isThemeDark ? (
            <InfoIcon width={24} height={24} />
          ) : (
            <InfoIconLight width={24} height={24} />
          )}
        </AppTouchable>
      </View>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    txnInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      justifyContent: 'space-between',
      marginVertical: hp(10),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      padding: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    infoButton: {},
  });

export default TransactionInfoCard;
