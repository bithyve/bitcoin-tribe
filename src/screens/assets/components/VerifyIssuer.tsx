import { Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import moment from 'moment';
import { useQuery as realmUseQuery } from '@realm/react';

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
import { Keys } from 'src/storage';
import ShareOptionView from './ShareOptionView';
import VerificationSection from './VerificationSection';
import AppText from 'src/components/AppText';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

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
      bottom: hp(165),
    },
    tooltipText: {
      color: theme.colors.headingColor,
      fontSize: 14,
    },
    shareOptionWrapper: {
      marginTop: hp(10),
    },
  });

interface VerifyIssuerProps {
  assetId: string;
  schema: RealmSchema;
  onVerificationComplete?: () => void;
  asset: Asset;
  showVerifyIssuer?: boolean;
  showDomainVerifyIssuer?: boolean;
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
        const existingAsset = await dbManager.getObjectByPrimaryId(
          schema,
          'assetId',
          assetId,
        );
        const existingIssuer =
          JSON.parse(JSON.stringify(existingAsset?.issuer)) || {};
        const filteredVerifiedBy = (existingIssuer.verifiedBy || []).filter(
          entry => entry.type !== IssuerVerificationMethod.TWITTER,
        );
        const updatedVerifiedBy = [
          ...filteredVerifiedBy,
          {
            type: IssuerVerificationMethod.TWITTER,
            id: result.id,
            name: result.name,
            username: result.username,
          },
        ];
        await dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          issuer: {
            ...existingIssuer,
            verified: true,
            verifiedBy: updatedVerifiedBy,
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
  const {
    assetId,
    schema,
    asset,
    showVerifyIssuer,
    showDomainVerifyIssuer,
    onPressShare,
  } = props;
  const navigation = useNavigation();
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
  const [disabledCTA, setDisabledCTA] = useState(false);
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
      setDisabledCTA(false);
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
      setDisabledCTA(false);
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
          const existingAsset = await dbManager.getObjectByPrimaryId(
            schema,
            'assetId',
            assetId,
          );
          const existingIssuer =
            JSON.parse(JSON.stringify(existingAsset?.issuer)) || {};
          const filteredVerifiedBy = (existingIssuer.verifiedBy || []).filter(
            entry => entry.type !== IssuerVerificationMethod.TWITTER,
          );
          const updatedVerifiedBy = [
            ...filteredVerifiedBy,
            {
              type: IssuerVerificationMethod.TWITTER,
              id: result.id,
              name: result.name,
              username: result.username,
            },
          ];
          await dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
            issuer: {
              ...existingIssuer,
              verified: true,
              verifiedBy: updatedVerifiedBy,
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

  const handleVerifyWithDomain = () => {
    navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
      assetId: assetId,
      schema: schema,
    });
  };

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
      setDisabledCTA(false);
      Toast(`${error}`, true);
      console.log(error);
    }
  }, [assetId, schema]);

  if (requesting) {
    return <CardSkeletonLoader />;
  }

  const ShareOptionContainer = () => {
    return (
      (asset?.isVerifyPosted === false ||
        asset?.isVerifyPosted === null ||
        asset?.isIssuedPosted === false ||
        asset?.isIssuedPosted === null) && (
        <View style={styles.shareOptionWrapper}>
          <ShareOptionView
            title={assets.sharePostTitle}
            onPress={onPressShare}
          />
        </View>
      )
    );
  };

  return (
    <>
      {isAddedInRegistry ? (
        !showVerifyIssuer &&
        !showDomainVerifyIssuer &&
        asset?.isVerifyPosted &&
        asset?.isIssuedPosted ? null : (
          <VerificationSection onInfoPress={() => setVisible(true)}>
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
              {showDomainVerifyIssuer && (
                <SelectOption
                  title={assets.verifyDomain}
                  subTitle={''}
                  onPress={handleVerifyWithDomain}
                  testID={'verify-with-domain'}
                />
              )}
            </View>
            <ShareOptionContainer />
          </VerificationSection>
        )
      ) : (
        <VerificationSection onInfoPress={() => setVisible(true)}>
          <View style={styles.container}>
            <ModalLoading visible={getAssetIssuanceFeeMutation.isLoading} />
            <SelectOption
              title={assets.registerAssetTitle}
              subTitle={assets.registerAssetSubTitle}
              onPress={() => getAssetIssuanceFeeMutation.mutate()}
              testID={'register-asset'}
            />
            <ShareOptionContainer />
            <View>
              <ModalContainer
                title={assets.listYourAssetInRegTitle}
                subTitle={assets.listYourAssetInRegSubTitle}
                visible={showFeeModal}
                enableCloseIcon={false}
                onDismiss={() => {
                  if (disabledCTA) return;
                  setShowFeeModal(false);
                  getAssetIssuanceFeeMutation.reset();
                }}>
                <ServiceFee
                  onPay={async () => {
                    setDisabledCTA(true);
                    await ApiHandler.refreshWallets({ wallets: [wallet] });
                    payServiceFeeFeeMutation.mutate({ feeDetails });
                  }}
                  feeDetails={feeDetails}
                  status={payServiceFeeFeeMutation.status}
                  onSkip={() => setShowFeeModal(false)}
                  hideModal={() => {
                    setShowFeeModal(false);
                    setDisabledCTA(false);
                    getAssetIssuanceFeeMutation.reset();
                  }}
                  disabledCTA={disabledCTA}
                />
              </ModalContainer>
            </View>
          </View>
        </VerificationSection>
      )}

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
