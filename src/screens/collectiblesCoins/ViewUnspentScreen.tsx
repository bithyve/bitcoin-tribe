import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useMutation, UseMutationResult } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RgbUnspent } from 'src/models/interfaces/RGBWallet';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { useTheme } from 'react-native-paper';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    titleStyle: {
      color: theme.colors.headingColor,
    },
    containerItem: {
      marginTop: hp(10),
    },
  });

const ViewUnspentScreen = () => {
  const { mutate, data, isLoading }: UseMutationResult<RgbUnspent[]> =
    useMutation(ApiHandler.viewUtxos);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    console.log('data', JSON.stringify(data));
  }, [data]);

  return (
    <ScreenContainer>
      <AppHeader title={'Unspent'} subTitle={''} enableBack={true} />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ height: '60%' }}
          color={Colors.ChineseOrange}
        />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.containerItem}>
              <View style={{ flexDirection: 'row' }}>
                <AppText
                  selectable
                  style={styles.titleStyle}
                  numberOfLines={1}
                  variant="subTitle">
                  {`${item.utxo.outpoint.txid}:${item.utxo.outpoint.vout}`}
                </AppText>
                <AppText
                  selectable
                  style={styles.titleStyle}
                  variant="subTitle">
                  {`${item.utxo.btcAmount} sats`}
                </AppText>
              </View>
              {item.rgbAllocations[0]?.assetId &&
                item.rgbAllocations.map(allocation => (
                  <View
                    style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <AppText style={styles.titleStyle} variant="body2">
                      {allocation.assetId}
                    </AppText>
                    <AppText
                      style={styles.titleStyle}
                      variant="body2">{`${allocation.amount}`}</AppText>
                  </View>
                ))}
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
};

export default ViewUnspentScreen;
