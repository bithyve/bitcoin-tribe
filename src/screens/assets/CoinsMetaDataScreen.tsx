import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import {
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import {
  Coin,
  TransferKind,
  AssetVisibility,
} from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import moment from 'moment';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ModalLoading from 'src/components/ModalLoading';
import GradientView from 'src/components/GradientView';
import AssetIDContainer from './components/AssetIDContainer';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import HideAssetView from './components/HideAssetView';
import dbManager from 'src/storage/realm/dbManager';
import VerifyIssuer from './components/VerifyIssuer';
import IssuerVerified from './components/IssuerVerified';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import { AppContext } from 'src/contexts/AppContext';

export const Item = ({ title, value, width = '100%' }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, width), [theme, width]);
  return (
    <View style={styles.contentWrapper}>
      <AppText variant="body2" style={styles.labelText}>
        {title}
      </AppText>
      <GradientView
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}
        style={styles.assetNameWrapper}>
        <AppText variant="body2" style={styles.valueText}>
          {value}
        </AppText>
      </GradientView>
    </View>
  );
};

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const popAction = StackActions.pop(2);

  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { hasCompleteVerification, setCompleteVerification } =
    React.useContext(AppContext);
  const { assets, home } = translations;
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);

  useEffect(() => {
    if (!coin.metaData) {
      mutate({ assetId, schema: RealmSchema.Coin });
    }
  }, []);

  useEffect(() => {
    if (coin?.issuer?.verified && hasCompleteVerification) {
      setTimeout(() => {
        setVisiblePostOnTwitter(true);
      }, 500);
    }
  }, [coin?.issuer?.verified, hasCompleteVerification]);

  const hideAsset = () => {
    dbManager.updateObjectByPrimaryId(RealmSchema.Coin, 'assetId', assetId, {
      visibility: AssetVisibility.HIDDEN,
    });
    navigation.dispatch(popAction);
  };

  const showVerifyIssuer = useMemo(() => {
    return (
      !coin?.issuer?.verified &&
      coin.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [coin.transactions, coin.issuer]);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title={assets.coinMetaTitle} subTitle={''} enableBack={true} />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          {coin.issuer && coin.issuer.verified && (
            <IssuerVerified
              id={coin.issuer.verifiedBy[0].id}
              name={coin.issuer.verifiedBy[0].name}
              username={coin.issuer.verifiedBy[0].username}
            />
          )}
          <View style={styles.rowWrapper}>
            <Item title={home.assetName} value={coin.name} width={'45%'} />
            <Item
              title={home.assetTicker}
              value={coin.metaData && coin.metaData.ticker}
              width={'45%'}
            />
          </View>
          <AssetIDContainer assetId={assetId} />
          <View style={styles.rowWrapper}>
            <Item
              title={assets.schema}
              value={coin.metaData && coin.metaData.assetSchema.toUpperCase()}
              width={'45%'}
            />
            <Item
              title={assets.iFace}
              value={coin.metaData && coin.metaData.assetIface.toUpperCase()}
              width={'45%'}
            />
          </View>
          <View style={styles.rowWrapper}>
            <Item
              title={assets.issuedSupply}
              value={
                coin.metaData && numberWithCommas(coin.metaData.issuedSupply)
              }
              width={'45%'}
            />
            <Item
              title={assets.precision}
              value={coin.metaData && coin.metaData.precision}
              width={'45%'}
            />
          </View>
          <Item
            title={assets.issuedOn}
            value={moment
              .unix(coin.metaData && coin.metaData.timestamp)
              .format('DD MMM YY  hh:mm A')}
          />

          {showVerifyIssuer && (
            <VerifyIssuer assetId={assetId} schema={RealmSchema.Coin} />
          )}
          <HideAssetView
            title={assets.hideAsset}
            onPress={() => hideAsset()}
            isVerified={coin?.issuer?.verified}
            assetId={assetId}
          />
          <>
            <PostOnTwitterModal
              visible={visiblePostOnTwitter}
              secondaryOnPress={() => {
                setVisiblePostOnTwitter(false);
                setCompleteVerification(false);
              }}
              issuerInfo={coin}
            />
          </>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    assetNameWrapper: {
      justifyContent: 'center',
      paddingLeft: 10,
      minHeight: hp(50),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
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
      marginVertical: hp(10),
      width: width,
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      borderRadius: 20,
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    rowWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
  });

export default CoinsMetaDataScreen;
