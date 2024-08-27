import { Image, Keyboard, Platform, StyleSheet, View } from 'react-native';
import React, { useCallback, useContext, useState, useMemo } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import Identicon from 'react-native-identicon';
import { AssetFace } from 'src/models/interfaces/RGBWallet';

type ItemProps = {
  name: string;
  image?: string;
  tag?: string;
  onPressAsset?: (item: any) => void;
  assetId?: string;
  amount?: string;
};

const AssetItem = ({
  name,
  image,
  tag,
  onPressAsset,
  assetId,
  amount,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, 100), [theme]);
  console.log('image', image);
  return (
    <AppTouchable onPress={onPressAsset}>
      <GradientView
        style={styles.assetItemWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        {image ? (
          <View style={styles.identiconWrapper}>
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageStyle}
            />
          </View>
        ) : (
          <View style={styles.identiconWrapper}>
            {/* <View style={styles.identiconWrapper2}> */}
            <Identicon value={assetId} style={styles.identiconView} size={50} />
            {/* </View> */}
          </View>
        )}
        <View style={styles.assetDetailsWrapper}>
          <AppText
            variant="body2"
            style={{
              color:
                tag === 'COIN' ? theme.colors.accent : theme.colors.accent2,
            }}>
            {tag}
          </AppText>
          <AppText variant="body2" style={styles.nameText}>
            {name}
          </AppText>
        </View>
        <View style={styles.amountWrapper}>
          <AppText variant="smallCTA" style={styles.amountText}>
            {amount}
          </AppText>
        </View>
      </GradientView>
    </AppTouchable>
  );
};

const SendAssetScreen = () => {
  const { assetId, rgbInvoice, wallet, item } = useRoute().params;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, common, assets } = translations;
  const [invoice, setInvoice] = useState(rgbInvoice || '');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = React.useState(100);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = getStyles(theme, inputHeight);
  const isButtonDisabled = useMemo(() => {
    return !invoice || !amount;
  }, [invoice, amount]);

  const sendAsset = useCallback(async () => {
    Keyboard.dismiss();
    const utxo = invoice.match(/~\/~\/([^?]+)\?/)[1];
    const endpoint = invoice.match(/endpoints=([^&]+)/)[1];
    setLoading(true);
    const response = await ApiHandler.sendAsset({
      assetId,
      blindedUTXO: utxo,
      amount,
      consignmentEndpoints: endpoint,
    });
    console.log('response', response);
    setLoading(false);
    if (response?.txid) {
      Toast(sendScreen.sentSuccessfully, true);
      navigation.goBack();
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`, false, true);
    }
  }, [invoice, amount, navigation]);

  const handleAmtChangeText = text => {
    const positiveNumberRegex = /^\d*[1-9]\d*$/;
    if (positiveNumberRegex.test(text)) {
      setAmount(text);
    } else {
      setAmount('');
    }
  };
  console.log('item', item);
  return (
    <ScreenContainer>
      <AppHeader title={'Send Asset'} subTitle={''} />
      <ModalLoading visible={loading} />
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          navigation.navigate(NavigationRoutes.RGBCREATEUTXO, {
            refresh: () => mutate(),
          });
        }}
      />
      <AssetItem
        name={item.name}
        image={
          item.media?.filePath
            ? Platform.select({
                android: `file://${item.media?.filePath}`,
                ios: `${item.media?.filePath}.${
                  item.media?.mime.split('/')[1]
                }`,
              })
            : null
        }
        tag={
          item.assetIface.toUpperCase() === AssetFace.RGB20
            ? 'Coin'
            : 'Collectible'
        }
        assetId={assetId}
        amount={item.balance.spendable}
      />
      <TextField
        value={invoice}
        onChangeText={text => setInvoice(text)}
        placeholder={'Invoice'}
        style={[styles.input, invoice && styles.invoiceInputStyle]}
        onContentSizeChange={event => {
          setInputHeight(event.nativeEvent.contentSize.height);
        }}
        multiline={true}
        numberOfLines={5}
        contentStyle={invoice ? styles.contentStyle : styles.contentStyle1}
      />

      <TextField
        value={amount}
        onChangeText={handleAmtChangeText}
        placeholder={'Amount'}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={sendAsset}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(10),
    },
    invoiceInputStyle: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    contentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
      marginTop: hp(5),
    },
    buttonWrapper: {
      marginTop: hp(20),
    },
    assetItemWrapper: {
      flexDirection: 'row',
      width: '100%',
      padding: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      alignItems: 'center',
      borderRadius: 15,
      height: hp(70),
    },
    imageStyle: {
      height: hp(50),
      width: hp(50),
      borderRadius: 10,
    },
    assetDetailsWrapper: {
      width: '60%',
      paddingLeft: hp(20),
    },
    amountWrapper: {
      width: '20%',
      alignItems: 'flex-end',
    },
    identiconWrapper: {
      width: '20%',
      height: '100%',
      justifyContent: 'center',
    },
    identiconView: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    amountText: {
      color: theme.colors.headingColor,
    },
    nameText: {
      color: theme.colors.secondaryHeadingColor,
    },
  });

export default SendAssetScreen;
