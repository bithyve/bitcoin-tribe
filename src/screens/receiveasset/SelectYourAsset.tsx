import { Image, Platform, StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowd_light.svg';
import { Asset, AssetFace, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';

type Props = {
  selectedAsset: Asset;
  onPress: () => void;
};

const SelectYourAsset = (props: Props) => {
  const { selectedAsset, onPress } = props;
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
    <AppTouchable onPress={onPress} style={styles.container}>
      <GradientView
        style={[styles.container1]}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View>
          {selectedAsset ? (
            <View style={styles.assetWrapper}>
              <View>
                {selectedAsset?.assetSchema?.toUpperCase() ===
                  AssetSchema.Collectible ||
                selectedAsset?.asset?.assetSchema ===
                  AssetSchema.Collectible ? (
                  <Image source={{ uri: imageUri }} style={styles.imageStyle} />
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
              <AppText variant="body1" style={styles.titleText}>
                {selectedAsset?.name || selectedAsset?.asset?.name}
              </AppText>
            </View>
          ) : (
            <AppText variant="body1" style={styles.titleText}>
              {channel.selectAsset}
            </AppText>
          )}
        </View>
        <View>{isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}</View>
      </GradientView>
    </AppTouchable>
  );
};

export default SelectYourAsset;

const getStyles = (theme: AppTheme, backColor, selectedAsset) =>
  StyleSheet.create({
    container: {
      width: '99%',
      minHeight: hp(60),
    },
    container1: {
      minHeight: hp(60),
      paddingHorizontal: windowHeight > 670 ? hp(17) : hp(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 10,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
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
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
  });
