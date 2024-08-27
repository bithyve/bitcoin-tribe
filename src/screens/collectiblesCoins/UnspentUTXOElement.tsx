import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';

import { AppTheme } from 'src/theme';

type UnspentUTXOElementProps = {
  transID: string;
  satsAmount: string;
  assetID: any;
  style?: StyleProp<ViewStyle>;
};
function UnspentUTXOElement(props: UnspentUTXOElementProps) {
  const { transID, satsAmount, assetID, style } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <GradientView
      style={[styles.container, style]}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.contentWrapper}>
        <View style={styles.transIDWrapper}>
          <AppText
            variant="body2"
            style={styles.transIDText}
            numberOfLines={1}
            ellipsizeMode="middle">
            {transID}
          </AppText>
        </View>
        <View style={styles.amtWrapper}>
          <AppText variant="body2" style={styles.amountText}>
            SATS &nbsp;{satsAmount}
          </AppText>
        </View>
      </View>
      <View>
        {assetID.map(
          allocation =>
            allocation.assetId && (
              <AppText variant="caption" style={styles.assetIDText}>
                {allocation.assetId}
              </AppText>
            ),
        )}
      </View>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    transIDWrapper: {
      width: '70%',
    },
    amtWrapper: {
      width: '30%',
      alignItems: 'flex-end',
    },
    transIDText: {
      color: theme.colors.headingColor,
    },
    amountText: {
      color: theme.colors.headingColor,
    },
    assetIDText: {
      marginTop: hp(3),
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default UnspentUTXOElement;
