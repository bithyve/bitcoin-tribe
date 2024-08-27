import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
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
import { LocalizationContext } from 'src/contexts/LocalizationContext';

export const Item = ({ title, value }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.contentWrapper}>
      <AppText
        variant="body1"
        style={[styles.assetDetailsText, styles.assetDetailsText2]}>
        {title}
      </AppText>
      <AppText
        variant="body1"
        selectable
        style={[styles.assetValueText, styles.assetDetailsText2]}>
        {value}
      </AppText>
    </View>
  );
};

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);

  useEffect(() => {
    mutate({ assetId, schema: RealmSchema.Coin });
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        subTitle={assets.coinMetaSubTitle}
        enableBack={true}
      />
      {isLoading ? (
        <ActivityIndicator color={Colors.ChineseOrange} size="large" />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          <Item title={assets.name} value={coin.name} />
          <Item
            title={assets.ticker}
            value={coin.metaData && coin.metaData.ticker}
          />
          <Item title={assets.assetId} value={assetId} />
          <Item
            title={assets.schema}
            value={coin.metaData && coin.metaData.assetSchema.toUpperCase()}
          />
          <Item
            title={assets.iFace}
            value={coin.metaData && coin.metaData.assetIface.toUpperCase()}
          />
          <Item
            title={assets.issuedSupply}
            value={coin.metaData && coin.metaData.issuedSupply}
          />
          <Item
            title={assets.issuedOn}
            value={moment
              .unix(coin.metaData && coin.metaData.timestamp)
              .format('DD MMM YY • hh:mm a')}
          />
          <Item
            title={assets.precision}
            value={coin.metaData && coin.metaData.precision}
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
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetValueText: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(8),
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      marginTop: wp(20),
    },
  });

export default CoinsMetaDataScreen;
