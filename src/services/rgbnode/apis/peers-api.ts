/* tslint:disable */
/* eslint-disable */
/**
 * RGB Lightning Node
 * This is the OpenAPI specification for the [RGB Lightning Node](https://github.com/RGB-Tools/rgb-lightning-node) APIs.
 *
 * OpenAPI spec version: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import globalAxios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
import { ConnectPeerRequest } from '../models';
import { DisconnectPeerRequest } from '../models';
import { EmptyResponse } from '../models';
import { ListPeersResponse } from '../models';
/**
 * PeersApi - axios parameter creator
 * @export
 */
export const PeersApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Connect to the provided LN peer
         * @summary Connect to a peer
         * @param {ConnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        connectpeerPost: async (body?: ConnectPeerRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/connectpeer`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            if (configuration && configuration.accessToken) {
                const accessToken = typeof configuration.accessToken === 'function'
                    ? await configuration.accessToken()
                    : await configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + accessToken;
            }

            localVarHeaderParameter['Content-Type'] = 'application/json';

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            const needsSerialization = (typeof body !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : (body || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * Disconnect from the provided LN peer
         * @summary Disconnect from a peer
         * @param {DisconnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        disconnectpeerPost: async (body?: DisconnectPeerRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/disconnectpeer`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            if (configuration && configuration.accessToken) {
                const accessToken = typeof configuration.accessToken === 'function'
                    ? await configuration.accessToken()
                    : await configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + accessToken;
            }

            localVarHeaderParameter['Content-Type'] = 'application/json';

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            const needsSerialization = (typeof body !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : (body || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * List the node's LN peers
         * @summary List peers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listpeersGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/listpeers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            if (configuration && configuration.accessToken) {
                const accessToken = typeof configuration.accessToken === 'function'
                    ? await configuration.accessToken()
                    : await configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + accessToken;
            }

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * PeersApi - functional programming interface
 * @export
 */
export const PeersApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Connect to the provided LN peer
         * @summary Connect to a peer
         * @param {ConnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async connectpeerPost(body?: ConnectPeerRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<EmptyResponse>>> {
            const localVarAxiosArgs = await PeersApiAxiosParamCreator(configuration).connectpeerPost(body, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Disconnect from the provided LN peer
         * @summary Disconnect from a peer
         * @param {DisconnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async disconnectpeerPost(body?: DisconnectPeerRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<EmptyResponse>>> {
            const localVarAxiosArgs = await PeersApiAxiosParamCreator(configuration).disconnectpeerPost(body, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * List the node's LN peers
         * @summary List peers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listpeersGet(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<ListPeersResponse>>> {
            const localVarAxiosArgs = await PeersApiAxiosParamCreator(configuration).listpeersGet(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * PeersApi - factory interface
 * @export
 */
export const PeersApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Connect to the provided LN peer
         * @summary Connect to a peer
         * @param {ConnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async connectpeerPost(body?: ConnectPeerRequest, options?: AxiosRequestConfig): Promise<AxiosResponse<EmptyResponse>> {
            return PeersApiFp(configuration).connectpeerPost(body, options).then((request) => request(axios, basePath));
        },
        /**
         * Disconnect from the provided LN peer
         * @summary Disconnect from a peer
         * @param {DisconnectPeerRequest} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async disconnectpeerPost(body?: DisconnectPeerRequest, options?: AxiosRequestConfig): Promise<AxiosResponse<EmptyResponse>> {
            return PeersApiFp(configuration).disconnectpeerPost(body, options).then((request) => request(axios, basePath));
        },
        /**
         * List the node's LN peers
         * @summary List peers
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listpeersGet(options?: AxiosRequestConfig): Promise<AxiosResponse<ListPeersResponse>> {
            return PeersApiFp(configuration).listpeersGet(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * PeersApi - object-oriented interface
 * @export
 * @class PeersApi
 * @extends {BaseAPI}
 */
export class PeersApi extends BaseAPI {
    /**
     * Connect to the provided LN peer
     * @summary Connect to a peer
     * @param {ConnectPeerRequest} [body] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PeersApi
     */
    public async connectpeerPost(body?: ConnectPeerRequest, options?: AxiosRequestConfig) : Promise<AxiosResponse<EmptyResponse>> {
        return PeersApiFp(this.configuration).connectpeerPost(body, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * Disconnect from the provided LN peer
     * @summary Disconnect from a peer
     * @param {DisconnectPeerRequest} [body] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PeersApi
     */
    public async disconnectpeerPost(body?: DisconnectPeerRequest, options?: AxiosRequestConfig) : Promise<AxiosResponse<EmptyResponse>> {
        return PeersApiFp(this.configuration).disconnectpeerPost(body, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * List the node's LN peers
     * @summary List peers
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PeersApi
     */
    public async listpeersGet(options?: AxiosRequestConfig) : Promise<AxiosResponse<ListPeersResponse>> {
        return PeersApiFp(this.configuration).listpeersGet(options).then((request) => request(this.axios, this.basePath));
    }
}
