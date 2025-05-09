import { StyleSheet, View } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import moment from 'moment';

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
import { TransactionKind } from 'src/services/wallets/enums';
import { ServiceFee } from 'src/screens/home/components/AddAsset';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { AppContext } from 'src/contexts/AppContext';
import CardSkeletonLoader from 'src/components/CardSkeletonLoader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import InfoIcon from 'src/assets/images/infoIcon1.svg';
import InfoIconLight from 'src/assets/images/infoIcon1_light.svg';
import { Keys } from 'src/storage';
import VerticalGradientView from 'src/components/VerticalGradientView';
import { useQuery as realmUseQuery } from '@realm/react';
import AppTouchable from 'src/components/AppTouchable';
import ShareOptionView from './ShareOptionView';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    title: {
      marginBottom: 5,
    },
    subtitle: {
      marginBottom: 5,
      color: '#787878',
    },
    container: {
      marginVertical: 10,
    },
    gradientContainer: {
      marginTop: hp(20),
      paddingHorizontal: hp(16),
      paddingBottom: hp(10),
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
    },
    verifyViewWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginTop: hp(20),
      alignItems: 'center',
      marginBottom: hp(15),
    },
    verifyTitleWrapper: {
      width: '90%',
    },
    verifyTitle: {
      color: theme.colors.secondaryHeadingColor,
    },
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: theme.colors.modalBackColor,
      padding: 12,
      borderRadius: 8,
      width: 270,
      alignSelf: 'flex-end',
      right: 15,
      bottom: hp(145),
    },
    tooltipText: {
      color: theme.colors.headingColor,
      fontSize: 14,
    },
  });

interface VerifyIssuerProps {
  assetId: string;
  schema: RealmSchema;
  onVerificationComplete?: () => void;
  asset: Asset;
  showVerifyIssuer?: boolean;
  onPressShare?: () => void;
}

export const verifyIssuerOnTwitter = async (
  assetId,
  schema,
  onVerificationComplete,
) => {
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
        onVerificationComplete?.();
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
  const { assetId, schema, asset, showVerifyIssuer, onPressShare } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { setCompleteVerification } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const [isAddedInRegistry, setIsAddedInRegistry] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [feeDetails, setFeeDetails] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const getAssetIssuanceFeeMutation = useMutation(Relay.getAssetIssuanceFee);
  const payServiceFeeFeeMutation = useMutation(ApiHandler.payServiceFee);
  const [wallet] = realmUseQuery<Wallet>(RealmSchema.Wallet);

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
      if (errorMessage === 'Insufficient balance') {
        Toast(assets.payServiceFeeFundError, true);
      }
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
    return <CardSkeletonLoader />;
  }
  console.log('asset', asset);
  return (
    <>
      <VerticalGradientView
        colors={[
          theme.colors.cardGradient4,
          theme.colors.cardGradient5,
          theme.colors.cardGradient5,
        ]}
        style={styles.gradientContainer}>
        <View style={styles.verifyViewWrapper}>
          <View style={styles.verifyTitleWrapper}>
            <AppText variant="body1" style={styles.verifyTitle}>
              {assets.verificationTitle}
            </AppText>
          </View>
          <AppTouchable onPress={() => setVisible(true)}>
            {isThemeDark ? (
              <InfoIcon width={24} height={24} />
            ) : (
              <InfoIconLight width={24} height={24} />
            )}
          </AppTouchable>
        </View>
        {isAddedInRegistry ? (
          <View style={styles.container}>
            <ModalLoading visible={isLoading} />
            {showVerifyIssuer && (
              <SelectOption
                title={assets.connectVerifyTwitter}
                subTitle={''}
                onPress={handleVerifyWithTwitter}
                testID={'verify-with-twitter'}
              />
            )}
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
        )}
        {(asset?.isVerifyPosted === false ||
          asset?.isVerifyPosted === null ||
          asset?.isIssuedPosted === false ||
          asset?.isIssuedPosted === null) && (
          <View>
            <ShareOptionView
              title={assets.sharePostTitle}
              onPress={onPressShare}
            />
          </View>
        )}
      </VerticalGradientView>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.tooltipContainer}>
          <AppText variant="caption" style={styles.tooltipText}>
            {!isAddedInRegistry
              ? assets.verificationInfoText1
              : assets.verificationInfoText2}
          </AppText>
        </Modal>
      </Portal>
    </>
  );
};

export default VerifyIssuer;
