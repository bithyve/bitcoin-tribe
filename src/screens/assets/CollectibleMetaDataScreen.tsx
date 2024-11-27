import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useObject, useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { Collectible } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import DownloadIcon from 'src/assets/images/downloadBtn.svg';
import DownloadIconLight from 'src/assets/images/downloadBtnLight.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppText from 'src/components/AppText';
import ModalLoading from 'src/components/ModalLoading';
import {copyImageToPhotoLibrary} from 'src/utils/downloadImage';
import Toast from 'src/components/Toast';
import { Keys } from 'src/storage';
import GradientView from 'src/components/GradientView';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import AssetIDContainer from './components/AssetIDContainer';
import { AppContext } from 'src/contexts/AppContext';

export const Item = ({ title, value }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.itemWrapper}>
      <AppText variant="body2" style={styles.labelText}>
        {title}
      </AppText>
      <GradientView
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}
        style={styles.assetNameWrapper}>
        <AppText variant="body2" style={styles.valueText}>
          {value}
        </AppText>
      </GradientView>
    </View>
  );
};

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets } = translations;
  const { assetId } = useRoute().params;
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);
  const { appType } = useContext(AppContext);

  useEffect(() => {
    if (!collectible.metaData) {
      mutate({ assetId, schema: RealmSchema.Collectible });
    }
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        enableBack={true}
        rightIcon={!isThemeDark ? <DownloadIcon /> : <DownloadIconLight />}
        onSettingsPress={() => {
          const filePath = Platform.select({
            android: `file://${collectible.media?.filePath}`, // Ensure 'file://' prefix
            ios: `${collectible.media?.filePath}`, // Add file extension
          });
          copyImageToPhotoLibrary(filePath)
            .then(path => Toast(assets.saveAssetSuccess))
            .catch(err => Toast(assets.saveAssetFailed, true));
        }}
        style={styles.headerWrapper}
      />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <>
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: Platform.select({
                  android: `file://${collectible.media?.filePath}`,
                  ios: collectible.media?.filePath,
                }),
              }}
              resizeMode="contain"
              style={styles.imageStyle}
            />
          </View>
          <ScrollView
            style={styles.scrollingContainer}
            showsVerticalScrollIndicator={false}>
            <Item title={assets.name} value={collectible && collectible.name} />
            <Item
              title={assets.details}
              value={collectible && collectible.details}
            />
            <AssetIDContainer assetId={assetId} />
            <Item
              title={assets.issuedSupply}
              value={
                app.appType === AppType.NODE_CONNECT
                  ? collectible.issuedSupply
                  : collectible &&
                    collectible.metaData &&
                    collectible.metaData.issuedSupply
              }
            />
          </ScrollView>
        </>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: 0,
    },
    headerWrapper: {
      paddingHorizontal: 20,
    },
    itemWrapper: {
      marginVertical: hp(10),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    assetNameWrapper: {
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    detailText: {
      marginBottom: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      padding: hp(16),
    },
    imageStyle: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    imageWrapper: {
      // borderBottomColor: theme.colors.borderColor,
      // borderBottomWidth: 1,
    },
  });

export default CoinsMetaDataScreen;
