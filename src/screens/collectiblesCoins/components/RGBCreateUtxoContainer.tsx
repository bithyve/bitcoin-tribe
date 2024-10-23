import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import FooterNote from 'src/components/FooterNote';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight, wp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import dbManager from 'src/storage/realm/dbManager';
import { AverageTxFeesByNetwork } from 'src/services/wallets/interfaces';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

type utxoProps = {
  primaryOnPress: () => void;
};

function RGBCreateUtxoContainer(props: utxoProps) {
  const { primaryOnPress } = props;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, common } = translations;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode] = useMMKVString(Keys.CURRENCY_MODE);
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const [averageTxFeeJSON] = useMMKVString(Keys.AVERAGE_TX_FEE_BY_NETWORK);
  const wallet: Wallet = dbManager.getObjectByIndex(RealmSchema.Wallet);
  const averageTxFeeByNetwork: AverageTxFeesByNetwork =
    JSON.parse(averageTxFeeJSON);
  const averageTxFee = averageTxFeeByNetwork[wallet.networkType];
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.infoContainer}>
          <View style={styles.infoWrapper}>
            <View style={styles.labelWrapper}>
              <AppText style={styles.labelText}>
                {walletTranslation.numOfUtxo}
              </AppText>
            </View>
            <View style={styles.valueWrapper}>
              <AppText style={styles.labelText} numberOfLines={1}>
                05
              </AppText>
            </View>
          </View>
          <View style={styles.infoWrapper}>
            <View style={styles.labelWrapper}>
              <AppText style={styles.labelText}>
                {walletTranslation.amount}
              </AppText>
            </View>
            <View style={styles.valueWrapper}>
              {initialCurrencyMode !== CurrencyKind.SATS
                ? getCurrencyIcon(IconBitcoin, 'dark')
                : null}
              <AppText variant="body1" style={styles.valueText}>
                &nbsp;{getBalance(5000 + averageTxFee.high.averageTxFee)}
              </AppText>
              {initialCurrencyMode === CurrencyKind.SATS && (
                <AppText variant="caption" style={styles.satsText}>
                  sats
                </AppText>
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.footerWrapper}>
        <FooterNote
          title={common.note}
          subTitle={walletTranslation.rgbUtxoCreateNote}
          customStyle={styles.footerNoteWrapper}
        />
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={primaryOnPress}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: '85%',
    },
    contentWrapper: {
      height: windowHeight > 670 ? '58%' : '50%',
    },
    statusWrapper: {
      flexDirection: 'row',
      height: hp(60),
      width: '100%',
      padding: hp(15),
      borderRadius: 15,
      alignItems: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      justifyContent: 'space-between',
    },
    footerWrapper: {
      height: '25%',
      bottom: 10,
    },
    footerNoteWrapper: {
      backgroundColor: 'transparent',
      marginBottom: hp(20),
    },
    statusText: {
      color: theme.colors.headingColor,
    },
    statusValue: {
      color: theme.colors.greenText,
    },
    infoContainer: {
      marginTop: hp(20),
      padding: hp(15),
      borderRadius: 15,
      alignItems: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    infoWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(10),
    },
    labelWrapper: {
      width: '50%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '50%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(5),
      marginLeft: hp(5),
    },
  });
export default RGBCreateUtxoContainer;
