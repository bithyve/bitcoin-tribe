import config from 'src/utils/config';
import RestClient from '../rest/RestClient';
import { NetworkType } from '../wallets/enums';

export default class Relay {
  public static getTestcoins = async (
    recipientAddress: string,
    network: any,
  ): Promise<{
    txid: any;
    funded: any;
  }> => {
    if (network === NetworkType.MAINNET) {
      throw new Error('Invalid network: failed to fund via testnet');
    }

    try {
      const res = await RestClient.post(`${config.RELAY}testnetFaucet`, {
        recipientAddress,
      });
      const { txid, funded } = res.data;
      return {
        txid,
        funded,
      };
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.err);
      } else if (err.code) {
        throw new Error(err.code);
      }
    }
  };
}
