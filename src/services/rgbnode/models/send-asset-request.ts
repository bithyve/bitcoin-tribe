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

 /**
 * 
 *
 * @export
 * @interface SendAssetRequest
 */
export interface SendAssetRequest {

    /**
     * @type {string}
     * @memberof SendAssetRequest
     * @example rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd
     */
    assetId?: string;

    /**
     * @type {number}
     * @memberof SendAssetRequest
     * @example 42
     */
    amount?: number;

    /**
     * @type {string}
     * @memberof SendAssetRequest
     * @example bcrt:utxob:2FZsSuk-iyVQLVuU4-Gc6J4qkE8-mLS17N4jd-MEx6cWz9F-MFkyE1n
     */
    recipientId?: string;

    /**
     * @type {boolean}
     * @memberof SendAssetRequest
     * @example false
     */
    donation?: boolean;

    /**
     * @type {number}
     * @memberof SendAssetRequest
     * @example 4.2
     */
    feeRate?: number;

    /**
     * @type {number}
     * @memberof SendAssetRequest
     * @example 1
     */
    minConfirmations?: number;

    /**
     * @type {Array<string>}
     * @memberof SendAssetRequest
     */
    transportEndpoints?: Array<string>;
}