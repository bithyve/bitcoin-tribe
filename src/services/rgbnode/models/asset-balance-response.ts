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
 * @interface AssetBalanceResponse
 */
export interface AssetBalanceResponse {

    /**
     * @type {number}
     * @memberof AssetBalanceResponse
     * @example 777
     */
    settled?: number;

    /**
     * @type {number}
     * @memberof AssetBalanceResponse
     * @example 777
     */
    future?: number;

    /**
     * @type {number}
     * @memberof AssetBalanceResponse
     * @example 777
     */
    spendable?: number;

    /**
     * @type {number}
     * @memberof AssetBalanceResponse
     * @example 444
     */
    offchainOutbound?: number;

    /**
     * @type {number}
     * @memberof AssetBalanceResponse
     * @example 0
     */
    offchainInbound?: number;
}