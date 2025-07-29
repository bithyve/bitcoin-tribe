import * as React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import IconArrowDown from 'src/assets/images/icon_arrowUp.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowUp_light.svg';
import { Asset, AssetFace, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
import TextField from 'src/components/TextField';
import IconSearch from 'src/assets/images/icon_search.svg';
import IconSearchLight from 'src/assets/images/icon_search_light.svg';

type DropdownProps = {
  style;
  assets: Asset[];
  callback: (item) => void;
  onDissmiss?: () => void;
  selectedAsset: Asset[];
  searchAssetInput?: string;
  onChangeSearchInput?: (text: string) => void;
  isLoading?: boolean;
  showSearch?: boolean;
};

const EmptyAssetState = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.emptyAssetStateContainer}>
      <AppText variant="body1" style={styles.titleStyle}>
        No Assets Found!
      </AppText>
    </View>
  );
};

function RGBAssetList(props: DropdownProps) {
  const {
    style,
    assets,
    callback,
    onDissmiss,
    selectedAsset,
    searchAssetInput,
    onChangeSearchInput,
    isLoading,
    showSearch = true,
  } = props;
  const theme: AppTheme = useTheme();
  const { translations } = React.useContext(LocalizationContext);
  const { channel } = translations;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={[style, styles.container]}>
      <AppTouchable onPress={onDissmiss}>
        <GradientView
          style={styles.inputWrapper}
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}>
          <View style={styles.inputWrapper2}>
            <AppText variant="body1" style={styles.titleStyle}>
              {channel.selectAsset}
            </AppText>
          </View>
          <View style={styles.iconArrowWrapper}>
            {isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}
          </View>
        </GradientView>
      </AppTouchable>
      <View style={styles.container2}>
        {showSearch && (
          <TextField
          value={searchAssetInput}
          onChangeText={onChangeSearchInput}
          placeholder={'Search from Tribe RGB registry'}
          style={styles.input}
          inputStyle={styles.inputStyle}
          rightIcon={
            isLoading ? (
              <ActivityIndicator size="small" />
            ) : isThemeDark ? (
              <IconSearch />
            ) : (
              <IconSearchLight />
            )
          }
          onRightTextPress={() => () => {}}
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.accent1}
          blurOnSubmit={false}
          returnKeyType="done"
          error={''}
          keyboardType="default"
          autoCapitalize="none"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        )}
        {assets && assets.length > 0 && (
          <View style={styles.labelWrapper}>
            <View>
              <AppText variant="caption" style={style.labelTextStyle}>
                Asset Name
              </AppText>
            </View>
            <View>
              <AppText variant="caption" style={style.labelTextStyle}>
                Available Balance
              </AppText>
            </View>
          </View>
        )}
        <FlatList
          data={assets}
          style={styles.assetListContainer}
          renderItem={({ item }) => {
            const filePath = item?.media?.filePath || item?.asset?.media?.file;
            const showImage =
              item?.assetSchema?.toUpperCase() === AssetSchema.Collectible ||
              item?.asset?.assetSchema?.toUpperCase() ===
                AssetSchema.Collectible ||
              item?.asset?.iconUrl ||
              item?.iconUrl;

            const imageUri = item?.iconUrl
              ? item?.iconUrl
              : item?.asset?.iconUrl
              ? item?.asset?.iconUrl
              : filePath?.startsWith('http')
              ? filePath
              : Platform.select({
                  android: `file://${filePath}`,
                  ios: filePath,
                });
            const assetName = item?.name ?? item?.asset?.name;
            const ticker = item?.ticker ?? item?.asset?.ticker;
            const assetId = item?.assetId ?? item?.asset?.assetId;
            return (
              <AppTouchable
                onPress={() => {
                  Keyboard.dismiss();
                  callback(item || item?.asset);
                }}
                style={styles.assetContainer}>
                <View style={styles.assetWrapper}>
                  <View style={styles.assetImageWrapper}>
                    {showImage ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.imageStyle}
                      />
                    ) : (
                      <AssetIcon
                        assetTicker={item?.ticker || item?.asset?.ticker}
                        assetID={item?.assetId || item?.asset?.assetId}
                        size={windowHeight > 670 ? 40 : 25}
                        verified={item?.issuer?.verified}
                      />
                    )}
                  </View>
                  <View style={styles.assetDetailsWrapper}>
                    {(assetName || ticker) && (
                      <AppText variant="body1" style={styles.assetnameText}>
                        {assetName
                          ? ticker
                            ? `${assetName} (${ticker})`
                            : assetName
                          : ticker}
                      </AppText>
                    )}
                    {assetId && (
                      <AppText variant="caption" style={styles.assetIdText}>
                        {assetId}
                      </AppText>
                    )}
                  </View>
                </View>

                <View style={styles.balanceWrapper}>
                  <AppText variant="body2" style={styles.balanceText}>
                    {formatLargeNumber(
                      item?.balance?.spendable / 10 ** item?.precision ||
                        item?.asset?.issuedSupply / 10 ** item?.asset?.precision,
                    )}
                  </AppText>
                </View>
              </AppTouchable>
            );
          }}
          ListEmptyComponent={<EmptyAssetState />}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 999,
      height: '70%',
      backgroundColor: theme.colors.primaryBackground,
      marginTop: Platform.OS === 'android' ? hp(20) : 0,
    },
    container2: {
      borderRadius: hp(20),
      marginTop: hp(20),
      backgroundColor: theme.colors.assetListBackColor,
      paddingTop: hp(10),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      padding: hp(15),
      borderRadius: 10,
      marginTop: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    inputWrapper2: {
      width: '90%',
      justifyContent: 'center',
    },
    seacrhInputWrapper: {
      height: hp(60),
      alignItems: 'center',
      flexDirection: 'row',
      marginHorizontal: hp(10),
      borderRadius: hp(16),
      backgroundColor: theme.colors.inputBackground,
      marginVertical: hp(10),
    },
    titleStyle: {
      color: theme.colors.headingColor,
    },
    iconArrowWrapper: {
      width: '10%',
    },
    imageStyle: {
      width: 40,
      height: 40,
      borderRadius: 40,
    },
    identiconView: {
      height: windowHeight > 670 ? 50 : 30,
      width: windowHeight > 670 ? 50 : 30,
      borderRadius: windowHeight > 670 ? 50 : 30,
    },
    assetContainer: {
      flexDirection: 'row',
      padding: hp(10),
      margin: hp(10),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
    },
    assetWrapper: {
      flexDirection: 'row',
      width: '74%',
    },
    assetImageWrapper: {
      width: '20%',
    },
    assetDetailsWrapper: {
      width: '92%',
    },
    balanceWrapper: {
      width: '26%',
    },
    assetnameText: {
      color: theme.colors.headingColor,
    },
    assetIdText: {
      color: theme.colors.secondaryHeadingColor,
    },
    balanceText: {
      color: theme.colors.headingColor,
      textAlign: 'right',
    },
    input: {
      margin: hp(12),
      width: 'auto',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    inputStyle: {
      height: hp(60),
      width: '80%',
    },
    rightCTAStyle: {
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
    labelWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: hp(15),
      marginTop: hp(5),
    },
    labelTextStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetListContainer: {
      marginTop: hp(5),
      marginBottom: hp(10),
    },
    emptyAssetStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(20),
    },
  });
export default RGBAssetList;
