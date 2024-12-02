import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import Identicon from 'react-native-identicon';

import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowd_light.svg';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';

type Props = {
  selectedAsset: Asset;
  onPress: () => void;
};

const SelectAssetIDView = (props: Props) => {
  const { selectedAsset, onPress } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, theme.colors.ctaBackColor);

  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={[styles.container]}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View>
          {selectedAsset ? <View style={styles.assetWrapper}>
            <View>
              {selectedAsset?.assetIface === AssetFace.RGB25 ? (
                <Image
                  source={{
                    uri: selectedAsset?.media?.filePath,
                  }}
                  style={styles.imageStyle}
                />
              ) : (
                <Identicon
                  value={selectedAsset?.assetId}
                  style={styles.identiconView}
                  size={windowHeight > 670 ? 50 : 30}
                />
              )}
            </View>
            <AppText variant="body1" style={styles.titleText}>{selectedAsset?.name}</AppText>
          </View>:
          <AppText variant="body1" style={styles.titleText}>
            Select Your Asset
          </AppText>}
        </View>
        <View>{!isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}</View>
      </GradientView>
    </AppTouchable>
  );
};

export default SelectAssetIDView;

const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 20,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    assetWrapper: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    imageStyle: {
      width: 30,
      height: 30,
      borderRadius: 10,
      marginRight: hp(10)
    },
    identiconView: {
      height:  30 ,
      width: 30,
      borderRadius: 30,
      marginRight: hp(10)
    },
    titleText: {
      color: theme.colors.headingColor,
    },
  });
