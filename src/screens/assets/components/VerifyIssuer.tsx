import { StyleSheet, View } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import AppText from 'src/components/AppText';
import SelectOption from 'src/components/SelectOption';
import { loginWithTwitter } from 'src/services/twitter';
import Relay from 'src/services/relay';
import {
  Asset,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import ModalContainer from 'src/components/ModalContainer';
import { useMutation } from 'react-query';
import { TransactionKind } from 'src/services/wallets/enums';
import useWallets from 'src/hooks/useWallets';
import { ServiceFee } from 'src/screens/home/components/AddAsset';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import moment from 'moment';
import { AppContext } from 'src/contexts/AppContext';

const styles = StyleSheet.create({
  title: {
    marginBottom: 5,
  },
  subtitle: {
    marginBottom: 5,
    color: '#787878',
  },
  container: {
    marginVertical: 20,
  },
});

interface VerifyIssuerProps {
  assetId: string;
  schema: RealmSchema;
}

export const verifyIssuerOnTwitter = async (assetId, schema) => {
  try {
    const result = await loginWithTwitter();
    if (result.username) {
      const response = await Relay.verifyIssuer('appID', assetId, {
        type: IssuerVerificationMethod.TWITTER,
        id: result.id,
        name: result.name,
        username: result.username,
      });
      if (response.status) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          issuer: {
            verified: true,
            verifiedBy: [
              {
                type: IssuerVerificationMethod.TWITTER,
                id: result.id,
                name: result.name,
                username: result.username,
              },
            ],
          },
        });
      }
    }
  } catch (error) {
    Toast(`${error}`, true);
    console.log(error);
  }
};

