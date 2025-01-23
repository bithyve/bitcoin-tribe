import React, { useContext, useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import EmptyStateView from 'src/components/EmptyStateView';
import NoAssetsIllustration from 'src/assets/images/noAssets.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { hp } from 'src/constants/responsive';
import GradientView from 'src/components/GradientView';
import AppTouchable from 'src/components/AppTouchable';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import AssetChip from 'src/components/AssetChip';
import Capitalize from 'src/utils/capitalizeUtils';
import Identicon from 'src/components/Identicon';

type selectAssetsProps = {
  assetsData: Asset[];
  wallet?: Wallet;
  rgbInvoice?: string;
  amount?: number;
};

type ItemProps = {
  name: string;
  details?: string;
  image?: string;
  tag?: string;
  onPressAddNew?: () => void;
  onPressAsset?: (item: any) => void;
  index?: number;
  ticker?: string;
  assetId?: string;
  amount?: string;
};

const Item = ({
  name,
  image,
  details,
  tag,
  onPressAsset,
  index,
  ticker,
  assetId,
  amount,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable onPress={onPressAsset}>
      <GradientView
        style={styles.assetItemWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        {image ? (
          <View style={styles.identiconWrapper}>
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageStyle}
            />
          </View>
        ) : (
          <View style={styles.identiconWrapper}>
            {/* <View style={styles.identiconWrapper2}> */}
            <Identicon value={assetId} style={styles.identiconView} size={50} />
            {/* </View> */}
          </View>
        )}
        <View style={styles.assetDetailsWrapper}>
          <AppText
            variant="body2"
            style={{
              color:
                tag === 'COIN' ? theme.colors.accent2 : theme.colors.accent1,
            }}>
            {name}
          </AppText>
          <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
            {details}
          </AppText>
        </View>
        <View style={styles.tagWrapper}>
          <AssetChip
            tagText={Capitalize(tag)}
            backColor={
              tag === 'COIN' ? theme.colors.accent5 : theme.colors.accent4
            }
            tagColor={theme.colors.tagText}
          />
        </View>
        <View style={styles.amountWrapper}>
          <AppText variant="smallCTA" style={styles.amountText}>
            {amount}
          </AppText>
        </View>
      </GradientView>
    </AppTouchable>
  );
};

function SelectAssetToSendContainer(props: selectAssetsProps) {
  const { assetsData, wallet, rgbInvoice, amount } = props;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { assets, home } = translations;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={assetsData}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            tintColor={theme.colors.accent1}
          />
        }
        ListEmptyComponent={
          <EmptyStateView
            title={home.noAssetTitle}
            subTitle={home.noAssetSubTitle}
            IllustartionImage={<NoAssetsIllustration />}
          />
        }
        renderItem={({ item, index }) => (
          <View>
            {item.assetIface.toUpperCase() === AssetFace.RGB20 && (
              <Item
                key={index}
                name={item.name}
                details={item.ticker}
                amount={item.balance.spendable}
                tag="COIN"
                assetId={item.assetId}
                onPressAsset={() =>
                  navigation.replace(NavigationRoutes.SENDASSET, {
                    wallet: wallet,
                    rgbInvoice: rgbInvoice,
                    assetId: item.assetId,
                    amount: amount,
                  })
                }
                index={index}
                ticker={item.ticker}
              />
            )}
            {item.assetIface.toUpperCase() === AssetFace.RGB25 && (
              <Item
                key={index}
                name={item.name}
                details={item.details}
                amount={item.balance.spendable}
                tag="COLLECTIBLE"
                onPressAsset={() =>
                  navigation.replace(NavigationRoutes.SENDASSET, {
                    wallet: wallet,
                    rgbInvoice: rgbInvoice,
                    assetId: item.assetId,
                    amount: amount,
                  })
                }
                index={index}
                ticker={item.ticker}
                image={Platform.select({
                  android: `file://${item.media?.filePath}`,
                  ios: item.media?.filePath,
                })}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    assetItemWrapper: {
      flexDirection: 'row',
      width: '100%',
      padding: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      alignItems: 'center',
      borderRadius: 15,
      height: hp(80),
      marginVertical: hp(5),
    },
    imageStyle: {
      height: hp(50),
      width: hp(50),
      borderRadius: 10,
    },
    amountText: {
      color: theme.colors.headingColor,
    },
    nameText: {
      color: theme.colors.secondaryHeadingColor,
    },
    identiconWrapper: {
      width: '15%',
      height: '100%',
      justifyContent: 'center',
    },
    identiconView: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    assetDetailsWrapper: {
      width: '37%',
      paddingLeft: hp(20),
    },
    amountWrapper: {
      width: '20%',
      alignItems: 'flex-end',
    },
    tagWrapper: {
      width: '28%',
      // justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
  });
export default SelectAssetToSendContainer;
