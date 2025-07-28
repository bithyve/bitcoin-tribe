import { StyleSheet, FlatList, View } from 'react-native';
import React, { useContext, useMemo, useRef, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { RgbInvoice, RGBWallet } from 'src/models/interfaces/RGBWallet';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import moment from 'moment';
import AppText from 'src/components/AppText';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from 'src/theme/Colors';
import AppTouchable from 'src/components/AppTouchable';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';
import { ApiHandler } from 'src/services/handler/apiHandler';
import dbManager from 'src/storage/realm/dbManager';
import ModalLoading from 'src/components/ModalLoading';

const ListItem = ({
  invoice,
  onCancel,
  onCopy,
}: {
  invoice: RgbInvoice;
  onCancel: (invoice: RgbInvoice) => void;
  onCopy: (invoice: RgbInvoice) => void;
}) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const ref = useRef(null);

  const handleCancel = () => {
    onCancel(invoice);
    ref.current?.close();
  };

  const handleCopy = () => {
    onCopy(invoice);
    ref.current?.close();
  };

  return (
    <Swipeable
      ref={ref}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.actionContainer}>
          <AppTouchable style={styles.deleteButton} onPress={handleCancel}>
            <AppText variant="body2" style={styles.deleteText}>
              Cancel
            </AppText>
          </AppTouchable>
          <AppTouchable
            style={styles.deleteButton}
            onPress={handleCopy}>
            <AppText variant="body2" style={styles.copyText}>
              Copy
            </AppText>
          </AppTouchable>
        </View>
      )}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.row}>
          <AppText variant="body2" style={styles.title}>
            Invoice
          </AppText>
          <AppText
            variant="body3"
            style={styles.value}
            numberOfLines={2}
            ellipsizeMode="middle">
            {invoice.invoice}
          </AppText>
        </View>

        <View style={styles.row}>
          <AppText variant="body2" style={styles.title}>
            Recipient ID
          </AppText>
          <AppText variant="body3" style={styles.value}>
            {invoice.recipientId}
          </AppText>
        </View>

        <View style={styles.row}>
          <AppText variant="body2" style={styles.title}>
            Expires On
          </AppText>
          <AppText variant="body3" style={styles.value}>
            {moment(invoice.expirationTimestamp * 1000).format(
              'DD/MM/YYYY; hh:mm:ss A',
            )}
          </AppText>
        </View>
      </GradientView>
    </Swipeable>
  );
};

const InvoicesScreen = () => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const rgbWallet: RGBWallet = useQuery(RealmSchema.RgbWallet)[0];
  const [isLoading, setIsLoading] = useState(false);
  const invoices = useMemo(() => {
    return rgbWallet.invoices.filter(invoice =>
      moment(invoice.expirationTimestamp * 1000).isAfter(moment()),
    );
  }, [rgbWallet.invoices]);


  const handleCancel = async (invoice: RgbInvoice) => {
    try {
      setIsLoading(true);
      const result = await ApiHandler.handleTransferFailure(invoice.batchTransferIdx, false);
      setIsLoading(false);
      if (result.status) {
        Toast('Invoice cancelled', false);
        const updatedInvoices = invoices.filter(i => i.invoice !== invoice.invoice);
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          { invoices: updatedInvoices },
        );
      } else {
        Toast('Failed to cancel invoice', true);
      }
    } catch (error) {
      // Toast(`Failed to cancel ${error}`, true);
      setIsLoading(false);
      console.log('error', error);
    }
  };

  const handleCopy = (invoice: RgbInvoice) => {
    Clipboard.setString(invoice.invoice);
    Toast('Invoice copied to clipboard', false);
  };

  return (
    <ScreenContainer>
      <ModalLoading visible={isLoading} />
      <GestureHandlerRootView>
        <AppHeader title={'Active Invoices'} enableBack={true} />
        <FlatList
          data={invoices.reverse()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ListItem invoice={item} onCancel={handleCancel} onCopy={handleCopy} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No active invoices</AppText>
            </View>
          }
        />
      </GestureHandlerRootView>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      marginVertical: hp(2),
    },
    title: {
      fontSize: 14,
      flex: 2,
      color: theme.colors.headingColor,
    },
    value: {
      fontSize: 13,
      flex: 4,
      color: theme.colors.secondaryHeadingColor,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginTop: '40%',
    },
    deleteButton: {
      padding: 10,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteText: {
      color: Colors.ImperialRed,
      fontSize: 14,
      marginVertical: hp(5),
      textAlign: 'left',
    },
    copyText: {
      fontSize: 14,
      marginLeft: 10,
      color: Colors.BrandeisBlue,
      textAlign: 'left',
    },
    actionContainer: {
      marginTop: hp(5),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default InvoicesScreen;
