import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { Collectible } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import Colors from 'src/theme/Colors';
import { Item } from './CoinsMetaDataScreen';
import DownloadIcon from 'src/assets/images/downloadBtn.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppText from 'src/components/AppText';

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const { assetId } = useRoute().params;
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);

  useEffect(() => {
    mutate({ assetId, schema: RealmSchema.Collectible });
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        enableBack={true}
        rightIcon={<DownloadIcon />}
        style={styles.headerWrapper}
      />
      {isLoading ? (
        <ActivityIndicator color={Colors.ChineseOrange} size="large" />
      ) : (
        <>
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: Platform.select({
                  android: `file://${collectible.media?.filePath}`,
                  ios: `${collectible.media?.filePath}.${
                    collectible.media?.mime.split('/')[1]
                  }`,
                }),
              }}
              resizeMode="contain"
              style={styles.imageStyle}
            />
          </View>
          <ScrollView
            style={styles.scrollingContainer}
            showsVerticalScrollIndicator={false}>
            <AppText variant="heading2" style={styles.labelText}>
              {collectible && collectible.name}
            </AppText>
            <AppText variant="body1" style={styles.detailText}>
              {collectible && collectible.details}
            </AppText>
            <Item title={assets.assetId} value={assetId} />
            <Item
              title={assets.issuedSupply}
              value={
                collectible &&
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
    labelText: {
      color: theme.colors.headingColor,
      marginVertical: hp(10),
    },
    detailText: {
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
      paddingHorizontal: hp(16),
    },
    imageStyle: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    imageWrapper: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
    },
  });

export default CoinsMetaDataScreen;
