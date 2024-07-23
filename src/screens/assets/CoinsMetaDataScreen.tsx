import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { Coin } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import Colors from 'src/theme/Colors';
import moment from 'moment';

export const Item = ({ title, value }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.contentWrapper}>
      <AppText
        variant="body2"
        style={[styles.assetDetailsText, styles.assetDetailsText2]}>
        {title}
      </AppText>
      <AppText
        variant="body1"
        selectable
        style={[styles.assetDetailsText, styles.assetDetailsText2]}>
        {value}
      </AppText>
    </View>
  );
};

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);

  useEffect(() => {
    mutate({ assetId, schema: RealmSchema.Coin });
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title="Meta Data" enableBack={true} />
      {isLoading ? (
        <ActivityIndicator color={Colors.ChineseOrange} size="large" />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          <Item title="Name" value={coin && coin.name} />
          <Item
            title="Ticker"
            value={coin && coin.metaData && coin.metaData.ticker}
          />
          <Item title="Asset ID" value={assetId} />
          <Item
            title="Schema"
            value={
              coin && coin.metaData && coin.metaData.assetSchema.toUpperCase()
            }
          />
          <Item
            title="Iface"
            value={
              coin && coin.metaData && coin.metaData.assetIface.toUpperCase()
            }
          />
          <Item
            title="Issued Supply"
            value={coin && coin.metaData && coin.metaData.issuedSupply}
          />
          <Item
            title="Issued On"
            value={moment(
              coin && coin.metaData && coin.metaData.timestamp,
            ).format('DD MMM YY • hh:mm A')}
          />
          <Item
            title="Precision"
            value={coin && coin.metaData && coin.metaData.precision}
          />
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    assetContainer: {
      height: windowHeight > 650 ? '35%' : '30%',
      position: 'relative',
      marginBottom: hp(20),
      borderBottomColor: 'gray',
      borderBottomWidth: 0.8,
    },
    assetStyle: {
      height: '100%',
      width: '100%',
    },
    assetChipWrapper: {
      position: 'absolute',
      zIndex: 999,
      left: 30,
      top: 10,
    },
    downloadWrapper: {
      position: 'absolute',
      zIndex: 999,
      right: 25,
      bottom: 15,
    },
    assetDetailsText: {
      color: theme.colors.bodyColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(5),
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      // marginHorizontal: wp(20),
    },
  });

export default CoinsMetaDataScreen;
