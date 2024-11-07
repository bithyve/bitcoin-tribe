//
//  Constants.swift
//  HEXA
//
//  Created by Shashank Shinde on 27/06/23.
//

import Foundation

struct Constants{
  static let rgbDirName = ".rgb"
  static let bdkDirName = "bdk"

  static let testnetElectrumUrl = "ssl://electrum.iriswallet.com:50013"
  static let regtestElectrumUrl = ""
  static let mainnetElectrumUrl = "electrum.acinq.co:50002"
  static let rgbHttpJsonRpcProtocol = "rgbhttpjsonrpc:"
  static let proxyURL = "https://proxy.iriswallet.com/json-rpc"
  static let proxyConsignmentEndpoint = "rpcs://proxy.iriswallet.com/0.2/json-rpc"
  static let satsForRgb = 9000
  static let defaultFeeRate = 58.0
  static let rgbBlindDuration = UInt32(86400)
  static let backupName = "%@.rgb_backup"
  
  public static func getElectrumUrl(network: String) -> String {
      switch network {
      case "TESTNET":
        return testnetElectrumUrl
      case "REGTEST":
        return regtestElectrumUrl
      case "MAINNET":
        return mainnetElectrumUrl
      default:
        return testnetElectrumUrl
      }
  }

}
