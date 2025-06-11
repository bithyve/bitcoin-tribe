import * as React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import GradientView from '../../../components/GradientView';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from '../../../components/AppText';
import AppTouchable from '../../../components/AppTouchable';
import { Keys } from 'src/storage';
import IconArrowDown from 'src/assets/images/icon_arrowUp.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowUp_light.svg';
import { Asset, AssetSchema } from 'src/models/interfaces/RGBWallet';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AssetIcon from 'src/components/AssetIcon';

type DropdownProps = {
  style;
  assets: Asset[];
  callback: (item) => void;
  onDissmiss?: () => void;
  selectedAsset: Asset[];
};

function RGBAssetDropdownList(props: DropdownProps) {
  const { style, assets, callback, onDissmiss, selectedAsset } = props;
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

      <FlatList
        style={styles.container2}
        data={assets}
        renderItem={({ item }) => (
          <AppTouchable
            onPress={() => callback(item)}
            style={styles.assetContainer}>
            <View style={styles.assetWrapper}>
              <View style={styles.assetImageWrapper}>
                {item?.assetSchema === AssetSchema.Collectible ? (
                  <Image
                    source={{
                      uri: item?.media?.filePath,
                    }}
                    style={styles.imageStyle}
                  />
                ) : (
                  <AssetIcon
                    assetTicker={item?.ticker}
                    assetID={item?.assetId}
                    size={windowHeight > 670 ? 50 : 30}
                    verified={item?.issuer?.verified}
                  />
                )}
              </View>
              <View>
                <AppText variant="body" style={styles.assetnameText}>
                  {item?.name}
                </AppText>
              </View>
            </View>
            <View style={styles.radioBtnWrapper}>
              <RadioButton.Android
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
                value={item.assetId}
                status={
                  selectedAsset?.assetId === item.assetId
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => callback(item)}
              />
            </View>
          </AppTouchable>
        )}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 999,
      height: '93%',
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
    titleStyle: {
      color: theme.colors.headingColor,
    },
    iconArrowWrapper: {
      width: '10%',
    },
    imageStyle: {
      width: 50,
      height: 50,
      borderRadius: 10,
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
      width: '90%',
    },
    assetImageWrapper: {
      width: '20%',
    },
    radioBtnWrapper: {
      width: '10%',
    },
    assetnameText: {
      color: theme.colors.headingColor,
    },
  });
export default RGBAssetDropdownList;
