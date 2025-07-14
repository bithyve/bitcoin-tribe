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
      self.online = try rgbWallet?.goOnline(skipConsistencyCheck: true, indexerUrl: Constants.getElectrumUrl(network: bitcoinNetwork))
      self.rgbNetwork = network
      return "true"
    }catch{
      print("initialize: error \(error)")
      self.rgbWallet = nil
      return "false"
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
