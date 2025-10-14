import { FlatList, Image, StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import { SizedBox } from 'src/components/SizedBox';
import { CollectionStatsContainer } from 'src/components/CollectionStatsContainer';
import AssetCard from 'src/components/AssetCard';

const MOCK_BANNER = require('src/assets/images/mockBanner.png');
const MOCK_COLLECTION = require('src/assets/images/mockCollection.png');

const CollectionDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  // @ts-ignore
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, insets);

  const ListHeader = () => {
    return (
      <>
        <Image
          source={MOCK_BANNER}
          resizeMode="cover"
          style={styles.bannerImage}
        />
        <Image
          source={MOCK_COLLECTION}
          resizeMode="cover"
          style={styles.image}
        />
        <View style={styles.headerCtr}>
          <AppHeader />
        </View>
        <View style={styles.contentCtr}>
          <AppText variant="body1Bold">@artist_maya</AppText>
          <SizedBox height={hp(10)} />
          <AppText variant="caption">
            A curated series of digital artworks inspired by blockchain culture.
          </AppText>
          <View />
          <SizedBox height={hp(20)} />
          <CollectionStatsContainer
            items={'15'}
            minted={'7'}
            totalMinted={'15'}
            supply={'200'}
          />
        </View>
      </>
    );
  };

  return (
    <View style={styles.parentContainer}>
      <FlatList
        ListHeaderComponent={ListHeader}
        stickyHeaderHiddenOnScroll={true}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.udaCtr}
        data={ASSETS}
        keyExtractor={item => item.assetId}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.assetWrapper}>
              <AssetCard
                asset={item}
                tag={'COLLECTIBLE'}
                onPress={() => console.log(item)}
                precision={item.precision}
              />
            </View>
          );
        }}
      />
    </View>
  );
};
const getStyles = (theme: AppTheme, insets) =>
  StyleSheet.create({
    parentContainer: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
      paddingBottom: insets.bottom,
    },
    bannerImage: {
      paddingTop: 20,
      height: hp(280),
      width: '100%',
      borderWidth: 1,
      paddingHorizontal: hp(16),
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
    },
    image: {
      height: hp(80),
      width: hp(80),
      borderWidth: 1,
      borderRadius: 10,
      position: 'relative',
      top: -40,
      left: hp(16),
      borderColor: 'rgba(86, 86, 86, 1)', // border color
    },
    headerCtr: {
      position: 'absolute',
      top: insets.top,
      marginHorizontal: hp(16),
    },
    assetWrapper: {
      flexWrap: 'wrap',
    },
    contentCtr: { paddingHorizontal: wp(16), position: 'relative', top: -20 },
    udaCtr: {
      justifyContent: 'space-between',
      paddingHorizontal: wp(16),
    },
  });
export default CollectionDetailsScreen;

