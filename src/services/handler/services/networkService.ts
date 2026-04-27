import { NetworkType } from 'src/services/wallets/enums';
import config from 'src/utils/config';
import DeviceInfo from 'react-native-device-info';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { BitcoinNetwork } from 'orbis1-sdk-rn';

export class NetworkService {
  static getBitcoinNetwork(): BitcoinNetwork {
    switch (config.NETWORK_TYPE) {
      case NetworkType.MAINNET:
        return BitcoinNetwork.MAINNET;
      case NetworkType.TESTNET:
        return BitcoinNetwork.TESTNET;
      case NetworkType.REGTEST:
        return BitcoinNetwork.REGTEST;
      case NetworkType.TESTNET4:
        return BitcoinNetwork.TESTNET4;
      default:
        return BitcoinNetwork.TESTNET;
    }
  }

  static getElectrumUrl(network: BitcoinNetwork): string {
    return network === BitcoinNetwork.TESTNET
      ? 'ssl://electrum.iriswallet.com:50013'
      : network === BitcoinNetwork.TESTNET4
        ? 'ssl://electrum.iriswallet.com:50053'
        : network === BitcoinNetwork.REGTEST
          ? 'electrum.rgbtools.org:50041'
          : 'ssl://electrum.iriswallet.com:50003';
  }

  static async loadGithubReleaseNotes(fullVersion: string) {
    try {
      const version = fullVersion.split('(')[0];
      const githubReleaseUrl = `https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v${version}`;
      const response = await fetch(githubReleaseUrl);
      if (!response.ok) {
        return {
          releaseNote: '',
        };
      }
      const releaseData = (await response.json()) as { body?: string };
      dbManager.updateObjectByPrimaryId(
        RealmSchema.VersionHistory,
        'version',
        fullVersion,
        {
          releaseNote: releaseData.body || '',
        },
      );
      return {
        releaseNote: releaseData.body || '',
      };
    } catch (error) {
      return {
        releaseNote: '',
      };
    }
  }

  static async fetchGithubRelease() {
    try {
      const githubReleaseUrl = `https://api.github.com/repos/bithyve/bitcoin-tribe/releases/tags/v${DeviceInfo.getVersion()}`;
      const response = await fetch(githubReleaseUrl);
      if (!response.ok) {
        return {
          releaseNote: '',
        };
      }
      const releaseData = (await response.json()) as { body?: string };
      return {
        releaseNote: releaseData.body || '',
      };
    } catch (error) {
      console.error('Error fetching GitHub release data:', error);
      return {
        releaseNote: '',
      };
    }
  }
}
