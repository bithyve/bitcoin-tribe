import { FlatList, Image, Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import { SizedBox } from 'src/components/SizedBox';
import AssetCard from 'src/components/AssetCard';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { Collection, TransferKind } from 'src/models/interfaces/RGBWallet';
import AddNewAssetLight from 'src/assets/images/AddNewAsset_Light.svg';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import AppTouchable from 'src/components/AppTouchable';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import { useTheme } from 'react-native-paper';
import Colors from 'src/theme/Colors';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const CollectionDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  // @ts-ignore
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, insets);
  const { assets } = useContext(LocalizationContext).translations;
  const { collectionId } = useRoute().params;
  const collection = useQuery<Collection>(RealmSchema.Collection, collection =>
    collection.filtered(`_id == $0`, collectionId),
  )[0] as Collection;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);

  const hasIssuanceTransaction = collection?.transactions.some(
    transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      mutate({
        assetId: collection.assetId,
        schema: RealmSchema.Collection,
        isCollection: true,
        collectionId: collection._id,
      });
    });
    return unsubscribe;
  }, [navigation, collection.assetId, collection._id]);

  const isVerified = false; // ! for mocking

  const ListHeader = () => {
    return (
      <>
        <View style={styles.mintedCtr}>
          <AppText variant="muted">
            {`Minted: ${collection.items.length}${
              collection.isFixedSupply ? `/${collection.itemsCount}` : ''
            }`}
          </AppText>
        </View>
        <Image
          source={{
            uri: Platform.select({
              android: `file://${collection.token?.media?.filePath}`,
              ios: `${collection.token?.media?.filePath}`,
            }),
          }}
          resizeMode="cover"
          style={styles.bannerImage}
        />
        <Image
          source={{
            uri: Platform.select({
              android: `file://${collection.token?.attachments[0]?.filePath}`,
              ios: `${collection.token?.attachments[0]?.filePath}`,
            }),
          }}
          resizeMode="cover"
          style={styles.image}
        />
        <View style={styles.headerCtr}>
          <AppHeader />
        </View>
        <View style={styles.contentCtr}>
          <View style={styles.nameCtr}>
            <AppText variant="body1Bold">{collection.name}</AppText>
            <SizedBox height={hp(10)} />
            <AppText variant="caption">{collection.description || ''}</AppText>
          </View>
          <View />
          <SizedBox height={hp(20)} />
          <View style={styles.verifiedCtr}>
            <AppText style={{ color: Colors.UFOGreen1 }} variant="heading3">
              {assets.verified}
            </AppText>
            <SizedBox height={hp(4)} />
            <View style={styles.verifiedRow}>
              <AppText variant="caption" style={styles.verifiedLabel}>
                {assets.viaX}
              </AppText>
              <AppText
                variant="caption"
                style={!isVerified && styles.orangeText}>
                {isVerified ? '@bitcointribe_' : assets.unverified}
              </AppText>
            </View>
            <SizedBox height={hp(2)} />
            <View style={styles.verifiedRow}>
              <AppText variant="caption" style={styles.verifiedLabel}>
                {assets.domain}
              </AppText>
              <AppText
                variant="caption"
                style={!isVerified && styles.orangeText}>
                {isVerified ? 'www.bitcointribe.app' : assets.unverified}
              </AppText>
            </View>
          </View>
          <SizedBox height={hp(10)} />
          <SelectOption
            title={'Verification'}
            subTitle={''}
            onPress={() =>
              navigation.dispatch(
                CommonActions.navigate(
                  NavigationRoutes.COLLECTIONVERIFICATIONSCREEN,
                ),
              )
            }
            testID={'collection_verification'}
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
        data={collection.items}
        keyExtractor={item => item.assetId}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.assetWrapper}>
              <AssetCard
                asset={item}
                tag={'COLLECTIBLE'}
                onPress={() =>
                  navigation.navigate(NavigationRoutes.UDADETAILS, {
                    assetId: item.assetId,
                  })
                }
                precision={item.precision}
              />
            </View>
          );
        }}
      />

      {hasIssuanceTransaction && (
        <AppTouchable
          style={
            isThemeDark
              ? styles.addNewIconWrapper
              : styles.addNewIconWrapperLight
          }
          onPress={() => {
            navigation.navigate(NavigationRoutes.ADDCOLLECTIONITEM, {
              collectionId: collection._id,
            });
          }}>
          {isThemeDark ? <AddNewAsset /> : <AddNewAssetLight />}
        </AppTouchable>
      )}
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
      borderWidth: 2,
      borderRadius: 10,
      position: 'relative',
      top: -40,
      left: hp(16),
      borderColor: theme.dark ? Colors.Black : Colors.White,
    },
    headerCtr: {
      position: 'absolute',
      top: insets.top,
      marginHorizontal: hp(16),
    },
    assetWrapper: {
      flexWrap: 'wrap',
    },
    contentCtr: {
      paddingHorizontal: wp(16),
      position: 'relative',
      top: -20,
      justifyContent: 'space-between',
    },
    nameCtr: {
      flex: 1,
    },
    udaCtr: {
      justifyContent: 'space-between',
      paddingHorizontal: wp(16),
    },
    mintedCtr: {
      borderWidth: 1,
      borderColor: theme.dark ? Colors.mediumGray : Colors.ChineseWhite,
      paddingHorizontal: wp(10),
      paddingVertical: hp(5),
      borderRadius: 20,
      backgroundColor: theme.colors.roundedCtaBg,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      right: wp(16),
      top: hp(290),
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: Platform.select({
        ios: hp(60),
        android: hp(90),
      }),
      right: wp(20),
    },
    addNewIconWrapperLight: {
      position: 'absolute',
      bottom: Platform.select({
        ios: hp(25),
        android: hp(60),
      }),
      right: 0,
    },
    verifiedCtr: {
      borderWidth: 1,
      borderColor: Colors.UFOGreen1,
      borderRadius: 12,
      padding: wp(14),
    },
    verifiedRow: { flexDirection: 'row' },
    verifiedLabel: { color: theme.colors.mutedTab },
    orangeText: {
      color: Colors.AmberBlaze,
    },
  });
export default CollectionDetailsScreen;
