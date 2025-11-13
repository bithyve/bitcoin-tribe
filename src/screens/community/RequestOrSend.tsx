import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useRoute, RouteProp, useNavigation, CommonActions } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import {
  Asset,
  AssetSchema,
  AssetVisibility,
  Coin,
  Collectible,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import { formatNumber } from 'src/utils/numberWithCommas';
import { useTheme } from 'react-native-paper';
import TextField from 'src/components/TextField';
import SelectYourAsset from '../receiveasset/SelectYourAsset';
import RGBAssetList from '../receiveasset/RGBAssetList';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import KeyboardAvoidView from 'src/components/KeyboardAvoidView';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useWallets from 'src/hooks/useWallets';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import WalletOperations from 'src/services/wallets/operations';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RequestStatus, RequestType } from 'src/models/interfaces/Community';
import { v4 as uuidv4 } from 'uuid';

type RequestOrSendRouteParams = {
  type?: string;
  communityId?: string;
};

const getStyles = (theme: AppTheme, inputHeight: number, tooltipPos: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    assetsDropdownContainer: {
      left: 0,
      right: 0,
      top: Platform.OS === 'ios' ? (windowHeight > 670 ? '18%' : '15%') : '10%',
      borderRadius: 20,
      marginHorizontal: hp(15),
      position: 'absolute',
    },
    bodyWrapper: {
      flex: 1
    },
    input: {
      marginVertical: hp(5),
    },
    footerWrapper: {
      paddingBottom: hp(20),
      alignItems: 'flex-end',
    },
  });

const RequestOrSend = () => {
  const route = useRoute<RouteProp<{ params: RequestOrSendRouteParams }>>();
  const type = route.params?.type;
  const communityId = route.params?.communityId;
  const theme = useTheme() as unknown as AppTheme;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = useMemo(() => getStyles(theme, 100, 0), [theme, isThemeDark]);
  const [showList, setShowList] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState<string>('');
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const wallet = useQuery<Wallet>(RealmSchema.Wallet)[0]
  const navigation = useNavigation();
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];

  
  const coins = useQuery<Coin>(RealmSchema.Coin)
    .filtered('visibility != $0', AssetVisibility.HIDDEN);

  const collectibles = useQuery<Collectible>(RealmSchema.Collectible)
    .filtered('visibility != $0', AssetVisibility.HIDDEN);

  const udas = useQuery<UniqueDigitalAsset>(RealmSchema.UniqueDigitalAsset)
    .filtered('visibility != $0', AssetVisibility.HIDDEN);

  const assets = useMemo(() => {
    try {
      const coinAssets = coins
        .toJSON()
        .filter(coin => coin && coin.assetId) as unknown as Asset[];
      const collectibleAssets = collectibles
        .toJSON()
        .filter(
          collectible => collectible && collectible.assetId,
        ) as unknown as Asset[];

      const combined: Asset[] = [
        // ...coinAssets,
        // ...collectibleAssets,
      ];
      combined.push({
        assetId: 'BTC',
        balance: {
          spendable: wallet.specs.balances.confirmed.toString(),
          future: wallet.specs.balances.confirmed.toString(),
          settled: wallet.specs.balances.confirmed.toString(),
        },
        name: 'Bitcoin',
        ticker: '',
        iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1747033579',
        assetSchema: AssetSchema.Collectible,
        addedAt: Date.now(),
        issuedSupply: wallet.specs.balances.confirmed.toString(),
        precision: 8,
        timestamp: Date.now(),
        transactions: [],
        metaData: {
          assetSchema: AssetSchema.Collectible,
          issuedSupply: wallet.specs.balances.confirmed.toString(),
          name: 'Bitcoin',
          precision: 8,
          ticker: 'BTC',
          timestamp: Date.now(),
        },
        issuer: {
          verified: false,
          verifiedBy: [],
          isDomainVerified: false,
        },
        visibility: AssetVisibility.DEFAULT,
        isVerifyPosted: false,
        isIssuedPosted: false,
        assetSource: 'Internal' as any,
        details: {},
        media: {},
        token: {},
      })
      return combined
        .filter(
          asset =>
            asset &&
            asset.assetId &&
            asset.balance
        )
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
;
    } catch (error) {
      console.error('Error processing assets:', error);
      return [];
    }
  }, [coins, collectibles, udas]);

  const onPressProceed = () => {
    if (type === 'Request') {
      if(selectedAsset?.assetId === 'BTC') {
        const { receivingAddress } =
        WalletOperations.getNextFreeExternalAddress(wallet);
        const paymentURI = WalletUtilities.generatePaymentURI(receivingAddress, {
          amount: parseInt(amount) / 1e8,
        }).paymentURI;
        const payload = {
          id: uuidv4(),
          amount: amount,
          invoice: paymentURI,
          txid: '',
          type: RequestType.RequestSats,
          status: RequestStatus.Pending,
          createdBy: app.publicId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          notes: '',
        }
        navigation.navigate(NavigationRoutes.CHAT, {
          payload,
          communityId
        });
      } else {

      }
    }

  }


  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title={type} />

      <KeyboardAvoidView style={styles.bodyWrapper}>
        <SelectYourAsset
          selectedAsset={selectedAsset}
          onPress={() => {
            setShowList(!showList);
          }}
        />

        <TextField
          value={formatNumber(amount)}
          onChangeText={(text: string) => setAmount(text.replace(/[^0-9.]/g, ''))}
          placeholder={'Amount'}
          style={styles.input}
          keyboardType="numeric"
        />
      </KeyboardAvoidView>

      <View style={styles.footerWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={onPressProceed}
          disabled={amount === ''}
          width={windowWidth / 1.1
          }
          secondaryCTAWidth={windowWidth / 2.3}
        />
      </View>

      {showList && (
        <RGBAssetList
          style={styles.assetsDropdownContainer}
          assets={assets}
          callback={item => {
            Keyboard.dismiss();
            setSelectedAsset(item || item?.asset);
            setShowList(false);
            // setAssetId(item?.assetId || item?.asset?.assetId);
          }}
          // searchAssetInput={searchAssetInput}
          // onChangeSearchInput={(text: string) => {
          //   setSearchAssetInput(text);
          // }}
          selectedAsset={selectedAsset}
          onDissmiss={() => setShowList(false)}
          isLoading={false}
          showSearch={false}
        />
      )}
    </ScreenContainer>
  );
};

export default RequestOrSend;
