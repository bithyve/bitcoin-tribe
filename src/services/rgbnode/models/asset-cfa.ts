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

import { AssetIface } from './asset-iface';
import { BtcBalance } from './btc-balance';
import { Media } from './media';
 /**
 * 
 *
 * @export
 * @interface AssetCFA
 */
export interface AssetCFA {

    /**
     * @type {string}
     * @memberof AssetCFA
     * @example rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd
     */
    assetId?: string;

    /**
     * @type {AssetIface}
     * @memberof AssetCFA
     */
    assetIface?: AssetIface;

    /**
     * @type {string}
     * @memberof AssetCFA
     * @example Collectible
     */
    name?: string;

    /**
     * @type {string}
     * @memberof AssetCFA
     * @example asset details
     */
    details?: string;

    /**
     * @type {number}
     * @memberof AssetCFA
     * @example 0
     */
    precision?: number;

    /**
     * @type {number}
     * @memberof AssetCFA
     * @example 777
     */
    issuedSupply?: number;

    /**
     * @type {number}
     * @memberof AssetCFA
     * @example 1691160565
     */
    timestamp?: number;

    /**
     * @type {number}
     * @memberof AssetCFA
     * @example 1691161979
     */
    addedAt?: number;

    /**
     * @type {BtcBalance}
     * @memberof AssetCFA
     */
    balance?: BtcBalance;

    /**
     * @type {Media}
     * @memberof AssetCFA
     */
    media?: Media;
}
