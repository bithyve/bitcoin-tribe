import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { Coin } from 'src/models/interfaces/RGBWallet';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RealmSchema } from 'src/storage/enum';
import moment from 'moment';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ModalLoading from 'src/components/ModalLoading';
import GradientView from 'src/components/GradientView';
import AssetIDContainer from './components/AssetIDContainer';

export const Item = ({ title, value, width = '100%' }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, width), [theme, width]);
  return (
    <View style={styles.contentWrapper}>
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
  const { assets } = translations;
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetMetaData);

  useEffect(() => {
    if (!coin.metaData) {
      mutate({ assetId, schema: RealmSchema.Coin });
    }
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={assets.coinMetaTitle}
        subTitle={assets.coinMetaSubTitle}
        enableBack={true}
      />
      {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : (
        <ScrollView
          style={styles.scrollingContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.rowWrapper}>
            <Item title={assets.name} value={coin.name} width={'45%'} />
            <Item
              title={assets.ticker}
              value={coin.metaData && coin.metaData.ticker}
              width={'45%'}
            />
          </View>
          <AssetIDContainer assetId={assetId} />
          <View style={styles.rowWrapper}>
            <Item
              title={assets.schema}
              value={coin.metaData && coin.metaData.assetSchema.toUpperCase()}
              width={'45%'}
            />
            <Item
              title={assets.iFace}
              value={coin.metaData && coin.metaData.assetIface.toUpperCase()}
              width={'45%'}
            />
          </View>
          <View style={styles.rowWrapper}>
            <Item
              title={assets.issuedSupply}
              value={coin.metaData && coin.metaData.issuedSupply}
              width={'45%'}
            />
            <Item
              title={assets.precision}
              value={coin.metaData && coin.metaData.precision}
              width={'45%'}
            />
          </View>
          <Item
            title={assets.issuedOn}
            value={moment
              .unix(coin.metaData && coin.metaData.timestamp)
              .format('DD MMM YY  hh:mm A')}
          />
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    assetNameWrapper: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    assetDetailsText: {
      color: theme.colors.headingColor,
    },
    assetValueText: {
      color: theme.colors.secondaryHeadingColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      marginVertical: hp(10),
      width: width,
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
      marginTop: wp(20),
      padding: hp(16),
      backgroundColor: theme.colors.cardGradient3,
      marginHorizontal: hp(10),
      borderRadius: 20,
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    rowWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
  });

export default CoinsMetaDataScreen;
