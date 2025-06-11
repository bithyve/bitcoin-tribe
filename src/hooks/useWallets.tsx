import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';

type useWalletsInterface = ({ walletIds }?: { walletIds?: string[] }) => {
  wallets: Wallet[];
};

const useWallets: useWalletsInterface = ({ walletIds = [] } = {}) => {
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet) as unknown as Wallet[];

  const filteredWallets = walletIds && walletIds.length
    ? wallets.filter(w => walletIds.includes(w.id))
    : wallets;

  return {
    wallets: filteredWallets.map(
      getJSONFromRealmObject,
    ) as unknown as Wallet[],
  };
};

export default useWallets;
