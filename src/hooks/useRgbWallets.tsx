import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';

type useRgbWalletsInterface = ({ walletIds }?: { walletIds?: string[] }) => {
  wallets: RGBWallet[];
};

const useRgbWallets: useRgbWalletsInterface = ({ walletIds = [] } = {}) => {
  const wallets: RGBWallet[] = useQuery(
    RealmSchema.RgbWallet,
  ) as unknown as RGBWallet[];

  const filteredWallets = walletIds && walletIds.length
    ? wallets.filter(w => walletIds.includes(w.mnemonic))
    : wallets;

  return {
    wallets: filteredWallets.map(
      getJSONFromRealmObject,
    ) as unknown as RGBWallet[],
  };
};

export default useRgbWallets;
