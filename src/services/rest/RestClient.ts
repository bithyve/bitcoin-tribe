import axios, { AxiosResponse } from 'axios';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import config from 'src/utils/config';

const { HEXA_ID } = config;

class RestClient {
  public static headers: object;

  subscribers = [];

  constructor() {
    RestClient.headers = {
      'HEXA-ID': HEXA_ID,
      HEXA_ID,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      os: Platform.OS,
    };
  }

  getCommonHeaders(): object {
    return RestClient.headers;
  }

  getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }

  async post(
    path: string,
    body: object,
    headers?: object,
  ): Promise<AxiosResponse> {
    return axios.post(path, body, {
      headers: {
        ...RestClient.headers,
        ...headers,
      },
    });
  }

  async put(
    path: string,
    body: object,
    headers?: object,
  ): Promise<AxiosResponse> {
    return axios.put(path, body, {
      headers: {
        ...RestClient.headers,
        ...headers,
      },
    });
  }

  async get(path: string, headers?: object): Promise<AxiosResponse> {
    return axios.get(path, {
      headers: {
        ...RestClient.headers,
        ...headers,
      },
    });
  }
}

export default new RestClient();
