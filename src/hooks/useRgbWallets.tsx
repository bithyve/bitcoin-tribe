import { RealmSchema } from 'src/storage/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useObject, useQuery } from '@realm/react';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';

type useRgbWalletsInterface = ({ walletIds }?: { walletIds?: string[] }) => {
  wallets: RGBWallet[];
};

const useRgbWallets: useRgbWalletsInterface = ({ walletIds = [] } = {}) => {
  const wallets: RGBWallet[] = useQuery(
    RealmSchema.RgbWallet,
  ) as unknown as RGBWallet[];

  if (walletIds && walletIds.length) {
    const requestedWallets = [];
    for (let index = 0; index < walletIds.length; index += 1) {
      const id = walletIds[index];
      const wallet: RGBWallet = useObject(RealmSchema.RgbWallet, id);
      if (wallet) {
        requestedWallets.push(wallet);
      }
    }
    return {
      wallets: requestedWallets.map(
        getJSONFromRealmObject,
      ) as unknown as RGBWallet[],
    };
  }

  return {
    wallets: wallets.map(getJSONFromRealmObject) as unknown as RGBWallet[],
  };
};

export default useRgbWallets;
