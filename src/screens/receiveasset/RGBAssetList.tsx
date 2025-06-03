import * as React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
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
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';
import { formatLargeNumber, formatNumber } from 'src/utils/numberWithCommas';
import TextField from 'src/components/TextField';
import IconSearch from 'src/assets/images/icon_search.svg';
import ModalLoading from 'src/components/ModalLoading';

type DropdownProps = {
  style;
  assets: Asset[];
  callback: (item) => void;
  onDissmiss?: () => void;
  selectedAsset: Asset[];
  searchAssetInput?: string;
  onChangeSearchInput?: (text: string) => void;
  isLoading?: boolean;
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
              {channel.selectYourAsset}
            </AppText>
          </View>
          <View style={styles.iconArrowWrapper}>
            {isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}
          </View>
        </GradientView>
      </AppTouchable>
      <View style={styles.container2}>
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
              <IconSearch />
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
          onSubmitEditing={() => {}}
        />
        <FlatList
          data={assets}
          renderItem={({ item }) => (
            <AppTouchable
              onPress={() => callback(item || item?.asset)}
              style={styles.assetContainer}>
              <View style={styles.assetWrapper}>
                <View style={styles.assetImageWrapper}>
                  {item?.assetIface?.toUpperCase() === AssetFace.RGB25 ||
                  item?.asset?.assetIface?.toUpperCase() === AssetFace.RGB25 ? (
                    <Image
                      source={{
                        uri: item?.media?.filePath || item?.asset?.media.file,
                      }}
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
                <View>
                  <AppText variant="body1" style={styles.assetnameText}>
                    {item?.name || item?.asset?.name}
                  </AppText>
                </View>
              </View>

              <View style={styles.balanceWrapper}>
                <AppText variant="body2" style={styles.balanceText}>
                  {formatLargeNumber(
                    item?.balance?.spendable || item?.asset?.issuedSupply,
                  )}
                </AppText>
              </View>
            </AppTouchable>
          )}
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
      height: '80%',
      backgroundColor: theme.colors.primaryBackground,
    },
    container2: {
      borderRadius: hp(20),
      marginTop: hp(20),
      backgroundColor: theme.colors.cardBackground,
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
      borderRadius: 5,
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
      alignItems: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
    },
    assetWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '75%',
    },
    assetImageWrapper: {
      width: '20%',
    },
    balanceWrapper: {
      width: '25%',
    },
    assetnameText: {
      color: theme.colors.headingColor,
    },
    balanceText: {
      color: theme.colors.headingColor,
      textAlign: 'right',
    },
    input: {
      margin: hp(12),
      width: 'auto',
    },
    inputStyle: {
      height: hp(50),
      width: '80%',
    },
    rightCTAStyle: {
      height: hp(40),
      width: hp(55),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: hp(5),
    },
  });
export default RGBAssetList;
