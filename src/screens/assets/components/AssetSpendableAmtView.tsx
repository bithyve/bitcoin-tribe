import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Portal, Modal, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppTouchable from 'src/components/AppTouchable';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

type assetSpendableAmtViewProps = {
  spendableBalance: number | string;
  style?: StyleProp<ViewStyle>;
};

const AssetSpendableAmtView = (props: assetSpendableAmtViewProps) => {
  const { spendableBalance, style } = props;
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [visible, setVisible] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View>
      <View style={styles.balanceContainer}>
        <AppText variant="body2" style={styles.balanceText}>
          {assets.spendable} {numberWithCommas(spendableBalance)}
        </AppText>
        <AppTouchable
          onPress={() => setVisible(true)}
          style={styles.infoButton}>
          {isThemeDark ? (
            <InfoIcon width={24} height={24} />
          ) : (
            <InfoIconLight width={24} height={24} />
          )}
        </AppTouchable>
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.tooltipContainer, style]}>
          <AppText variant="caption" style={styles.tooltipText}>
            {assets.spendableBalanceInfo}
          </AppText>
        </Modal>
      </Portal>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    balanceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      justifyContent: 'space-between',
      marginVertical: hp(10),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      padding: hp(10),
      marginTop: hp(20),
      backgroundColor: theme.colors.primaryBackground,
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    infoButton: {},
    tooltipContainer: {
      backgroundColor: theme.colors.modalBackColor,
      padding: 12,
      borderRadius: 8,
      width: 270,
      alignItems: 'center',
      alignSelf: 'flex-end',
      right: 15,
    },
    tooltipText: {
      color: theme.colors.headingColor,
      fontSize: 14,
    },
  });

export default AssetSpendableAmtView;
