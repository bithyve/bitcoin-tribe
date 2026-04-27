type NetworkServicesDeps = {
  getBitcoinNetwork: () => any;
  getElectrumUrl: (network: any) => string;
  loadGithubReleaseNotes: (fullVersion: string) => Promise<any>;
  fetchGithubRelease: () => Promise<any>;
};

function createDefaultDeps(): NetworkServicesDeps {
  return {
    getBitcoinNetwork: () => {
      const { NetworkService } = require('./networkService');
      return NetworkService.getBitcoinNetwork();
    },
    getElectrumUrl: network => {
      const { NetworkService } = require('./networkService');
      return NetworkService.getElectrumUrl(network);
    },
    loadGithubReleaseNotes: async fullVersion => {
      const { NetworkService } = require('./networkService');
      return NetworkService.loadGithubReleaseNotes(fullVersion);
    },
    fetchGithubRelease: async () => {
      const { NetworkService } = require('./networkService');
      return NetworkService.fetchGithubRelease();
    },
  };
}

const defaultDeps: NetworkServicesDeps = createDefaultDeps();

let deps: NetworkServicesDeps = { ...defaultDeps };

export function setNetworkServicesTestDeps(overrides: Partial<NetworkServicesDeps>) {
  deps = {
    ...deps,
    ...overrides,
  };
}

export function resetNetworkServicesTestDeps() {
  deps = createDefaultDeps();
}

export const getBitcoinNetwork = () => {
  return deps.getBitcoinNetwork();
};

export const getElectrumUrl = (network: any): string => {
  return deps.getElectrumUrl(network);
};

export const loadGithubReleaseNotes = async (fullVersion: string) => {
  return deps.loadGithubReleaseNotes(fullVersion);
};

export const fetchGithubRelease = async () => {
  return deps.fetchGithubRelease();
};
