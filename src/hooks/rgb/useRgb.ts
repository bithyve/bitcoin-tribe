import { useMutation, useQuery } from 'react-query';
import { RgbService } from 'src/services/rgb/RgbService';
import { Asset } from 'src/models/interfaces/RGBWallet';


export const useRgb = () => {
  const rgbService = RgbService.getInstance();

  const channelsQuery = useQuery(['channels'], async () => {
    return await rgbService.getChannels();
  });

  const listPaymentsQuery = useQuery(['payments'], async () => {
    return await rgbService.listPayments();
  });

  const openChannelMutation = useMutation(async (params: any) => {
    return await rgbService.openChannel(params);
  });

  const closeChannelMutation = useMutation(
    async (params: { channelId: string; peerPubKey: number }) => {
      return await rgbService.closeChannel(params);
    }
  );

  const getChannelsMutation = useMutation(async () => {
    return await rgbService.getChannels();
  });

  const listPaymentsMutation = useMutation(async () => {
    return await rgbService.listPayments();
  });

  const claimCampaignMutation = useMutation(

    async ({
      campaignId,
      mode,
    }: {
      campaignId: string;
      mode: 'WITNESS' | 'BLINDED';
    }) => {
      return await rgbService.claimCampaign(campaignId, mode);
    }
  );

  const fetchPresetAssetsMutation = useMutation(async () => {
    return await rgbService.fetchPresetAssets();
  });

  const refreshRgbWalletMutation = useMutation(async () => {
    return await rgbService.refreshRgbWallet();
  });

  const viewUtxosMutation = useMutation(async () => {
    return await rgbService.viewUtxos();
  });

  const getAssetTransactionsMutation = useMutation(async (params: any) => {
    return await rgbService.getAssetTransactions(params);
  });

  const searchAssetFromRegistryMutation = useMutation(async (params: {
    query: string;
  }) => {
    return await rgbService.searchAssetFromRegistry(params.query);
  });

  const receiveAssetMutation = useMutation(async (params: {

    assetId?: string;
    amount?: number;
    linkedAsset?: string;
    linkedAmount?: number;
    expiry?: number;
    blinded?: boolean;
    transportEndpoints?: string[];
    useWatchTower?: boolean;
  }) => {
    return await rgbService.receiveAsset(params);
  });

  const receiveAssetOnLNMutation = useMutation(async (params: {

    assetId?: string;
    amount?: number;
    expiry?: number;
  }) => {
    return await rgbService.receiveAssetOnLN(params);
  });

  const createUtxosMutation = useMutation(async () => {
    return await rgbService.createUtxos();
  });

  const issueNewCoinMutation = useMutation(async (params: {
    name: string;
    ticker: string;
    supply: string;
    precision: number;
  }) => {
    return await rgbService.issueNewCoin(params);
  });

  const issueNewCollectionMutation = useMutation(async (params: {
    name: string;
    ticker?: string;
    details: string;
    totalSupplyAmt: number;
    isFixedSupply: boolean;
    mediaFilePath: string;
    attachmentsFilePaths: string[];
    createUtxos: boolean;
  }) => {
    return await rgbService.issueNewCollection(params);
  });

  const issueNewCollectibleMutation = useMutation(async (params: {
    name: string;
    description: string;
    supply: string;
    filePath: string;
    precision: number;
  }) => {
    return await rgbService.issueNewCollectible(params);
  });

  const issueAssetUdaMutation = useMutation(async (params: {
    name: string;
    ticker: string;
    details: string;
    mediaFilePath: string;
    attachmentsFilePaths: string[];
  }) => {
    return await rgbService.issueAssetUda(params);
  });

  const handleTransferFailureMutation = useMutation(async (params: {
    batchTransferIdx: number;
    noAssetOnly: boolean;
  }) => {
    return await rgbService.handleTransferFailure(
      params.batchTransferIdx,
      params.noAssetOnly
    );
  });

  const payServiceFeeMutation = useMutation(async (params: {
    feeDetails: any;
    feeType: any;
    collectionId: string;
  }) => {
    return await rgbService.payServiceFee(params);
  });

  const mintCollectionItemMutation = useMutation(async (params: {
    name: string;
    ticker: string;
    details: string;
    mediaFilePath: string;
    attachmentsFilePaths: string[];
    collectionId: string;
  }) => {
    return await rgbService.mintCollectionItem(params);
  });

  const validateTweetForAssetMutation = useMutation(async (params: {
    tweetId: string;
    assetId: string;
    schema: any; // RealmSchema
    asset: Asset;
  }) => {
    return await rgbService.validateTweetForAsset(
      params.tweetId,
      params.assetId,
      params.schema,
      params.asset,
    );
  });

  return {
    fetchPresetAssets: fetchPresetAssetsMutation,
    refreshRgbWallet: refreshRgbWalletMutation,
    viewUtxos: viewUtxosMutation,
    getAssetTransactions: getAssetTransactionsMutation,
    listPayments: listPaymentsMutation,
    listPaymentsQuery: listPaymentsQuery,
    openChannel: openChannelMutation,
    closeChannel: closeChannelMutation,
    claimCampaign: claimCampaignMutation,
    receiveAssetOnLN: receiveAssetOnLNMutation,
    receiveAsset: receiveAssetMutation,
    searchAssetFromRegistry: searchAssetFromRegistryMutation,
    createUtxos: createUtxosMutation,
    getChannels: getChannelsMutation,
    channelsQuery: channelsQuery,



    issueNewCoin: issueNewCoinMutation,
    issueNewCollection: issueNewCollectionMutation,
    issueNewCollectible: issueNewCollectibleMutation,
    issueAssetUda: issueAssetUdaMutation,
    handleTransferFailure: handleTransferFailureMutation,
    payServiceFee: payServiceFeeMutation,
    mintCollectionItem: mintCollectionItemMutation,
    validateTweetForAsset: validateTweetForAssetMutation,
  };
};
