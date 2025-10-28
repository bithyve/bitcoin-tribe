import { FlatList, Image, Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo } from 'react';
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
import {
  Collection,
  IssuerVerificationMethod,
  TransferKind,
} from 'src/models/interfaces/RGBWallet';
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
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import BackTranslucent from 'src/assets/images/backTranslucent.svg';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import DeepLinking from 'src/utils/DeepLinking';

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

  const isVerified = collection?.issuer?.verifiedBy.some(
    item => item.verified === true,
  );

  const mediaPath = useMemo(() => {
    if(collection?.token?.media?.filePath) {
      return Platform.select({
        android: `file://${collection?.token?.media?.filePath}`,
        ios: collection?.token?.media?.filePath,
      });
    } else if(collection?.attachments[0]?.filePath) {
      return collection?.attachments[0]?.filePath
    }
    return null;
  }, [collection?.token?.media?.filePath, collection?.token?.attachments[0]?.filePath]);

  const headerImage = useMemo(() => {
    if(collection?.token?.media?.filePath) {
      return Platform.select({
        android: `file://${collection?.token?.media?.filePath}`,
        ios: collection?.token?.media?.filePath,
      });
    } else if(collection?.media?.filePath) {
      return collection?.media?.filePath
    }
    return null;
  }, [collection?.token?.media?.filePath, collection?.media?.filePath]);

  const ListHeader = () => {
    return (
      <>
        <View style={styles.mintedCtr}>
          <AppText variant="muted">
            {`Issued: ${collection.items.length}${
              collection.itemsCount !== 0
                ? `/${collection.itemsCount.toString()}`
                : '/∞'
            }`}
          </AppText>
        </View>
        <Image
          source={{
            uri: headerImage,
          }}
          resizeMode="cover"
          style={styles.bannerImage}
        />
        <Image
          source={{
            uri: mediaPath,
          }}
          resizeMode="cover"
          style={styles.image}
        />
        <View style={styles.headerCtr}>
          <AppHeader backIcon={<BackTranslucent />} />
        </View>
        <View style={styles.contentCtr}>
          <View style={styles.nameCtr}>
            <View style={styles.nameCtrRow}>
              <AppText variant="body1Bold">{collection.name}</AppText>
              {isVerified && <IconVerified width={20} height={20} />}
            </View>
            <SizedBox height={hp(10)} />
            <AppText variant="caption">{collection.description.split(`${DeepLinking.scheme}://`)[0] || ''}</AppText>
          </View>
          <View />
          <SizedBox height={hp(20)} />
          <View style={styles.verifiedCtr}>
            <AppText style={isVerified ? { color: Colors.UFOGreen1 } : { color: theme.colors.mutedTab }} variant="heading3">
              {isVerified ? assets.verified : assets.unverified}
            </AppText>
            <SizedBox height={hp(4)} />
            <View style={styles.verifiedRow}>
              <AppText variant="caption" style={styles.verifiedLabel}>
                {`${assets.viaX}: `}
              </AppText>
              <AppText
                variant="caption"
                style={!isVerified && styles.orangeText}>
                {isVerified
                  ? collection?.issuer?.verifiedBy.find(
                      item => item.type === IssuerVerificationMethod.TWITTER,
                    )?.username
                  : assets.unverified}
              </AppText>
            </View>
            <SizedBox height={hp(2)} />
            <View style={styles.verifiedRow}>
              <AppText variant="caption" style={styles.verifiedLabel}>
                {`${assets.domain}: `}
              </AppText>
              <AppText
                variant="caption"
                style={!isVerified && styles.orangeText}>
                {isVerified
                  ? collection?.issuer?.verifiedBy.find(
                      item => item.type === IssuerVerificationMethod.DOMAIN,
                    )?.name
                  : assets.unverified}
              </AppText>
            </View>
          </View>
          <SizedBox height={hp(10)} />
          {/* <SelectOption
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
          /> */}
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
                  navigation.dispatch(CommonActions.navigate(NavigationRoutes.COLLECTIONUDASWIPER, {
                    index:index,
                    assets: collection.items                    
                  }))
                }
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
    nameCtrRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
export default CollectionDetailsScreen;
