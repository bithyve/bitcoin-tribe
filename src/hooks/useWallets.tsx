import { Wallet } from 'src/services/wallets/interfaces/wallet';
// import { useObject, useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import realm from 'src/storage/realm/realm';

type useWalletsInterface = ({ walletIds }?: { walletIds?: string[] }) => {
  wallets: Wallet[];
};

const useWallets: useWalletsInterface = ({ walletIds = [] } = {}) => {
  // TODO: use hooks once realm/react is setup
  //   const wallets: Wallet[] = useQuery(RealmSchema.Wallet) as unknown as Wallet[];
  const wallets: Wallet[] = realm.get(
    RealmSchema.Wallet,
  ) as unknown as Wallet[];

  //   if (walletIds && walletIds.length) {
  //     const requestedWallets = [];
  //     for (let index = 0; index < walletIds.length; index += 1) {
  //       const id = walletIds[index];
  //       const wallet: Wallet = useObject(RealmSchema.Wallet, id);
  //       if (wallet) {
  //         requestedWallets.push(wallet);
  //       }
  //     }
  //     return {
  //       wallets: requestedWallets.map(
  //         getJSONFromRealmObject,
  //       ) as unknown as Wallet[],
  //     };
  //   }

  return {
    wallets: wallets.map(getJSONFromRealmObject) as unknown as Wallet[],
  };
};

export default useWallets;