// ! To be removed
const ASSETS = [
  {
    addedAt: 1760344637,
    assetId: 'rgb:9AJH_o_B-CuB~XlJ-baYfg1a-eFaC_jp-bjK2WF0-J31wtfI',
    assetSchema: 'NIA',
    assetSource: 'Internal',
    balance: {
      future: '100',
      offchainInbound: null,
      offchainOutbound: null,
      settled: '100',
      spendable: '100',
    },
    campaign: {},
    disclaimer: {},
    iconUrl: null,
    isDefault: null,
    isIssuedPosted: false,
    isVerifyPosted: null,
    issuedSupply: '100',
    issuer: { isDomainVerified: true, verified: true },
    metaData: [Object],
    name: 'Coin 1',
    precision: 0,
    ticker: 'COIN1',
    timestamp: 1760344637,
    transactions: [],
    visibility: 'DEFAULT',
  },
  {
    addedAt: 1760344637,
    assetId: 'rgb:9AJH_o_B-aaB~XlJ-baYfg1a-eFaC_jp-bjK2WF0-J31wtfI',
    assetSchema: 'NIA',
    assetSource: 'Internal',
    balance: {
      future: '100',
      offchainInbound: null,
      offchainOutbound: null,
      settled: '100',
      spendable: '100',
    },
    campaign: {},
    disclaimer: {},
    iconUrl: null,
    isDefault: null,
    isIssuedPosted: false,
    isVerifyPosted: null,
    issuedSupply: '100',
    issuer: { isDomainVerified: true, verified: true },
    metaData: [Object],
    name: 'Coin 1',
    precision: 0,
    ticker: 'COIN1',
    timestamp: 1760344637,
    transactions: [],
    visibility: 'DEFAULT',
  },
  {
    addedAt: 1760344637,
    assetId: 'rgb:9AJH_o_B-vvB~XlJ-baYfg1a-eFaC_jp-bjK2WF0-J31wtfI',
    assetSchema: 'NIA',
    assetSource: 'Internal',
    balance: {
      future: '100',
      offchainInbound: null,
      offchainOutbound: null,
      settled: '100',
      spendable: '100',
    },
    campaign: {},
    disclaimer: {},
    iconUrl: null,
    isDefault: null,
    isIssuedPosted: false,
    isVerifyPosted: null,
    issuedSupply: '100',
    issuer: { isDomainVerified: true, verified: true },
    metaData: [Object],
    name: 'Coin 1',
    precision: 0,
    ticker: 'COIN1',
    timestamp: 1760344637,
    transactions: [],
    visibility: 'DEFAULT',
  },
  {
    addedAt: 1760344637,
    assetId: 'rgb:9AJH_o_B-dfB~XlJ-baYfg1a-eFaC_jp-bjK2WF0-J31wtfI',
    assetSchema: 'NIA',
    assetSource: 'Internal',
    balance: {
      future: '100',
      offchainInbound: null,
      offchainOutbound: null,
      settled: '100',
      spendable: '100',
    },
    campaign: {},
    disclaimer: {},
    iconUrl: null,
    isDefault: null,
    isIssuedPosted: false,
    isVerifyPosted: null,
    issuedSupply: '100',
    issuer: { isDomainVerified: true, verified: true },
    metaData: [Object],
    name: 'Coin 1',
    precision: 0,
    ticker: 'COIN1',
    timestamp: 1760344637,
    transactions: [],
    visibility: 'DEFAULT',
  },
  {
    addedAt: 1760344637,
    assetId: 'rgb:9AJH_o_B-CdB~XlJ-baYfg1a-eFaC_jp-bjK2WF0-J31wtfI',
    assetSchema: 'NIA',
    assetSource: 'Internal',
    balance: {
      future: '100',
      offchainInbound: null,
      offchainOutbound: null,
      settled: '100',
      spendable: '100',
    },
    campaign: {},
    disclaimer: {},
    iconUrl: null,
    isDefault: null,
    isIssuedPosted: false,
    isVerifyPosted: null,
    issuedSupply: '100',
    issuer: { isDomainVerified: true, verified: true },
    metaData: [Object],
    name: 'Coin 1',
    precision: 0,
    ticker: 'COIN1',
    timestamp: 1760344637,
    transactions: [],
    visibility: 'DEFAULT',
  },
  {
    addedAt: 1760355320,
    assetId: 'rgb:zqjXF0Vq-C3LIZK7-hkjT04k-npZL~zS-KpK_2BM-QbEXKtU',
    balance: {
      future: '1',
      settled: '1',
      spendable: '1',
      offchainOutbound: null,
      offchainInbound: null,
    },
    details: 'UDA secs ',
    issuedSupply: '1',
    name: 'UDA 1',
    precision: 0,
    ticker: 'UDA1',
    timestamp: 1760355320,
    token: {
      attachments: [
        {
          filePath:
            '/Users/vaibhav/Library/Developer/CoreSimulator/Devices/CDF30B0F-E5E9-428B-99BB-59774CC415FE/data/Containers/Data/Application/D5143049-7E62-4259-9404-7584E07C856C/Documents/.rgb/2a9696e5/media_files/86c0cb1625ebaa1068f1d04e25798ed31aa259a46e3a497eb13a2ecde6c3d33b.png',
          mime: 'image/png',
          base64Image: null,
        },
        {
          filePath:
            '/Users/vaibhav/Library/Developer/CoreSimulator/Devices/CDF30B0F-E5E9-428B-99BB-59774CC415FE/data/Containers/Data/Application/D5143049-7E62-4259-9404-7584E07C856C/Documents/.rgb/2a9696e5/media_files/03dae272f0cd3ca6524098f87df376887b433278ccfc6b608e74c181091309be.jpeg',
          mime: 'image/jpeg',
          base64Image: null,
        },
      ],
      embeddedMedia: false,
      index: 0,
      media: {
        filePath:
          '/Users/vaibhav/Library/Developer/CoreSimulator/Devices/CDF30B0F-E5E9-428B-99BB-59774CC415FE/data/Containers/Data/Application/D5143049-7E62-4259-9404-7584E07C856C/Documents/.rgb/2a9696e5/media_files/efb210ff2a8e0acb41ee0405106dffe583f33496601841213450ab8b95d4a6b0.jpeg',
        mime: 'image/jpeg',
        base64Image: null,
      },
      reserves: false,
    },
    transactions: [
      {
        batchTransferIdx: 2,
        createdAt: 1760355320,
        idx: 2,
        kind: 'issuance',
        status: 'settled',
        transportEndpoints: [],
        updatedAt: 1760355320,
        txid: null,
        recipientId: null,
        expiration: null,
        requestedAssignment: null,
        assignments: [{ amount: null, type: 'NonFungible' }],
        receiveUtxo: null,
        changeUtxo: null,
        invoiceString: null,
        transaction: null,
      },
    ],
    metaData: null,
    issuer: { verified: false, isDomainVerified: false, verifiedBy: [] },
    visibility: 'DEFAULT',
    isVerifyPosted: null,
    isIssuedPosted: false,
    assetSchema: 'UDA',
    assetSource: 'Internal',
  },
];
