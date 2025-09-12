//
//  RgbManager.swift
//
//  Created by Shashank Shinde
//

import Foundation
// import RgbLib

class RgbManager {
  
  static let shared = RgbManager()
  var rgbWallet: Wallet?
  var rgbNetwork: BitcoinNetwork?
  var online: Online?
  
  private init() {
    self.rgbWallet = nil
    self.online = nil
  }
  
  func initialize(bitcoinNetwork: String, accountXpubVanilla: String, accountXpubColored: String, mnemonic: String, masterFingerprint: String)-> String{
    let network = RgbManager.getRgbNetwork(network: bitcoinNetwork)
    do{
      let walletData = WalletData(dataDir: Utility.getRgbDir()?.path ?? "", bitcoinNetwork: network, databaseType: DatabaseType.sqlite,maxAllocationsPerUtxo: 1, accountXpubVanilla: accountXpubVanilla, accountXpubColored: accountXpubColored, mnemonic: mnemonic,masterFingerprint: masterFingerprint, vanillaKeychain: 0, supportedSchemas: [AssetSchema.cfa, AssetSchema.nia, AssetSchema.uda])
      self.rgbWallet = try Wallet(walletData: walletData)
      self.online = try rgbWallet?.goOnline(skipConsistencyCheck: true, indexerUrl: Constants.shared.getElectrumUrl(network: bitcoinNetwork))
      self.rgbNetwork = network
      let data: [String: Any] = [
          "status": true,
          "error": ""
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
    }catch{
      print("initialize: error \(error)")
      self.rgbWallet = nil
      let data: [String: Any] = [
          "status": false,
          "error": error.localizedDescription
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
    }
  }
  
  public static func getRgbNetwork(network: String) -> BitcoinNetwork {
      switch network {
      case "TESTNET":
        return .testnet
      case "REGTEST":
        return .regtest
      case "MAINNET":
        return .mainnet
      default:
        return .testnet
      }
  }
  
}
