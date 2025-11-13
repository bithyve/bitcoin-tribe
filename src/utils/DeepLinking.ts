import config, { APP_STAGE } from 'src/utils/config';
import { objectToUrlParams, urlParamsToObject } from 'src/utils/urlUtils';

export enum DeepLinkFeature {
  COLLECTION = 'collection',
  COLLECTION_ITEM = 'collectionitem',
  COMMUNITY = 'community',
  REGISTRY = 'registry',
}

export enum DeepLinkType {
  UNIVERSAL = 'universal',
  APP_LINK = 'applink',
}

export default class Deeplinking {
  public static scheme: string =
      `https://bitcointribe.app/app/${config.ENVIRONMENT === APP_STAGE.DEVELOPMENT ? 'dev' : 'prod'}`   
  public static appLinkScheme = config.ENVIRONMENT === APP_STAGE.DEVELOPMENT ? 'tribedev' : 'tribe';     

  public static buildUrl(
    feature: DeepLinkFeature,
    params?: Record<string, any>,
    type: DeepLinkType = DeepLinkType.UNIVERSAL,
  ): string {
    const query = params ? objectToUrlParams(params) : '';
    if (type === DeepLinkType.UNIVERSAL) {
      return `${Deeplinking.scheme}/${feature}${query ? `?${query}` : ''}`;
    } else if (type === DeepLinkType.APP_LINK) {
      return `${Deeplinking.appLinkScheme}://${feature}${query ? `?${query}` : ''}`;
    }
    return '';
  }

  public static processDeepLink(url: string): {
    isValid: boolean;
    feature?: DeepLinkFeature;
    params?: Record<string, any>;
  } {
    const appLinkPrefix = `${Deeplinking.appLinkScheme}://`;

    let urlWithoutScheme: string | undefined;
    if (url.startsWith(appLinkPrefix)) {
      urlWithoutScheme = url.substring(appLinkPrefix.length);
    } else if (url.startsWith(Deeplinking.scheme)) {
      urlWithoutScheme = url.substring(Deeplinking.scheme.length);
    }

    if (!urlWithoutScheme) {
      return { isValid: false, feature: undefined, params: undefined };
    }

    urlWithoutScheme = urlWithoutScheme.replace(/^\/+/, '');
    const [pathAndQuery] = urlWithoutScheme.split('#');
    const [path, queryString] = pathAndQuery.split('?');
    const feature = path.replace(/^\//, '') as DeepLinkFeature | undefined;
    const params = queryString ? urlParamsToObject(queryString) : {};
    
    if (!feature) {
      return { isValid: false, feature: undefined, params: undefined };
    }
    return { isValid: true, feature, params };
  }
}
