import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NodeService } from 'src/services/node/NodeService';
import { RgbNodeConnectParams } from 'src/models/interfaces/RGBWallet';

export const useNode = () => {
  const nodeService = NodeService.getInstance();
  const queryClient = useQueryClient();

  const connectToNodeMutation = useMutation(async () => {
    return await nodeService.connectToNode();
  });

  const checkRgbNodeConnectionMutation = useMutation(
    async (params: RgbNodeConnectParams) => {
      return await nodeService.checkRgbNodeConnection(params);
    }
  );

  const nodeInfoQuery = useQuery(['nodeInfo'], async () => {
    return await nodeService.viewNodeInfo();
  }, {
    retry: false,
    onError: () => {}
  });

  const saveNodeMnemonicMutation = useMutation(
    async ({ nodeId, authToken }: { nodeId: string; authToken: string }) => {
      return await nodeService.saveNodeMnemonic(nodeId, authToken);
    }
  );

  const startNodeMutation = useMutation(
    async ({ nodeId, authToken }: { nodeId: string; authToken: string }) => {
      return await nodeService.startNode(nodeId, authToken);
    }
  );

  const syncNodeMutation = useMutation(async () => {
    return await nodeService.syncNode();
  });

  const createSupportedNodeMutation = useMutation(async () => {
      return await nodeService.createSupportedNode();
  });

  const unlockNodeMutation = useMutation(async () => {
      return await nodeService.unlockNode();
  });

  const checkNodeStatusMutation = useMutation(async ({ nodeId, authToken }: { nodeId: string; authToken: string }) => {
      return await nodeService.checkNodeStatus(nodeId, authToken);
  });

  const getNodeOnchainBtcTransactionsMutation = useMutation(async () => {
    return await nodeService.getNodeOnchainBtcTransactions();
  });

  const getNodeOnchainBtcAddressMutation = useMutation(async () => {

      return await nodeService.getNodeOnchainBtcAddress();
  });

  return {
    checkNodeStatus: checkNodeStatusMutation,
    connectToNode: connectToNodeMutation,
    checkRgbNodeConnection: checkRgbNodeConnectionMutation,
    nodeInfo: nodeInfoQuery,
    saveNodeMnemonic: saveNodeMnemonicMutation,
    startNode: startNodeMutation,
    syncNode: syncNodeMutation,
    createSupportedNode: createSupportedNodeMutation,
    unlockNode: unlockNodeMutation,
    getNodeOnchainBtcAddress: getNodeOnchainBtcAddressMutation,
    getNodeOnchainBtcTransactions: getNodeOnchainBtcTransactionsMutation
  };

};
