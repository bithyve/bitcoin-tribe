import { useMutation, useQueryClient } from 'react-query';
import { WalletService } from 'src/services/wallet/WalletService';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

import {
  AverageTxFees,
  TransactionPrerequisite,
} from 'src/services/wallets/interfaces';
import { TxPriority } from 'src/services/wallets/enums';

export const useWallet = () => {
  const walletService = WalletService.getInstance();
  const queryClient = useQueryClient();

  // Mutation to refresh wallet
  const refreshWalletsMutation = useMutation(
    async ({ wallets, metaData }: { wallets: Wallet[]; metaData?: Object }) => {
      return await walletService.refreshWallets(wallets, metaData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wallets']);
      },
    }
  );

  // Mutation to prepare transaction (Phase 1)
  const prepareTransactionMutation = useMutation(
    async (params: {
      sender: Wallet;
      recipient: { address: string; amount: number };
      averageTxFee: AverageTxFees;
      selectedPriority: TxPriority;
      customFeePerByte?: number;
    }) => {
      return await walletService.prepareTransaction(params);
    }
  );


  // Mutation to broadcast transaction (Phase 2)
  const broadcastTransactionMutation = useMutation(
    async (params: {
      sender: Wallet;
      recipient: { address: string; amount: number };
      txPrerequisites: TransactionPrerequisite;
      txPriority: TxPriority;
    }) => {
      return await walletService.broadcastTransaction(params);
    }
  );

  // Mutation to get node onchain transactions
  // This seems to be a mutation in the original code, possibly because it triggers a sync/fetch
  const getNodeOnchainBtcTransactionsMutation = useMutation(async () => {
      return await walletService.getNodeOnchainBtcTransactions();
  });

  const getFeeAndExchangeRatesMutation = useMutation(async () => {
    return await walletService.getFeeAndExchangeRates();
  });

  // Mutation to update transaction
  const receiveTestSatsMutation = useMutation(async () => {
    return await walletService.receiveTestSats();
  });

  const updateTransactionMutation = useMutation(async (params: {

    txid: string;
    updateProps: {
      metadata?: {
        assetId?: string;
        note?: string;
      };
      status?: string;
    };
  }) => {
    return await walletService.updateTransaction(params);
  });

  // Mutation to update wallet profile
  const updateProfileMutation = useMutation(
    async (params: { appId: string; name: string; image: any }) => {
      return await walletService.updateProfile(params.appId, params.name, params.image);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([RealmSchema.TribeApp]);
      },
    }
  );

  // Mutation to remove wallet picture
  const removeWalletPictureMutation = useMutation(
    async ({ appID }: { appID: string }) => {
      return await walletService.removeWalletPicture(appID);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([RealmSchema.TribeApp]);
      },
    }
  );

  return {
    getFeeAndExchangeRates: getFeeAndExchangeRatesMutation,
    refreshWallets: refreshWalletsMutation,
    prepareTransaction: prepareTransactionMutation,
    broadcastTransaction: broadcastTransactionMutation,
    getNodeOnchainBtcTransactions: getNodeOnchainBtcTransactionsMutation,
    updateTransaction: updateTransactionMutation,
    receiveTestSats: receiveTestSatsMutation,
    updateProfile: updateProfileMutation,
    removeWalletPicture: removeWalletPictureMutation,
  };



};
