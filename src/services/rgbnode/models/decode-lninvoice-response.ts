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

import { BitcoinNetwork } from './bitcoin-network';
 /**
 * 
 *
 * @export
 * @interface DecodeLNInvoiceResponse
 */
export interface DecodeLNInvoiceResponse {

    /**
     * @type {number}
     * @memberof DecodeLNInvoiceResponse
     * @example 3000000
     */
    amtMsat?: number;

    /**
     * @type {number}
     * @memberof DecodeLNInvoiceResponse
     * @example 420
     */
    expirySec?: number;

    /**
     * @type {number}
     * @memberof DecodeLNInvoiceResponse
     * @example 1691160659
     */
    timestamp?: number;

    /**
     * @type {string}
     * @memberof DecodeLNInvoiceResponse
     * @example rgb:2dkSTbr-jFhznbPmo-TQafzswCN-av4gTsJjX-ttx6CNou5-M98k8Zd
     */
    assetId?: string;

    /**
     * @type {number}
     * @memberof DecodeLNInvoiceResponse
     * @example 42
     */
    assetAmount?: number;

    /**
     * @type {string}
     * @memberof DecodeLNInvoiceResponse
     * @example 5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938
     */
    paymentHash?: string;

    /**
     * @type {string}
     * @memberof DecodeLNInvoiceResponse
     * @example f9fa239a283a72fa351ec6d0d6fdb16f5e59a64cb10e64add0b57123855ff592
     */
    paymentSecret?: string;

    /**
     * @type {string}
     * @memberof DecodeLNInvoiceResponse
     * @example 0343851df9e0e8aff0c10b3498ce723ff4c9b4a855e6c8819adcafbbb3e24ea2af
     */
    payeePubkey?: string;

    /**
     * @type {BitcoinNetwork}
     * @memberof DecodeLNInvoiceResponse
     */
    network?: BitcoinNetwork;
}