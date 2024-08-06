import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight } from 'src/constants/responsive';
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

const CoinsMetaDataScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { assetId } = useRoute().params;
  const collectible = useObject<Collectible>(RealmSchema.Collectible, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);

  useEffect(() => {
    mutate({ assetId, schema: RealmSchema.Collectible });
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title="Meta Data" enableBack={true} />
      {isLoading ? (
        <ActivityIndicator color={Colors.ChineseOrange} size="large" />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          <Image
            source={{
              uri: Platform.select({
                android: `file://${collectible.media?.filePath}`,
                ios: `${collectible.media?.filePath}.${
                  collectible.media?.mime.split('/')[1]
                }`,
              }),
            }}
            style={styles.imageStyle}
          />
          <Item title="Name" value={collectible && collectible.name} />
          <Item title="Details" value={collectible && collectible.details} />

          <Item title="Asset ID" value={assetId} />
          <Item
            title="Issued Supply"
            value={
              collectible &&
              collectible.metaData &&
              collectible.metaData.issuedSupply
            }
          />
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    assetContainer: {
      height: windowHeight > 650 ? '35%' : '30%',
      position: 'relative',
      marginBottom: hp(20),
      borderBottomColor: 'gray',
      borderBottomWidth: 0.8,
    },
    assetStyle: {
      height: '100%',
      width: '100%',
    },
    assetChipWrapper: {
      position: 'absolute',
      zIndex: 999,
      left: 30,
      top: 10,
    },
    downloadWrapper: {
      position: 'absolute',
      zIndex: 999,
      right: 25,
      bottom: 15,
    },
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(5),
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      // marginHorizontal: wp(20),
    },
    imageStyle: {
      width: 200,
      height: 200,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: 20,
    },
  });

export default CoinsMetaDataScreen;
