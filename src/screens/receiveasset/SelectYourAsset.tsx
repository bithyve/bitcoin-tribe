import { Image, Platform, StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowd_light.svg';
import { Asset, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';
import { formatTUsdt } from 'src/utils/snakeCaseToCamelCaseCase';

type Props = {
  selectedAsset: Asset;
  onPress: () => void;
  selectionLocked?: boolean;
};

const SelectYourAsset = (props: Props) => {
  const { selectedAsset, onPress, selectionLocked = false } = props;
  const theme: AppTheme = useTheme();
  const { translations } = React.useContext(LocalizationContext);
  const { channel } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, theme.colors.ctaBackColor, selectedAsset);

  const filePath = selectedAsset?.media?.filePath;
  const remoteFile = selectedAsset?.asset?.media?.file;

  const imageUri = Platform.select({
    android: filePath ? `file://${filePath}` : remoteFile,
    ios: filePath || remoteFile,
  });

  return (
    <AppTouchable
      onPress={selectionLocked ? () => {} : onPress}
      disabled={selectionLocked}
      style={styles.container}
    >
      <View style={styles.container1}>
        <View>
          {selectedAsset ? (
            <View style={styles.assetWrapper}>
              <View>
                {selectedAsset?.assetSchema?.toUpperCase() ===
                  AssetSchema.Collectible ||
                selectedAsset?.asset?.assetSchema === AssetSchema.Collectible ||
                selectedAsset?.iconUrl ||
                selectedAsset?.asset?.iconUrl ? (
                  <Image
                    source={{
                      uri:
                        selectedAsset?.iconUrl ||
                        selectedAsset?.asset?.iconUrl ||
                        imageUri,
                    }}
                    style={styles.imageStyle}
                  />
                ) : (
                  <AssetIcon
                    iconUrl={selectedAsset?.iconUrl}
                    assetTicker={
                      selectedAsset?.ticker || selectedAsset?.asset?.ticker
                    }
                    assetID={
                      selectedAsset?.assetId || selectedAsset?.asset?.assetId
                    }
                    size={windowHeight > 670 ? 40 : 25}
                    verified={selectedAsset?.issuer?.verified}
                  />
                )}
              </View>
              <AppText variant="body3" style={styles.titleText}>
                {formatTUsdt(selectedAsset?.name || selectedAsset?.asset?.name)}
              </AppText>
            </View>
          ) : (
            <AppText variant="body3" style={styles.titleText}>
              {channel.selectAsset}
            </AppText>
          )}
        </View>
        {!selectionLocked && (
          <View>
            {isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}
          </View>
        )}
      </View>
    </AppTouchable>
  );
};

export default SelectYourAsset;

const getStyles = (theme: AppTheme, backColor, selectedAsset) =>
  StyleSheet.create({
    container: {
      width: '99%',
    },
    container1: {
      paddingVertical: hp(14),
      paddingHorizontal: wp(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 15,
      experimental_backgroundImage: `linear-gradient(45deg, ${theme.colors.cardGradient1}, ${theme.colors.cardGradient2}, ${theme.colors.cardGradient3})`,
    },
    assetWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageStyle: {
      width: 30,
      height: 30,
      borderRadius: 10,
      marginRight: hp(10),
    },
    identiconView: {
      height: windowHeight > 670 ? 50 : 30,
      width: windowHeight > 670 ? 50 : 30,
      borderRadius: windowHeight > 670 ? 50 : 30,
      marginRight: hp(10),
    },
    titleText: {
      color: theme.colors.text,
      marginLeft: hp(5),
    },
  });
