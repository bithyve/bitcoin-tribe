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

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerTitle: {
      color: theme.colors.headingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    buttonWrapper: {
      marginTop: hp(20),
      bottom: 10,
    },
  });

const LightningSend = () => {
  const { invoice } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, common, wallet: walletTranslation } = translations;
  const navigation = useNavigation();
  const decodeInvoiceMutation = useMutation(ApiHandler.decodeLnInvoice);
  const sendLnPaymentMutation = useMutation(ApiHandler.sendLNPayment);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

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
      //setInvoiceDetails(sendLnPaymentMutation.data); show success
    }
  }, [sendLnPaymentMutation.data, sendLnPaymentMutation.error]);

  return (
    <ScreenContainer>
      <AppHeader title={'Send'} subTitle={''} />
      <ModalLoading visible={sendLnPaymentMutation.isLoading} />

      {!invoiceDetails ? (
        <ModalLoading visible={true} />
      ) : (
        <View style={{ flex: 1 }}>
          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              Invoice
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
              <AppText variant="body1" style={styles.headerTitle}>
                Asset ID
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
              Amount
            </AppText>
            <CardBox>
              <AppText variant="body2" style={styles.valueText}>
                {invoiceDetails.assetAmount}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              Payment Hash
            </AppText>
            <CardBox>
              <AppText variant="body2" style={styles.valueText}>
                {invoiceDetails.paymentHash}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              Expiry Secs
            </AppText>
            <CardBox>
              <AppText variant="body2" style={styles.headerTitle}>
                {invoiceDetails.expiry_sec}
              </AppText>
            </CardBox>
          </View>

          <View style={styles.buttonWrapper}>
            <Buttons
              primaryTitle={common.send}
              primaryOnPress={() => sendLnPaymentMutation.mutate({ invoice })}
              secondaryTitle={common.cancel}
              secondaryOnPress={() => navigation.goBack()}
              disabled={sendLnPaymentMutation.isLoading}
              width={wp(120)}
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

export default LightningSend;