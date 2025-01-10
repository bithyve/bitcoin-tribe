import React, { useContext, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@realm/react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { RealmSchema } from 'src/storage/enum';
import { Asset, Coin } from 'src/models/interfaces/RGBWallet';
import SelectAssetToSendContainer from './components/SelectAssetToSendContainer';
import { useRoute } from '@react-navigation/native';

function SelectAssetToSend() {
  const theme: AppTheme = useTheme();
  const { wallet, rgbInvoice, assetID, transactionAmount } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Coin[]>(RealmSchema.Collectible);
  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  const filteredData = assetID
    ? assetsData.filter(item => item.assetId === assetID)
    : assetsData;

  return (
    <ScreenContainer>
      <AppHeader title={assets.selectAssetTitle} />
      <SelectAssetToSendContainer
        assetsData={filteredData}
        wallet={wallet}
        rgbInvoice={rgbInvoice}
        transactionAmount={transactionAmount}
      />
    </ScreenContainer>
  );
}
export default SelectAssetToSend;
