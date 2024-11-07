import config from 'src/utils/config';
import RestClient from '../rest/RestClient';
import { NetworkType } from '../wallets/enums';
import { AverageTxFeesByNetwork } from '../wallets/interfaces';

const { HEXA_ID, RELAY } = config;
export default class Relay {
  public static getRegtestSats = async (address: string, amount: number) => {};

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
      if (network === NetworkType.REGTEST) {
        await this.getRegtestSats(recipientAddress, 1);
        return { funded: true, txid: '' };
      } else {
        const res = await RestClient.post(`${RELAY}testnetFaucet`, {
          recipientAddress,
        });
        const { txid, funded } = res.data;
        return {
          txid,
          funded,
        };
      }
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.err);
      } else if (err.code) {
        throw new Error(err.code);
      }
    }
  };

  public static fetchFeeAndExchangeRates = async (): Promise<{
    exchangeRates: any;
    averageTxFees: AverageTxFeesByNetwork;
  }> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}fetchFeeAndExchangeRates`, {
          HEXA_ID,
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      const { exchangeRates, averageTxFees } = res.data || res.json;

      return {
        exchangeRates,
        averageTxFees,
      };
    } catch (err) {
      throw new Error('Failed fetch fee and exchange rates');
    }
  };
}
