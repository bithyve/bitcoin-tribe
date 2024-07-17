import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useObject, useQuery } from '@realm/react';

type useWalletsInterface = ({ walletIds }?: { walletIds?: string[] }) => {
  wallets: Wallet[];
};

const useWallets: useWalletsInterface = ({ walletIds = [] } = {}) => {
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet) as unknown as Wallet[];

  if (walletIds && walletIds.length) {
    const requestedWallets = [];
    for (let index = 0; index < walletIds.length; index += 1) {
      const id = walletIds[index];
      const wallet: Wallet = useObject(RealmSchema.Wallet, id);
      if (wallet) {
        requestedWallets.push(wallet);
      }
    }
    return {
      wallets: requestedWallets.map(
        getJSONFromRealmObject,
      ) as unknown as Wallet[],
    };
  }

  return {
    wallets: wallets.map(getJSONFromRealmObject) as unknown as Wallet[],
  };
};

export default useWallets;
