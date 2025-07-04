import React, { useContext } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useNavigation } from '@react-navigation/native';

import EmptyStateView from 'src/components/EmptyStateView';
import NoAssetsIllustration from 'src/assets/images/noAssets.svg';
import NoAssetsIllustrationLight from 'src/assets/images/noAssets_light.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Asset, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { hp } from 'src/constants/responsive';
import GradientView from 'src/components/GradientView';
import AppTouchable from 'src/components/AppTouchable';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import AssetChip from 'src/components/AssetChip';
import Capitalize from 'src/utils/capitalizeUtils';
import { Keys } from 'src/storage';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import Colors from 'src/theme/Colors';
import AssetIcon from 'src/components/AssetIcon';

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
  verified?: boolean;
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
  verified,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
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
            <AssetIcon
              assetTicker={details}
              assetID={assetId}
              size={50}
              verified={verified}
            />
          </View>
        )}
        <View style={styles.assetDetailsWrapper}>
          <AppText variant="body2" style={styles.nameText}>
            {name}
          </AppText>
          <AppText variant="body2" numberOfLines={1} style={styles.detailsText}>
            {details}
          </AppText>
        </View>
        <View style={styles.tagWrapper}>
          <AssetChip
            tagText={Capitalize(tag)}
            backColor={
              tag === 'COIN'
                ? isThemeDark
                  ? theme.colors.accent5
                  : theme.colors.accent1
                : theme.colors.accent4
            }
            tagColor={
              tag === 'COIN'
                ? isThemeDark
                  ? theme.colors.tagText
                  : Colors.White
                : theme.colors.tagText
            }
          />
        </View>
        <View style={styles.amountWrapper}>
          <AppText variant="smallCTA" style={styles.amountText}>
            {numberWithCommas(amount)}
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
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
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
            IllustartionImage={
              isThemeDark ? (
                <NoAssetsIllustration />
              ) : (
                <NoAssetsIllustrationLight />
              )
            }
          />
        }
        renderItem={({ item, index }) => (
          <View>
            {item.assetSchema.toUpperCase() === AssetSchema.Coin ? (
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
                verified={item?.issuer?.verified}
              />
            ) : (
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
                  android: `file://${
                    item.media?.filePath || item.token.media.filePath
                  }`,
                  ios: item.media?.filePath || item.token.media.filePath,
                })}
                verified={item?.issuer?.verified}
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
      color: theme.colors.headingColor,
    },
    detailsText: {
      color: theme.colors.secondaryHeadingColor,
    },
    identiconWrapper: {
      width: '15%',
      height: '100%',
      justifyContent: 'center',
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