const VerifyIssuer: React.FC<VerifyIssuerProps> = (
  props: VerifyIssuerProps,
) => {
  const { assetId, schema } = props;
  const { setCompleteVerification } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [isAddedInRegistry, setIsAddedInRegistry] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [feeDetails, setFeeDetails] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const getAssetIssuanceFeeMutation = useMutation(Relay.getAssetIssuanceFee);
  const payServiceFeeFeeMutation = useMutation(ApiHandler.payServiceFee);
  const wallet: Wallet = useWallets({}).wallets[0];

  useEffect(() => {
    const fetchAsset = async () => {
      setRequesting(true);
      const asset = await Relay.getAsset(assetId);
      setIsAddedInRegistry(asset.status);
      setRequesting(false);
    };
    fetchAsset();
  }, [assetId]);

  useEffect(() => {
    if (getAssetIssuanceFeeMutation.isSuccess) {
      const feeData = getAssetIssuanceFeeMutation.data;
      if (feeData.fee > 0) {
        setFeeDetails(feeData);
        const feesPaid = wallet.specs.transactions.filter(
          tx =>
            tx.transactionKind === TransactionKind.SERVICE_FEE &&
            tx.metadata?.assetId === '',
        );
        if (feesPaid.length > 0) {
          registerAsset();
        } else {
          setTimeout(() => {
            setShowFeeModal(true);
          }, 500);
          getAssetIssuanceFeeMutation.reset();
        }
      } else {
        registerAsset();
      }
    } else if (getAssetIssuanceFeeMutation.error) {
      Toast(assets.failToFetchIssueFee, true);
      getAssetIssuanceFeeMutation.reset();
    }
  }, [
    getAssetIssuanceFeeMutation.isSuccess,
    getAssetIssuanceFeeMutation.data,
    getAssetIssuanceFeeMutation.error,
  ]);

  useEffect(() => {
    if (payServiceFeeFeeMutation.isSuccess) {
      getAssetIssuanceFeeMutation.reset();
      payServiceFeeFeeMutation.reset();
      setShowFeeModal(false);
      setTimeout(() => {
        registerAsset();
      }, 400);
    } else if (payServiceFeeFeeMutation.error) {
      const errorMessage =
        payServiceFeeFeeMutation.error?.message ||
        payServiceFeeFeeMutation.error?.toString() ||
        'An unexpected error occurred';

      Toast(
        `Failed to pay service fee. Please refresh your wallet and try again.`,
        true,
      );
      payServiceFeeFeeMutation.reset();
      setShowFeeModal(false);
    }
  }, [payServiceFeeFeeMutation]);

  const handleVerifyWithTwitter = React.useCallback(async () => {
    try {
      const result = await loginWithTwitter();
      if (result.username) {
        setIsLoading(true);
        const response = await Relay.verifyIssuer('appID', assetId, {
          type: IssuerVerificationMethod.TWITTER,
          id: result.id,
          name: result.name,
          username: result.username,
        });
        setIsLoading(false);
        if (response.status) {
          console.log('response.status', response.status);
          setCompleteVerification(true);
          dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
            issuer: {
              verified: true,
              verifiedBy: [
                {
                  type: IssuerVerificationMethod.TWITTER,
                  id: result.id,
                  name: result.name,
                  username: result.username,
                },
              ],
            },
          });
        }
      }
    } catch (error) {
      Toast(`${error}`, true);
      setIsLoading(false);
      console.log(error);
    }
  }, [assetId, schema]);

  const registerAsset = React.useCallback(async () => {
    try {
      const asset = dbManager.getObjectByPrimaryId(
        schema,
        'assetId',
        assetId,
      ) as unknown as Asset;
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
      const { status } = await Relay.registerAsset(app.id, asset);
      if (status) {
        setIsAddedInRegistry(true);
        Toast(assets.registerAssetMsg);
        const tx = wallet.specs.transactions.find(
          tx =>
            tx.transactionKind === TransactionKind.SERVICE_FEE &&
            tx.metadata?.assetId === '',
        );
        if (tx) {
          ApiHandler.updateTransaction({
            txid: tx.txid,
            updateProps: {
              metadata: {
                assetId: assetId,
                note: `Issued ${asset.name} on ${moment().format(
                  'DD MMM YY  •  hh:mm A',
                )}`,
              },
            },
          });
        }
      }
    } catch (error) {
      Toast(`${error}`, true);
      console.log(error);
    }
  }, [assetId, schema]);

  if (requesting) {
    return <View />;
  }
  return isAddedInRegistry ? (
    <View style={styles.container}>
      <ModalLoading visible={isLoading} />
      <AppText variant="heading3" style={styles.title}>
        {assets.issuerVerificationTitle}
      </AppText>
      <AppText variant="body2" style={styles.subtitle}>
        {assets.issuerVerificationSubTitle}
      </AppText>

      <SelectOption
        title={assets.connectVerifyTwitter}
        subTitle={''}
        onPress={handleVerifyWithTwitter}
        testID={'verify-with-twitter'}
      />
    </View>
  ) : (
    <View style={styles.container}>
      <ModalLoading visible={getAssetIssuanceFeeMutation.isLoading} />

      <SelectOption
        title={'Register Asset'}
        subTitle={'Add asset to Bitcoin Tribe registry'}
        onPress={() => getAssetIssuanceFeeMutation.mutate()}
        testID={'register-asset'}
      />

      <View>
        <ModalContainer
          title={assets.listYourAssetInRegTitle}
          subTitle={assets.listYourAssetInRegSubTitle}
          visible={showFeeModal}
          enableCloseIcon={false}
          onDismiss={() => {
            if (payServiceFeeFeeMutation.isLoading) return;
            setShowFeeModal(false);
            getAssetIssuanceFeeMutation.reset();
          }}>
          <ServiceFee
            onPay={async () => {
              await ApiHandler.refreshWallets({ wallets: [wallet] });
              payServiceFeeFeeMutation.mutate({ feeDetails });
            }}
            feeDetails={feeDetails}
            status={payServiceFeeFeeMutation.status}
            onSkip={() => setShowFeeModal(false)}
            hideModal={() => {
              setShowFeeModal(false);
              getAssetIssuanceFeeMutation.reset();
            }}
          />
        </ModalContainer>
      </View>
    </View>
  );
};

export default VerifyIssuer;
