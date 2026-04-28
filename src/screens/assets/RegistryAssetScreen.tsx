import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import Toast from 'src/components/Toast';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Asset, AssetType } from 'src/models/interfaces/RGBWallet';
import Relay from 'src/services/relay';
import { ApiHandler } from 'src/services/handler/apiHandler';

/** Asset types that can be added to the wallet via the registry deep link. */
const SUPPORTED_COIN_TYPES: string[] = [AssetType.Coin, AssetType.RGB20, AssetType.NIA];

function RegistryAssetScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assetId } = route.params as { assetId: string };
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const lookupMutation = useMutation(
    (id: string) => Relay.lookupAsset(id),
    {
      onSuccess: result => {
        if (result?.status && result?.asset) {
          setAsset(result.asset);
          setLookupError(null);
        } else {
          setLookupError(result?.error || 'Asset not found in registry');
        }
      },
      onError: (error: Error) => {
        const msg = error?.message || 'Network error. Please try again.';
        setLookupError(msg);
        Toast(msg, true);
      },
    },
  );

  const addMutation = useMutation(
    (assetToAdd: Asset) => ApiHandler.addAssetFromRegistry({ asset: assetToAdd }),
    {
      onSuccess: result => {
        if (result?.alreadyExists) {
          Toast('Asset is already in your wallet', false);
        } else {
          Toast('Asset added to wallet', false);
        }
        navigation.dispatch(
          CommonActions.navigate(NavigationRoutes.HOME),
        );
      },
      onError: (error: Error) => {
        Toast(error?.message || 'Failed to add asset', true);
      },
    },
  );

  const { mutate: lookupMutate } = lookupMutation;
  const { mutate: addMutate } = addMutation;

  useEffect(() => {
    if (assetId) {
      lookupMutate(assetId);
    }
  }, [assetId, lookupMutate]);

  const handleRetry = useCallback(() => {
    setLookupError(null);
    lookupMutate(assetId);
  }, [assetId, lookupMutate]);

  const handleAddToWallet = useCallback(() => {
    if (!asset) return;
    if (asset.assetType && !SUPPORTED_COIN_TYPES.includes(asset.assetType as AssetType)) {
      Toast('Only Coin, RGB20, and NIA asset types are currently supported', true);
      return;
    }
    addMutate(asset);
  }, [asset, addMutate]);

  const renderContent = () => {
    if (lookupMutation.isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <AppText style={styles.loadingText}>Looking up asset...</AppText>
        </View>
      );
    }

    if (lookupError) {
      return (
        <View style={styles.centeredContainer}>
          <AppText style={styles.errorText}>{lookupError}</AppText>
          <View style={styles.buttonContainer}>
            <Buttons
              primaryTitle="Retry"
              primaryOnPress={handleRetry}
              secondaryTitle={common.cancel}
              secondaryOnPress={() => navigation.goBack()}
            />
          </View>
        </View>
      );
    }

    if (!asset) {
      return null;
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.assetCard}>
          <View style={styles.row}>
            <AppText style={styles.label}>Name</AppText>
            <AppText style={styles.value}>{asset.name}</AppText>
          </View>
          {!!asset.ticker && (
            <View style={styles.row}>
              <AppText style={styles.label}>Ticker</AppText>
              <AppText style={styles.value}>{asset.ticker}</AppText>
            </View>
          )}
          {!!asset.assetType && (
            <View style={styles.row}>
              <AppText style={styles.label}>Type</AppText>
              <AppText style={styles.value}>{asset.assetType}</AppText>
            </View>
          )}
          {!!asset.details && (
            <View style={styles.descriptionRow}>
              <AppText style={styles.label}>Description</AppText>
              <AppText style={styles.descriptionValue}>{asset.details}</AppText>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Buttons
            primaryTitle={addMutation.isLoading ? 'Adding...' : 'Add to Wallet'}
            primaryOnPress={handleAddToWallet}
            disabled={addMutation.isLoading}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <ScreenContainer>
      <AppHeader title="Add Asset from Registry" />
      {renderContent()}
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: hp(20),
    },
    loadingText: {
      marginTop: hp(16),
      color: theme.colors.secondaryHeadingColor,
    },
    errorText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      marginBottom: hp(20),
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: hp(20),
      paddingVertical: hp(20),
    },
    assetCard: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: hp(16),
      padding: hp(20),
      gap: hp(12),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(4),
    },
    descriptionRow: {
      paddingVertical: hp(4),
    },
    label: {
      color: theme.colors.secondaryHeadingColor,
      flex: 1,
    },
    value: {
      color: theme.colors.headingColor,
      flex: 2,
      textAlign: 'right',
    },
    descriptionValue: {
      color: theme.colors.headingColor,
      marginTop: hp(4),
    },
    buttonContainer: {
      marginTop: hp(32),
    },
  });

export default RegistryAssetScreen;
