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
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { Keys } from 'src/storage';
import { Asset, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
import TextField from 'src/components/TextField';
import IconSearch from 'src/assets/images/icon_search.svg';
import IconSearchLight from 'src/assets/images/icon_search_light.svg';

type DropdownProps = {
  style?;
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
    assets,
    callback,
    onDissmiss,
    searchAssetInput,
    onChangeSearchInput,
    isLoading,
    showSearch = true,
  } = props;
  const theme: AppTheme = useTheme();
  const { translations } = React.useContext(LocalizationContext);
  const { channel, assets: assetsTranslations, sendScreen } = translations;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const insets = useSafeAreaInsets();
  return (
    <Modal
      isVisible={true}
      onBackdropPress={onDissmiss}
      onSwipeComplete={onDissmiss}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.65}
      useNativeDriver
      avoidKeyboard
    >
      <View style={[styles.sheet, { paddingBottom: hp(14) + insets.bottom }]}>
        <View style={styles.handle} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <AppText variant="heading3" style={styles.headerTitle}>
              {channel.selectAsset}
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          {showSearch && (
            <TextField
              value={searchAssetInput}
              onChangeText={onChangeSearchInput}
              placeholder={assetsTranslations.searchAssetPlaceholder}
              style={styles.input}
              inputStyle={styles.inputStyle}
              rightIcon={
                isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.accent1}
                  />
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
                <AppText variant="caption" style={styles.labelTextStyle}>
                  {assetsTranslations.assetName}
                </AppText>
              </View>
              <View>
                <AppText variant="caption" style={styles.labelTextStyle}>
                  {sendScreen.availableBalance}
                </AppText>
              </View>
            </View>
          )}

          <View style={styles.listWrapper}>
            <FlatList
              data={assets}
              style={styles.assetListContainer}
              keyExtractor={(item, index) => {
                const a: any = item as any;
                return (a?.assetId ??
                  a?.asset?.assetId ??
                  String(index)) as string;
              }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const a: any = item as any;
                const filePath = a?.media?.filePath || a?.asset?.media?.file;
                const showImage =
                  a?.assetSchema?.toUpperCase() === AssetSchema.Collectible ||
                  a?.assetSchema?.toUpperCase() === AssetSchema.UDA ||
                  a?.asset?.assetSchema?.toUpperCase() === AssetSchema.UDA ||
                  a?.asset?.assetSchema?.toUpperCase() ===
                    AssetSchema.Collectible ||
                  a?.asset?.iconUrl ||
                  a?.iconUrl;

                const imageUri = (() => {
                  if (a?.iconUrl) return a.iconUrl;
                  if (a?.asset?.iconUrl) return a.asset.iconUrl;
                  if (filePath && filePath.startsWith('http')) return filePath;
                  if (filePath) {
                    return Platform.select({
                      android: `file://${filePath}`,
                      ios: filePath,
                    });
                  }
                  return null;
                })();

                const assetName = a?.name ?? a?.asset?.name;
                const ticker = a?.ticker ?? a?.asset?.ticker;
                const assetId = a?.assetId ?? a?.asset?.assetId;
                return (
                  <AppTouchable
                    onPress={() => {
                      Keyboard.dismiss();
                      callback(a || a?.asset);
                    }}
                    style={styles.assetContainer}
                  >
                    <View style={styles.assetWrapper}>
                      <View style={styles.assetImageWrapper}>
                        {showImage ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.imageStyle}
                          />
                        ) : (
                          <AssetIcon
                            assetTicker={a?.ticker || a?.asset?.ticker}
                            assetID={a?.assetId || a?.asset?.assetId}
                            size={windowHeight > 670 ? 40 : 25}
                            verified={a?.issuer?.verified}
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
                          Number(a?.balance?.spendable ?? 0) /
                            10 ** Number(a?.precision ?? 0) ||
                            Number(a?.asset?.issuedSupply ?? 0) /
                              10 ** Number(a?.asset?.precision ?? 0),
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
      </View>
    </Modal>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    sheet: {
      height: '85%',
      width: '100%',
      backgroundColor: theme.colors.modalBackColor,
      borderTopLeftRadius: hp(24),
      borderTopRightRadius: hp(24),
      paddingTop: hp(10),
    },
    content: {
      flex: 1,
    },
    handle: {
      alignSelf: 'center',
      width: wp(56),
      height: hp(4),
      borderRadius: 999,
      backgroundColor: theme.colors.secondaryHeadingColor,
      opacity: 0.35,
      marginBottom: hp(12),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: hp(16),
      marginBottom: hp(10),
    },
    headerSpacer: {
      width: hp(40),
      height: hp(40),
    },
    headerTitle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
    },
    titleStyle: {
      color: theme.colors.headingColor,
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
      marginHorizontal: hp(16),
      marginBottom: hp(10),
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
      marginHorizontal: hp(20),
      marginTop: hp(4),
    },
    labelTextStyle: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetListContainer: {
      marginTop: hp(6),
      paddingHorizontal: hp(8),
    },
    listWrapper: {
      flex: 1,
      minHeight: hp(220),
    },
    emptyAssetStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(20),
    },
  });
export default RGBAssetList;
