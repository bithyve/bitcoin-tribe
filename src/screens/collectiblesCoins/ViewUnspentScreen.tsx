import React, { useContext, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useMutation, UseMutationResult } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RgbUnspent } from 'src/models/interfaces/RGBWallet';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import AppTouchable from 'src/components/AppTouchable';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    titleStyle: {
      color: theme.colors.headingColor,
    },
    unspentListContainer: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(10),
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      paddingBottom: hp(10),
    },
    transIDWrapper: {
      width: '46%',
    },
    amountWrapper: {
      width: '27%',
      alignItems: 'center',
    },
    assetsWrapper: {
      width: '27%',
    },
    headerText: {
      // marginBottom: hp(2),
      color: theme.colors.secondaryHeadingColor,
    },
  });
const UnspentHeaderView = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <View style={styles.unspentListContainer}>
      <View style={styles.transIDWrapper}>
        <AppText variant="caption" style={styles.headerText}>
          {wallet.transactionID}
        </AppText>
      </View>
      <View style={styles.amountWrapper}>
        <AppText variant="caption" style={styles.headerText}>
          {wallet.satsAmount}
        </AppText>
      </View>
      <View style={styles.assetsWrapper}>
        <AppText variant="caption" style={styles.headerText}>
          {wallet.rgbAssetID}
        </AppText>
      </View>
    </View>
  );
};
const ViewUnspentScreen = () => {
  const { mutate, data, isLoading }: UseMutationResult<RgbUnspent[]> =
    useMutation(ApiHandler.viewUtxos);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    console.log('data', JSON.stringify(data));
  }, [data]);

  const redirectToBlockExplorer = txid => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${txid}`,
    );
  };

  return (
    <ScreenContainer>
      <AppHeader title={wallet.unspentTitle} subTitle={''} enableBack={true} />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ height: '60%' }}
          color={Colors.ChineseOrange}
        />
      ) : (
        <FlatList
          data={data}
          ListHeaderComponent={<UnspentHeaderView />}
          renderItem={({ item }) => (
            <View style={styles.unspentListContainer}>
              <AppTouchable
                style={styles.transIDWrapper}
                onPress={() =>
                  redirectToBlockExplorer(item.utxo.outpoint.txid)
                }>
                <AppText
                  selectable
                  style={styles.titleStyle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  variant="subTitle">
                  {`${item.utxo.outpoint.txid}:${item.utxo.outpoint.vout}`}
                </AppText>
              </AppTouchable>
              <View style={styles.amountWrapper}>
                <AppText
                  selectable
                  style={styles.titleStyle}
                  variant="subTitle">
                  {`${item.utxo.btcAmount}`}
                </AppText>
              </View>
              <View style={styles.assetsWrapper}>
                {item.rgbAllocations[0]?.assetId &&
                  item.rgbAllocations.map(allocation => (
                    <View>
                      <AppText
                        style={styles.titleStyle}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        variant="body2">
                        {allocation.assetId}
                      </AppText>
                      {/* <AppText
                        style={styles.titleStyle}
                        variant="body2">{`${allocation.amount}`}</AppText> */}
                    </View>
                  ))}
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
};

export default ViewUnspentScreen;
