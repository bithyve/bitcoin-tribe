import { BitcoinNetwork } from 'orbis1-sdk-rn';
import { NetworkService } from './networkService';

export const getBitcoinNetwork = (): BitcoinNetwork => {
  return NetworkService.getBitcoinNetwork();
};

export const getElectrumUrl = (network: BitcoinNetwork): string => {
  return NetworkService.getElectrumUrl(network);
};

export const loadGithubReleaseNotes = async (fullVersion: string) => {
  return NetworkService.loadGithubReleaseNotes(fullVersion);
};

export const fetchGithubRelease = async () => {
  return NetworkService.fetchGithubRelease();
};
