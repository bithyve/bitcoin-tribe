import React, { useContext, useMemo, useRef, useState } from 'react';
import {
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SelectOption from 'src/components/SelectOption';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import {
  Collection,
  IssuerVerificationMethod,
  TransferKind,
} from 'src/models/interfaces/RGBWallet';
import { useObject } from '@realm/react';
import PostOnTwitterModal from './components/PostOnTwitterModal';
import {
  updateAssetIssuedPostStatus,
  updateAssetPostStatus,
} from 'src/utils/postStatusUtils';
import IssueAssetPostOnTwitterModal from './components/IssueAssetPostOnTwitterModal';
import { AppContext } from 'src/contexts/AppContext';

export const CollectionVerificationScreen = ({ navigation }) => {
  const { collectionId } = useRoute().params;
  const collection = useObject<Collection>(
    RealmSchema.Collection,
    collectionId,
  );
  const { assets } = useContext(LocalizationContext).translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visibleIssuedPostOnTwitter, setVisibleIssuedPostOnTwitter] =
    useState(false);
  const [visiblePostOnTwitter, setVisiblePostOnTwitter] = useState(false);
  const {
      hasCompleteVerification,
      setCompleteVerification,
    } = useContext(AppContext);
    const hasShownPostModal = useRef(false);

  const verified = collection?.issuer?.verifiedBy?.some(
    item => item.verified === true,
  );

  const twitterVerification = collection?.issuer?.verifiedBy?.find(
    v =>
      v.type === IssuerVerificationMethod.TWITTER ||
      v.type === IssuerVerificationMethod.TWITTER_POST,
  );

  const verifyXNavigation = () => {
    navigation.navigate(NavigationRoutes.VERIFYX, {
      assetId: collection.assetId,
      schema: RealmSchema.Collection,
      savedTwitterHandle: '',
    });
  };


  const handleVerifyWithDomain = () => {
    navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
      assetId: collection.assetId,
      schema: RealmSchema.Collection,
      savedDomainName: '',
    });
  };
  const showVerifyIssuer = useMemo(() => {
    return (
      !twitterVerification?.id &&
      collection?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collection?.transactions, collection.issuer?.verifiedBy]);


  const domainVerification = collection?.issuer?.verifiedBy?.find(
    v => v.type === IssuerVerificationMethod.DOMAIN,
  );
  const showDomainVerifyIssuer = useMemo(() => {
    return (
      !domainVerification?.verified &&
      collection?.transactions.some(
        transaction => transaction.kind.toUpperCase() === TransferKind.ISSUANCE,
      )
    );
  }, [collection?.transactions, collection?.issuer?.verifiedBy]);

   useFocusEffect(
      React.useCallback(() => {
        if (
          collection?.issuer?.verified &&
          hasCompleteVerification &&
          !hasShownPostModal.current
        ) {
          hasShownPostModal.current = true;
          setTimeout(() => {
            setVisiblePostOnTwitter(true);
          }, 1000);
        }
      }, [collection?.issuer?.verified, hasCompleteVerification]),
    );


  return (
    <ScreenContainer>
      <AppHeader
        title={assets.collectionVerificationTitle}
        subTitle={assets.collectionVerificationSubTitle}
      />
      <View style={styles.container}>
        {showVerifyIssuer && (
          <SelectOption
            title={assets.connectVerifyTwitter}
            onPress={verifyXNavigation}
          />
        )}
        {showDomainVerifyIssuer && (
          <SelectOption
            title={assets.verifyDomain}
            onPress={handleVerifyWithDomain}
          />
        )}

        <SelectOption
          title={assets.sharePostTitle}
          onPress={() => {
            if (!collection?.isIssuedPosted) {
              console.log('pass1');
              setVisibleIssuedPostOnTwitter(true);
            } else if (!collection?.isVerifyPosted && verified) {
              console.log('pass2');
              setVisiblePostOnTwitter(true);
            }
          }}
        />
      </View>

      <>
        <PostOnTwitterModal
          visible={visiblePostOnTwitter}
          primaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(
              collection,
              RealmSchema.Collection,
              collectionId,
              false,
            );
            updateAssetIssuedPostStatus(
              RealmSchema.Collection,
              collectionId,
              true,
            );
          }}
          secondaryOnPress={() => {
            setVisiblePostOnTwitter(false);
            setCompleteVerification(false);
            updateAssetPostStatus(
              collection,
              RealmSchema.Collection,
              collectionId,
              false,
            );
            updateAssetIssuedPostStatus(
              RealmSchema.Collection,
              collectionId,
              true,
            );
          }}
          issuerInfo={collection}
        />
      </>

      <>
        <IssueAssetPostOnTwitterModal
          visible={visibleIssuedPostOnTwitter}
          primaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            updateAssetIssuedPostStatus(
              RealmSchema.Collection,
              collectionId,
              false,
            );
          }}
          secondaryOnPress={() => {
            setVisibleIssuedPostOnTwitter(false);
            updateAssetIssuedPostStatus(
              RealmSchema.Collection,
              collectionId,
              false,
            );
          }}
          issuerInfo={collection}
        />
      </>
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
