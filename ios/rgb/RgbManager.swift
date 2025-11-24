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
  
  func initialize(bitcoinNetwork: String, accountXpubVanilla: String, accountXpubColored: String, mnemonic: String, masterFingerprint: String, skipConsistencyCheck: Bool)-> (status: Bool, error: String){
    let network = RgbManager.getRgbNetwork(network: bitcoinNetwork)
    do{
      self.online = nil
      let walletData = WalletData(dataDir: Utility.getRgbDir()?.path ?? "", bitcoinNetwork: network, databaseType: DatabaseType.sqlite,maxAllocationsPerUtxo: 1, accountXpubVanilla: accountXpubVanilla, accountXpubColored: accountXpubColored, mnemonic: mnemonic,masterFingerprint: masterFingerprint, vanillaKeychain: 0, supportedSchemas: [AssetSchema.cfa, AssetSchema.nia, AssetSchema.uda])
      self.rgbWallet = try Wallet.init(walletData: walletData)
      self.online = try rgbWallet?.goOnline(skipConsistencyCheck: skipConsistencyCheck, indexerUrl: Constants.shared.getElectrumUrl(network: bitcoinNetwork))
      self.rgbNetwork = network
      return (true, "")
    }catch{
      print("initialize: error \(error)")
      self.rgbWallet = nil
      return (false, error.localizedDescription)
    }
  }
  
  public static func getRgbNetwork(network: String) -> BitcoinNetwork {
      switch network {
      case "TESTNET":
        return .testnet
      case "TESTNET4":
        return .testnet4
      case "REGTEST":
        return .regtest
      case "MAINNET":
        return .mainnet
      default:
        return .testnet
      }
  }
  
}

enum TimeoutError: Error {
    case timedOut
}

func runWithTimeout<T>(
    seconds: Double,
    task: @escaping () throws -> T
) throws -> T {
    // If timeout is 0, run without timeout
    if seconds == 0 {
        return try task()
    }
    
    let queue = DispatchQueue.global()
    var result: Result<T, Error>!
    let group = DispatchGroup()
    group.enter()
    
    queue.async {
        do {
            let value = try task()
            result = .success(value)
        } catch {
            result = .failure(error)
        }
        group.leave()
    }
    
    let waitResult = group.wait(timeout: .now() + seconds)
    
    switch waitResult {
    case .success:
        return try result.get()
    case .timedOut:
        throw TimeoutError.timedOut
    }
}
