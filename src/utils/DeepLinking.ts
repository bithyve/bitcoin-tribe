import config, { APP_STAGE } from 'src/utils/config';
import { objectToUrlParams, urlParamsToObject } from 'src/utils/urlUtils';

export enum DeepLinkFeature {
  COLLECTION = 'collection',
  COLLECTION_ITEM = 'collectionitem',
  COMMUNITY = 'community',
  REGISTRY = 'registry',
}

export default class Deeplinking {
  public static scheme: string =
    config.ENVIRONMENT === APP_STAGE.DEVELOPMENT ? 'tribedev' : 'tribe';

  public static buildUrl(
    feature: DeepLinkFeature,
    params?: Record<string, any>,
  ): string {
    const query = params ? objectToUrlParams(params) : '';
    return `${Deeplinking.scheme}://${feature}${query ? `?${query}` : ''}`;
  }

  public static processDeepLink(url: string): {
    isValid: boolean;
    feature?: DeepLinkFeature;
    params?: Record<string, any>;
  } {
    if (!url.startsWith(Deeplinking.scheme)) {
      return { isValid: false, feature: undefined, params: undefined };
    }    
    const urlWithoutScheme = url.replace(`${Deeplinking.scheme}://`, '');
    const [pathAndQuery] = urlWithoutScheme.split('#');
    const [path, queryString] = pathAndQuery.split('?');
    
    const feature = path as DeepLinkFeature | undefined;
    const params = queryString ? urlParamsToObject(queryString) : {};
    
    if (!feature) {
      return { isValid: false, feature: undefined, params: undefined };
    }
    return { isValid: true, feature, params };
  }
}
