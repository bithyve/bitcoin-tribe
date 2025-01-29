import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { UniqueDigitalAsset } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';
import { hp, wp } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import { useMMKVBoolean } from 'react-native-mmkv';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { Item } from './CollectibleMetaDataScreen';
import IconSend from 'src/assets/images/icon_send.svg';
import IconSendLight from 'src/assets/images/icon_send_light.svg';
import RoundedCTA from 'src/components/RoundedCTA';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppTouchable from 'src/components/AppTouchable';

const UDADetailsScreen = () => {
  const navigation = useNavigation();
  const { assetId } = useRoute().params;
  const styles = getStyles();
  const { appType } = useContext(AppContext);
  const uda = useObject<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    assetId,
  );
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const { translations } = useContext(LocalizationContext);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { assets, common } = translations;
  const theme: AppTheme = useTheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.UniqueDigitalAsset });
      if (appType === AppType.NODE_CONNECT) {
        listPaymentshMutation.mutate();
      }
    });
    return unsubscribe;
  }, [navigation, assetId]);

  return (
    <ScreenContainer>
      <AppHeader title={uda.name} />
      <ScrollView>
        <Image
          source={{
            uri: Platform.select({
              android: `file://${uda.token.media?.filePath}`,
              ios: uda.token.media?.filePath,
            }),
          }}
          resizeMode="contain"
          style={styles.imageStyle}
        />

        <View style={styles.buttonWrapper}>
          <RoundedCTA
            colors={[
              theme.colors.inputBackground,
              theme.colors.inputBackground,
              theme.colors.inputBackground,
            ]}
            textColor={theme.colors.roundSendCTATitle}
            icon={isThemeDark ? <IconSend /> : <IconSendLight />}
            buttonColor={theme.colors.sendCtaBorderColor}
            title={common.send}
            onPress={() =>
              navigation.navigate(NavigationRoutes.SCANASSET, {
                assetId: assetId,
                rgbInvoice: '',
              })
            }
            width={wp(105)}
          />
        </View>

        <Item title={assets.name} value={uda.name} />
        <Item title={assets.ticker} value={uda.ticker} />
        <Item title={assets.details} value={uda.details} />
        <Item
          title={assets.issuedOn}
          value={moment.unix(uda.timestamp).format('DD MMM YY  hh:mm A')}
        />

        <View>
          <FlatList
            data={uda.token.attachments}
            horizontal
            renderItem={({ item }) => (
              <AppTouchable style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      Platform.OS === 'ios'
                        ? item.filePath.replace('file://', '')
                        : item.filePath,
                  }}
                  style={styles.imagesStyle}
                />
              </AppTouchable>
            )}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
const getStyles = () =>
  StyleSheet.create({
    imageStyle: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: hp(25),
    },
    buttonWrapper: {
      marginHorizontal: wp(5),
      paddingBottom: 0,
      marginVertical: wp(5),
      alignItems: 'center',
    },
    imagesStyle: {
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageWrapper: {
      height: 100,
      width: 100,
    },
  });
export default UDADetailsScreen;
