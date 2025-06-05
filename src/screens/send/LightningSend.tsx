import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import ModalLoading from 'src/components/ModalLoading';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, wp } from 'src/constants/responsive';
import Toast from 'src/components/Toast';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import CardBox from 'src/components/CardBox';
import { useTheme } from 'react-native-paper';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import SendSuccessPopupContainer from '../assets/components/SendSuccessPopupContainer';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerTitle: {
      color: theme.colors.headingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    bodyWrapper: {
      height: '74%',
    },
    buttonWrapper: {
      marginTop: hp(20),
    },
  });

const LightningSend = () => {
  const { invoice } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { assets, common, lightning } = translations;
  const navigation = useNavigation();
  const decodeInvoiceMutation = useMutation(ApiHandler.decodeLnInvoice);
  const sendLnPaymentMutation = useMutation(ApiHandler.sendLNPayment);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    decodeInvoiceMutation.mutate({ invoice });
  }, []);

  useEffect(() => {
    if (decodeInvoiceMutation.error) {
      Toast(`${decodeInvoiceMutation.error}`, true);
      navigation.goBack();
    } else if (decodeInvoiceMutation.data) {
      setInvoiceDetails(decodeInvoiceMutation.data);
    }
  }, [decodeInvoiceMutation.data, decodeInvoiceMutation.error]);

  useEffect(() => {
    if (sendLnPaymentMutation.error) {
      Toast(`${sendLnPaymentMutation.error}`, true);
    } else if (sendLnPaymentMutation.data) {
      if (sendLnPaymentMutation.data?.status === 'Pending') {
        setTimeout(() => {
          setVisible(true);
        }, 500);
      } else {
        Toast(`${sendLnPaymentMutation.data?.status}`, true);
      }
    }
  }, [sendLnPaymentMutation.data, sendLnPaymentMutation.error]);

  return (
    <ScreenContainer>
      <AppHeader title={lightning.sendTitle} subTitle={''} />
      <ModalLoading
        visible={!invoiceDetails || sendLnPaymentMutation.isLoading}
      />

      {!invoiceDetails ? (
        <View />
      ) : (
        <View style={styles.bodyWrapper}>
          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              {lightning.invoice}
            </AppText>
            <CardBox>
              <AppText
                numberOfLines={1}
                variant="body2"
                style={styles.valueText}>
                {invoice}
              </AppText>
            </CardBox>
          </View>
          {invoiceDetails.assetId && (
            <View>
              <AppText
                numberOfLines={1}
                variant="body1"
                style={styles.headerTitle}>
                {lightning.assetId}
              </AppText>
              <CardBox>
                <AppText variant="body2" style={styles.valueText}>
                  {invoiceDetails.assetId}
                </AppText>
              </CardBox>
            </View>
          )}
          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              {lightning.amount}
            </AppText>
            <CardBox>
              <AppText variant="body2" style={styles.valueText}>
                {invoiceDetails.assetAmount}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              {lightning.paymentHash}
            </AppText>
            <CardBox>
              <AppText
                numberOfLines={1}
                variant="body2"
                style={styles.valueText}>
                {invoiceDetails.paymentHash}
              </AppText>
            </CardBox>
          </View>

          {/* <View>
            <AppText variant="body1" style={styles.headerTitle}>
              Expiry Secs
            </AppText>
            <CardBox>
              <AppText variant="body2" style={styles.headerTitle}>
                {`${invoiceDetails.expiry_sec}`}
              </AppText>
            </CardBox>
          </View> */}
        </View>
      )}
      {invoiceDetails && (
        <View style={styles.buttonWrapper}>
          <Buttons
            primaryTitle={common.send}
            primaryOnPress={() => sendLnPaymentMutation.mutate({ invoice })}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => navigation.goBack()}
            width={wp(120)}
            disabled={false}
          />
        </View>
      )}

      <ResponsePopupContainer
        visible={visible}
        enableClose={true}
        onDismiss={() => setVisible(false)}
        backColor={theme.colors.successPopupBackColor}
        borderColor={theme.colors.successPopupBorderColor}
        conatinerModalStyle={{}}>
        <SendSuccessPopupContainer
          title={assets.success}
          subTitle={lightning.lightningSendTxnSubtitle}
          ctaTitle={common.proceed}
          onPress={() => {
            navigation.goBack();
          }}
        />
      </ResponsePopupContainer>
    </ScreenContainer>
  );
};

export default LightningSend;
