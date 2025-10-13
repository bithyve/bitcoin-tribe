//
//  RGBHelper.swift
//  HEXA
//
//  Created by Shashank Shinde on 26/06/23.
//

import Foundation
import CloudKit

@objc class RGBHelper : NSObject {
  
  var rgbManager : RgbManager
  
  var TAG = "TRIBE-RGB"
  
  private static let jsonEncoder = JSONEncoder()
  private static let jsonDecoder = JSONDecoder()
  
  override init() {
    self.rgbManager = RgbManager.shared
  }
  
  
  @objc func generate_keys(btcNetwotk: String, callback: @escaping ((String) -> Void)){
    do {
      let network = RgbManager.getRgbNetwork(network: btcNetwotk)
      let keys = generateKeys(bitcoinNetwork: network)
      if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let rgbURL = documentDirectory.appendingPathComponent(Constants.shared.rgbDirName)
        let data = [
          "mnemonic": keys.mnemonic,
          "xpub": keys.xpub,
          "masterFingerprint": keys.masterFingerprint,
          "accountXpubColored": keys.accountXpubColored,
          "accountXpubVanilla": keys.accountXpubVanilla,
          "rgbDir": rgbURL.absoluteString,
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      } else {
        let errorData = ["error": "Document directory not found"]
        let json = Utility.convertToJSONString(params: errorData)
        callback(json)
      }
    } catch {
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func restore_keys(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)){
    do {
      let network = RgbManager.getRgbNetwork(network: btcNetwotk)
      let keys = try restoreKeys(bitcoinNetwork: network, mnemonic: mnemonic)
      if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let rgbURL = documentDirectory.appendingPathComponent(Constants.shared.rgbDirName)
        let data = [
          "mnemonic": keys.mnemonic,
          "xpub": keys.xpub,
          "masterFingerprint": keys.masterFingerprint,
          "accountXpubColored": keys.accountXpubColored,
          "accountXpubVanilla": keys.accountXpubVanilla,
          "rgbDir": rgbURL.absoluteString,
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      } else {
        let errorData = ["error": "Document directory not found"]
        let json = Utility.convertToJSONString(params: errorData)
        callback(json)
      }
    } catch {
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  func getRgbAssetMetaData(assetId: String)->String{
    do{
      
      if let wallet = self.rgbManager.rgbWallet {
        let metaData = try wallet.getAssetMetadata(assetId: assetId)
        var jsonObject = [String: Any]()
        jsonObject["assetId"] = assetId
        jsonObject["precision"] = metaData.precision
        jsonObject["name"] = metaData.name
        jsonObject["ticker"] = metaData.ticker
        jsonObject["description"] = metaData.details
        jsonObject["timestamp"] = metaData.timestamp
        jsonObject["assetSchema"] = "\(metaData.assetSchema)"
        jsonObject["issuedSupply"] = metaData.issuedSupply
        let jsonData = try JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted)
        let jsonString = String(data: jsonData, encoding: .utf8)!
        return jsonString
      } else {
        print("rgbWallet is not initialized")
        return "{}"
      }
    }catch{
      print(error)
      return "{}"
    }
  }
  
  func getRgbWallet()->Wallet?{
    return self.rgbManager.rgbWallet
  }
  
  func getRgbAssetTransfers(assetId: String) -> String {
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "rgbWallet or online is not initialized"])
      }
      
      let refresh = try wallet.refresh(online: online, assetId: assetId, filter: [
        RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true),
        RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)
      ], skipSync: false)
      
      let transfers = try wallet.listTransfers(assetId: assetId).reversed()
      
      let jsonArray = transfers.map { transfer -> [String: Any] in
        var jsonObject: [String: Any] = [
          "idx": transfer.idx,
          "txid": transfer.txid,
          "createdAt": transfer.createdAt,
          "updatedAt": transfer.updatedAt,
          "recipientId": transfer.recipientId,
          "status": "\(transfer.status)",
          "kind": "\(transfer.kind)",
          "expiration": transfer.expiration,
          "batchTransferIdx": transfer.batchTransferIdx,
          "invoiceString": transfer.invoiceString
        ]
        
        if let requestedAssignment = transfer.requestedAssignment {
          var assignmentObject: [String: Any] = [:]
          switch requestedAssignment {
          case .fungible(let amount):
            assignmentObject["type"] = "Fungible"
            assignmentObject["amount"] = String(amount)
          case .nonFungible:
            assignmentObject["type"] = "NonFungible"
          case .inflationRight(let amount):
            assignmentObject["type"] = "InflationRight"
            assignmentObject["amount"] = String(amount)
          case .replaceRight:
            assignmentObject["type"] = "ReplaceRight"
          case .any:
            assignmentObject["type"] = "Any"
          }
          jsonObject["requestedAssignment"] = assignmentObject
        }
        
        let assignmentsArray = transfer.assignments.map { assignment -> [String: Any] in
          var assignmentObject: [String: Any] = [:]
          switch assignment {
          case .fungible(let amount):
            assignmentObject["type"] = "Fungible"
            assignmentObject["amount"] = String(amount)
          case .nonFungible:
            assignmentObject["type"] = "NonFungible"
          case .inflationRight(let amount):
            assignmentObject["type"] = "InflationRight"
            assignmentObject["amount"] = String(amount)
          case .replaceRight:
            assignmentObject["type"] = "ReplaceRight"
          case .any:
            assignmentObject["type"] = "Any"
          }
          return assignmentObject
        }
        jsonObject["assignments"] = assignmentsArray
        
        if let receiveUtxo = transfer.receiveUtxo {
          jsonObject["receiveUtxo"] = [
            "txid": receiveUtxo.txid,
            "vout": receiveUtxo.vout
          ]
        }
        
        if let changeUtxo = transfer.changeUtxo {
          jsonObject["changeUtxo"] = [
            "txid": changeUtxo.txid,
            "vout": changeUtxo.vout
          ]
        }
        
        jsonObject["transportEndpoints"] = transfer.transportEndpoints.map { endpoint in
          return [
            "endpoint": endpoint.endpoint,
            "used": endpoint.used,
            "transportType": "\(endpoint.transportType)"
          ]
        }
        
        return jsonObject
      }
      
      let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: [])
      return String(data: jsonData, encoding: .utf8) ?? "{}"
    } catch {
      print("getRgbAssetTransfers error: \(error)")
      return "{}"
    }
  }

  
  @objc func getUnspents(callback: @escaping ((String) -> Void)) {
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "rgbWallet or online is not initialized"])
      }
      
      let unspents = try wallet.listUnspents(online: online, settledOnly: false, skipSync: false)
      
      let unspentsArray = unspents.map { unspent -> [String: Any] in
        var unspentDict: [String: Any] = [
          "pendingBlinded": unspent.pendingBlinded
        ]
        
        let utxo = unspent.utxo
        let utxoDict: [String: Any] = [
          "outpoint": [
            "txid": utxo.outpoint.txid,
            "vout": utxo.outpoint.vout
          ],
          "btcAmount": utxo.btcAmount,
          "colorable": utxo.colorable,
          "exists": utxo.exists
        ]
        unspentDict["utxo"] = utxoDict
        
        let allocationsArray = unspent.rgbAllocations.map { allocation -> [String: Any] in
          var allocationDict: [String: Any] = [
            "assetId": allocation.assetId as Any,
            "settled": allocation.settled
          ]
          
          var assignmentDict: [String: Any] = [:]
          switch allocation.assignment {
          case .fungible(let amount):
            assignmentDict["type"] = "Fungible"
            assignmentDict["amount"] = "\(amount)"
          case .nonFungible:
            assignmentDict["type"] = "NonFungible"
          case .inflationRight(let amount):
            assignmentDict["type"] = "InflationRight"
            assignmentDict["amount"] = "\(amount)"
          case .replaceRight:
            assignmentDict["type"] = "ReplaceRight"
          case .any:
            assignmentDict["type"] = "Any"
          }
          allocationDict["assignment"] = assignmentDict
          
          return allocationDict
        }
        unspentDict["rgbAllocations"] = allocationsArray
        
        return unspentDict
      }
      
      let jsonData = try JSONSerialization.data(withJSONObject: unspentsArray, options: [])
      let jsonString = String(data: jsonData, encoding: .utf8) ?? "[]"
      callback(jsonString)
    } catch {
      print("getUnspents error: \(error)")
      callback("[]")
    }
  }

  func getRgbAssets() -> String {
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "rgbWallet or online is not initialized"])
      }

      let refresh = try wallet.refresh(online: online, assetId: nil, filter: [], skipSync: false)
      let assets = try wallet.listAssets(filterAssetSchemas: [])
      let failed = try wallet.failTransfers(online: online, batchTransferIdx: nil, noAssetOnly: false, skipSync: false)
      let deleted = try wallet.deleteTransfers(batchTransferIdx: nil, noAssetOnly: false)
      
      let niaAssets = assets.nia ?? []
      let cfaAssets = assets.cfa ?? []
      let udaAssets = assets.uda ?? []
      
      let refreshGroup = DispatchGroup()
      
      for assetNia in niaAssets {
        refreshGroup.enter()
        do {
          try wallet.refresh(online: online, assetId: assetNia.assetId, filter: [], skipSync: false)
          refreshGroup.leave()
        } catch {
          refreshGroup.leave()
        }
      }
      
      for assetCfa in cfaAssets {
        refreshGroup.enter()
        do {
          try wallet.refresh(online: online, assetId: assetCfa.assetId, filter: [], skipSync: false)
          refreshGroup.leave()
        } catch {
          refreshGroup.leave()
        }
      }
      
      for assetUda in udaAssets {
        refreshGroup.enter()
        do {
          try wallet.refresh(online: online, assetId: assetUda.assetId, filter: [], skipSync: false)
          refreshGroup.leave()
        } catch {
          refreshGroup.leave()
        }
      }
      
      refreshGroup.wait()

      let jsonArray = niaAssets.map { asset -> [String: Any] in
        return [
          "assetId": asset.assetId,
          "ticker": asset.ticker,
          "name": asset.name,
          "precision": asset.precision,
          "balance": [
            "future": asset.balance.future,
            "settled": asset.balance.settled,
            "spendable": asset.balance.spendable,
          ],
          "issuedSupply": asset.issuedSupply,
          "timestamp": asset.timestamp,
          "addedAt": asset.addedAt
        ]
      }
      
      let jsonRgb121Array = cfaAssets.map { asset -> [String: Any] in
        return [
          "assetId": asset.assetId,
          "balance": [
            "future": asset.balance.future,
            "settled": asset.balance.settled,
            "spendable": asset.balance.spendable,
          ],
          "description": asset.details,
          "details": asset.details,
          "name": asset.name,
          "precision": asset.precision,
          "issuedSupply": asset.issuedSupply,
          "timestamp": asset.timestamp,
          "addedAt": asset.addedAt,
          "media": [
            "filePath": asset.media?.filePath,
            "mime": asset.media?.mime,
          ],
          "dataPaths": [[String: Any]]()
        ]
      }
      
      let udaArray = udaAssets.map { asset -> [String: Any] in
        var media = [
          "filePath": asset.token?.media?.filePath,
          "mime": asset.token?.media?.mime,
          "digest": asset.token?.media?.digest,
        ]
        
        var attachmentsArray = [String: [String: Any]]()
        if let attachments = asset.token?.attachments {
          for (key, value) in attachments {
            attachmentsArray["\(key)"] = [
              "filePath": value.filePath,
              "mime": value.mime,
              "digest": value.digest
            ]
          }
        }
        
        return [
          "assetId": asset.assetId,
          "balance": [
            "future": asset.balance.future,
            "settled": asset.balance.settled,
            "spendable": asset.balance.spendable,
          ],
          "ticker": asset.ticker,
          "details": asset.details,
          "name": asset.name,
          "precision": asset.precision,
          "issuedSupply": asset.issuedSupply,
          "timestamp": asset.timestamp,
          "addedAt": asset.addedAt,
          "token": [
            "index": asset.token?.index,
            "ticker": asset.token?.ticker,
            "name": asset.token?.name,
            "details": asset.token?.details,
            "embeddedMedia": asset.token?.embeddedMedia,
            "reserves": asset.token?.reserves,
            "attachments": attachmentsArray,
            "media": media
          ]
        ]
      }
      
      let data = [
        "nia": jsonArray,
        "cfa": jsonRgb121Array,
        "uda": udaArray
      ]
      
      return Utility.convertToJSONString(params: data)
    } catch {
      print("getRgbAssets error: \(error)")
      return "{}"
    }
  }

  
  private func handleMissingFunds<T>(_ callback: () throws -> T) rethrows -> T {
    do {
      return try callback()
    } catch let error as RgbLibError {
      print("handleMissingFunds: RgbLibException \(error)")
      switch error {
      case .InsufficientBitcoins(_,_),
          .InsufficientAllocationSlots:
          throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Insufficient sats for RGB"])
      case .InvalidInvoice(let details):
        if details == "Invalid blinded utxo" {
          throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid blinded utxo"])
        } else if details == "Blinded utxo already used" {
          throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Blinded utxo already used"])
        }
      case .AssetNotFound(assetId: _):
          throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Asset not found"])
      default:
        throw error
      }
    }
    fatalError("Missing return statement")
  }
  
  @objc func createUTXOs(feeRate: Int, num: Int, size: Int, upTo: Bool, callback: @escaping ((String) -> Void)) {
    print("Creating UTXOs... \(feeRate)")
    
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB Wallet or Online service is not initialized."])
      }
      
      do {
        _ = try wallet.getAddress()
        try wallet.sync(online: online)
      } catch {
        print("Error getting address: \(error)")
      }
      
      let data = try self.handleMissingFunds {
        var attempts = 3
        var newUTXOs: UInt8 = 0
        
        while newUTXOs == 0 && attempts > 0 {
          print("Attempting to create UTXOs, attempts left: \(attempts)")
          newUTXOs = try wallet.createUtxos(online: online, upTo: upTo, num: UInt8(num), size: UInt32(size), feeRate: UInt64(feeRate), skipSync: false)
          print("newUTXOs=\(newUTXOs)")
          attempts -= 1
        }
        
        return [
          "created": newUTXOs > 0
        ]
      }
      
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print("createUTXOs error: \(error)")
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }

  
//  private func createUTXOs()->UInt8{
//    return try! self.rgbManager.rgbWallet!.createUtxos(online: self.rgbManager.online!, upTo: false, num: nil, size: nil, feeRate: Float(Constants.defaultFeeRate))
//  }
  
  func genReceiveData(assetID: String, amount: Float, expiry: Int, blinded: Bool) -> String {
      do {
          return try handleMissingFunds {
              guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
                  let data: [String: Any] = [
                      "error": "RGB Wallet or Online service is not initialized."
                  ]
                  let json = Utility.convertToJSONString(params: data)
                  return json
              }

              let refresh_ = try wallet.refresh(
                  online: online,
                  assetId: nil,
                  filter: [
                      RefreshFilter(status: .waitingCounterparty, incoming: true),
                      RefreshFilter(status: .waitingCounterparty, incoming: false)
                  ], skipSync: false
              )
              
              let assetId = assetID.isEmpty ? nil : assetID
              let amountValue = amount == 0 ? UInt64(0) : UInt64(amount)
              
              let bindData = try blinded ? 
                  wallet.blindReceive(
                      assetId: assetId,
                      assignment: amountValue > 0 ? .fungible(amount: amountValue) : .any,
                      durationSeconds: UInt32(expiry),
                      transportEndpoints: [Constants.shared.proxyConsignmentEndpoint],
                      minConfirmations: 1
                  ):
                  wallet.witnessReceive(
                      assetId: assetId,
                      assignment: amountValue > 0 ? .fungible(amount: amountValue) : .any,
                      durationSeconds: UInt32(expiry),
                      transportEndpoints: [Constants.shared.proxyConsignmentEndpoint],
                      minConfirmations: 1
                  )

              let data: [String: Any] = [
                  "invoice": bindData.invoice,
                  "recipientId": bindData.recipientId,
                  "expirationTimestamp": bindData.expirationTimestamp ?? 0,
                  "batchTransferIdx": bindData.batchTransferIdx
              ]
              
              let json = Utility.convertToJSONString(params: data)
              return json
          }
      } catch let error {
        print(error)
          let data: [String: Any] = [
              "error": error.localizedDescription
          ]
          let json = Utility.convertToJSONString(params: data)
          return json
      }
  }
  
  @objc func failTransfer(batchTransferIdx: Int32, noAssetOnly: Bool, callback: @escaping ((String) -> Void)) {
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet or online not initialized"])
      }
      let status = try wallet.failTransfers(online: online, batchTransferIdx: batchTransferIdx, noAssetOnly: noAssetOnly, skipSync: false)
      let data = ["status": status]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      let errorData = [
        "status": false,
        "error": error.localizedDescription
      ] as [String : Any]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func getWalletData(callback: @escaping ((String) -> Void)) {
    do {
      guard let wallet = self.rgbManager.rgbWallet else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet not initialized"])
      }
      
      let walletData = wallet.getWalletData()
      let data = [
        "dataDir": walletData.dataDir,
//        "bitcoinNetwork": walletData.bitcoinNetwork,
//        "databaseType": walletData.databaseType,
        "maxAllocationsPerUtxo": walletData.maxAllocationsPerUtxo,
        "mnemonic": walletData.mnemonic,
        "pubkey": walletData.accountXpubColored,
        "vanillaKeychain": walletData.vanillaKeychain,
      ] as [String : Any]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      let errorData = [
        "status": false,
        "error": error.localizedDescription
      ] as [String : Any]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func deleteTransfers(batchTransferIdx: Int32, noAssetOnly: Bool, callback: @escaping ((String) -> Void)) {
    do {
      guard let wallet = self.rgbManager.rgbWallet else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet not initialized"])
      }
      let status = try wallet.deleteTransfers(batchTransferIdx: batchTransferIdx, noAssetOnly: noAssetOnly)
      let data = ["status": status]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      let errorData = [
        "status": false,
        "error": error.localizedDescription
      ] as [String : Any]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func decodeInvoice(invoiceString: String, callback: @escaping ((String) -> Void)) {
    do {
      let invoice = try Invoice(invoiceString: invoiceString).invoiceData()
      var assignmentDict: [String: Any] = [:]
      switch invoice.assignment {
      case .fungible(let amount):
        assignmentDict["type"] = "Fungible"
        assignmentDict["amount"] = String(amount)
      case .nonFungible:
        assignmentDict["type"] = "NonFungible"
      case .inflationRight(let amount):
        assignmentDict["type"] = "InflationRight"
        assignmentDict["amount"] = String(amount)
      case .replaceRight:
        assignmentDict["type"] = "ReplaceRight"
      case .any:
        assignmentDict["type"] = "Any"
      }
      
      let data = [
        "recipientId": invoice.recipientId,
        "expirationTimestamp": invoice.expirationTimestamp ?? 0,
        "assetId": invoice.assetId ?? "",
        "assetSchema": invoice.assetSchema.map { "\($0)" } ?? "",
        "network": String(describing: invoice.network),
        "assignment": assignmentDict,
        "transportEndpoints" :  invoice.transportEndpoints.map { endpoint in
          return endpoint
        }
      ] as [String : Any]
      
      print(data)
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func getAddress(callback: @escaping ((String) -> Void)) {
    do {
      guard let wallet = self.rgbManager.rgbWallet else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet not initialized"])
      }
      let address = try wallet.getAddress()
      callback(address)
    } catch {
      callback("")
    }
  }
  
  @objc func getBalance(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    callback("balance")
  }
  
  
  @objc func sync(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    callback("")
  }
  
  @objc func syncRgbAssets(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    callback("")
  }
  
  
  @objc func receiveAsset(assetID: String, amount: Float, expiry: Int, blinded: Bool, callback: @escaping ((String) -> Void)){
    let response = self.genReceiveData(assetID: assetID, amount: amount,expiry:expiry, blinded: blinded)
    callback(response)
  }
  
  @objc func syncRgb(callback: @escaping ((String) -> Void)){
    let response = self.getRgbAssets()
    callback(response)
  }
  
  @objc func getRgbAssetMetaData(assetId:String, callback: @escaping ((String) -> Void)){
    let response = self.getRgbAssetMetaData(assetId: assetId)
    callback(response)
  }
  
  @objc func getRgbAssetTransactions(assetId: String, callback: @escaping ((String) -> Void)) {
    let response = self.getRgbAssetTransfers(assetId: assetId)
    callback(response)
  }
  
  @objc func initiate(btcNetwork: String, mnemonic: String, accountXpubVanilla: String, accountXpubColored: String, masterFingerprint: String, timeout: NSNumber, callback: @escaping ((String) -> Void)) async {
      do {
          self.rgbManager = RgbManager.shared
        let response = try runWithTimeout(seconds: Double(timeout)){ self.rgbManager.initialize(bitcoinNetwork: btcNetwork, accountXpubVanilla: accountXpubVanilla, accountXpubColored: accountXpubColored, mnemonic: mnemonic, masterFingerprint: masterFingerprint, skipConsistencyCheck: false)
        }
          if response.status {
//              if let logPath = Utility.getRgbDir()?.appendingPathComponent(masterFingerprint).appendingPathComponent("log"),
//                 FileManager.default.fileExists(atPath: logPath.path) {
//                  try FileManager.default.removeItem(at: logPath)
//              }
              
              let data: [String: Any] = [
                  "status": true,
                  "error": ""
              ]
              let json = Utility.convertToJSONString(params: data)
              callback(json)
          } else {
            let errorStrings = ["unreleased lock file", "bincode", "error from bdk", "timeout"]
              let containsAny = errorStrings.contains { response.error.contains($0) }
            writeToLogFile(masterFingerprint: masterFingerprint, content: response.error)

              if containsAny {
                deleteRuntimeLockFile(masterFingerprint: masterFingerprint)
                
              let retryResponse = self.rgbManager.initialize(bitcoinNetwork: btcNetwork, accountXpubVanilla: accountXpubVanilla, accountXpubColored: accountXpubColored, mnemonic: mnemonic, masterFingerprint: masterFingerprint, skipConsistencyCheck: false)
                writeToLogFile(masterFingerprint: masterFingerprint, content: retryResponse.error)
                let data: [String: Any] = [
                    "status": retryResponse.status,
                    "error": retryResponse.error
                ]
                let json = Utility.convertToJSONString(params: data)
                callback(json)
                return
              }
              
              let data: [String: Any] = [
                  "status": false,
                  "error": response.error
              ]
              let json = Utility.convertToJSONString(params: data)
              callback(json)
          }
      } catch TimeoutError.timedOut {
        deleteRuntimeLockFile(masterFingerprint: masterFingerprint)
      let retryResponse = self.rgbManager.initialize(bitcoinNetwork: btcNetwork, accountXpubVanilla: accountXpubVanilla, accountXpubColored: accountXpubColored, mnemonic: mnemonic, masterFingerprint: masterFingerprint, skipConsistencyCheck: false)
        writeToLogFile(masterFingerprint: masterFingerprint, content: retryResponse.error)
        let data: [String: Any] = [
            "status": retryResponse.status,
            "error": retryResponse.error
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
    } catch {
      writeToLogFile(masterFingerprint: masterFingerprint, content: error.localizedDescription)
          let errorData = ["error": error.localizedDescription]
          let json = Utility.convertToJSONString(params: errorData)
          callback(json)
      }
  }
  
  func deleteRuntimeLockFile(masterFingerprint: String) {
      guard let runtimeLockPath = Utility.getRgbDir()?
          .appendingPathComponent(masterFingerprint)
          .appendingPathComponent("rgb_runtime.lock") else {
          print("Could not construct runtime lock path for fingerprint: \(masterFingerprint)")
          return
      }
      guard FileManager.default.fileExists(atPath: runtimeLockPath.path) else {
          print("No runtime lock file exists at path.")
          return
      }
      do {
          print("Deleting runtime lock at: \(runtimeLockPath.path)")
          try FileManager.default.removeItem(at: runtimeLockPath)
          print("Runtime lock deleted successfully.")
      } catch {
          print("Failed to delete runtime lock: \(error)")
      }
  }
  
  func writeToLogFile(masterFingerprint: String, content: String) {
      guard let logFilePath = Utility.getRgbDir()?
          .appendingPathComponent(masterFingerprint)
          .appendingPathComponent("log") else {
          print("Could not construct log path for fingerprint: \(masterFingerprint)")
          return
      }

      if !FileManager.default.fileExists(atPath: logFilePath.path) {
          FileManager.default.createFile(atPath: logFilePath.path, contents: nil, attributes: nil)
      }

      let formatter = DateFormatter()
      formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
      formatter.timeZone = TimeZone(secondsFromGMT: 0)

      let timestamp = formatter.string(from: Date())

      let logLine = "\(timestamp) INFO[TRIBE_INTERNAL] \(content)\n"

      if let handle = try? FileHandle(forWritingTo: logFilePath) {
          handle.seekToEndOfFile()
          if let data = logLine.data(using: .utf8) {
              handle.write(data)
          }
          try? handle.close()
      } else {
          print("Failed to open log file for writing at path: \(logFilePath.path)")
      }
  }

  
  @objc func resetWallet(masterFingerprint: String,callback: @escaping ((String) -> Void)) -> Void {
      self.rgbManager.online = nil
      guard let rgbWalletDir = Utility.getRgbDir()?.appendingPathComponent(masterFingerprint) else {
          print("Could not construct rgb dir path for fingerprint: \(masterFingerprint)")
          return
      }
      var isDir: ObjCBool = false
      guard FileManager.default.fileExists(atPath: rgbWalletDir.path, isDirectory: &isDir), isDir.boolValue else {
          print("No rgb dir exists at path or it's not a directory.")
          return
      }
      do {
          print("Deleting rgb dir at: \(rgbWalletDir.path)")
          try FileManager.default.removeItem(at: rgbWalletDir)
          print("rgb dir deleted successfully.")
        let data = [
          "message": "Reset successful",
          "status": true
        ] as [String : Any]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      } catch {
        print("Failed to delete rgb dir: \(error)")
        let data = [
          "message": error.localizedDescription,
          "status": false
        ] as [String : Any]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
  }


  @objc func issueAssetNia(ticker: String, name: String, supply: String, precision: NSNumber, callback: @escaping ((String) -> Void)) -> Void{
    do {
      let data = try self.handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetNia(ticker: ticker, name: name, precision: UInt8(truncating: precision), amounts: [UInt64(UInt64(supply)!)])
        return [
          "assetId": asset?.assetId,
          "name": asset?.name,
          "ticker": asset?.ticker,
          "precision": asset?.precision,
          "futureBalance": asset?.balance.future,
          "settledBalance": asset?.balance.settled,
          "spendableBalance": asset?.balance.spendable
        ]
      }
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print(error)
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func issueAssetCfa(name: String, description: String, supply: String, precision: NSNumber, filePath: String, callback: @escaping ((String) -> Void)) -> Void{
    do {
      let data = try self.handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetCfa(name: name, details: description, precision: UInt8(truncating: precision), amounts: [UInt64(UInt64(supply)!)], filePath: filePath)
        var dataPaths: [[String: Any]] = []
        return [
          "assetId": asset?.assetId,
          "name": asset?.name,
          "description": asset?.details,
          "precision": asset?.precision,
          "futureBalance": asset?.balance.future,
          "settledBalance": asset?.balance.settled,
          "spendableBalance": asset?.balance.spendable,
          "dataPaths": dataPaths
        ]
      }
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print(error)
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func issueAssetUda(name: String,ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: [String], callback: @escaping ((String) -> Void)) -> Void{
    do {
      let data = try self.handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetUda(ticker: ticker, name: name, details: details, precision: 0, mediaFilePath: mediaFilePath, attachmentsFilePaths: attachmentsFilePaths)
        var dataPaths: [[String: Any]] = []
        return [
          "assetId": asset?.assetId,
          "name": asset?.name,
          "ticker": asset?.ticker,
          "details": asset?.details,
          "precision": asset?.precision,
          "futureBalance": asset?.balance.future,
          "settledBalance": asset?.balance.settled,
          "spendableBalance": asset?.balance.spendable,
          "dataPaths": dataPaths
        ]
      }
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print(error)
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  
  @objc func sendAsset(assetId: String, blindedUTXO: String, amount: NSNumber, consignmentEndpoints: String, fee: NSNumber,isDonation: Bool, schema: String, witnessSats:NSNumber ,callback: @escaping ((String) -> Void)) -> Void{
    do {
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet or online not initialized"])
      }
      var recipientMap: [String: [Recipient]] = [:]
      let assignment: Assignment = schema.uppercased() == "UDA"
          ? .nonFungible
      : .fungible(amount: UInt64(amount))
      var witnessData : WitnessData? = nil
      if(Int(witnessSats)>0) {
        witnessData = WitnessData(amountSat: UInt64(witnessSats), blinding: nil)
      }
      let recipient = Recipient(recipientId: blindedUTXO, witnessData: witnessData, assignment:assignment, transportEndpoints: [consignmentEndpoints])
      recipientMap[assetId] = [recipient]
      let response = try self.handleMissingFunds {
        return try wallet.send(online: online, recipientMap: recipientMap, donation: isDonation, feeRate: UInt64(truncating: fee), minConfirmations: 1, skipSync: true)
      }
      print(response)
      let data = ["txid": response.txid]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print(error)
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  private func fetchRecordFromICloud(recordID: String,completion: @escaping (_ error: String?, _ isError: Bool, _ fileURL: String?) -> Void){
      let container = CKContainer.default()
      let privateDatabase = container.privateCloudDatabase
      let recordID = CKRecord.ID(recordName: recordID)
      privateDatabase.fetch(withRecordID: recordID) { (fetchedRecord, error) in
          if let fetchedRecord = fetchedRecord {
            if let fileAsset = fetchedRecord["rgb_backup"] as? CKAsset {
                           let fileURL = fileAsset.fileURL
              completion("Record found", false, fileURL?.path)
              } else {
                completion("Record not found in iCloud", true, nil)
              }
          } else {
              if let error = error {
                completion(error.localizedDescription, true, nil)
              } else {
                completion("Record not found in iCloud", true, nil)
              }
          }
      }
  }
  
  func getICloudFolder() -> URL? {
    let fileManager = FileManager.default
      guard let iCloudURL = fileManager.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
          return nil
      }
    return iCloudURL
  }
  
  func uploadToIcloud(url: URL,  completion: @escaping (_ error: String?, _ isError: Bool) -> Void) {
    let fileManager = FileManager.default
    let iCloudFolderURL = getICloudFolder()
    do{
      if iCloudFolderURL != nil {
        let fileName = url.lastPathComponent
        var destinationURL = iCloudFolderURL!.appendingPathComponent(fileName)
        if(fileManager.fileExists(atPath: destinationURL.path)) {
          try fileManager.removeItem(atPath: destinationURL.path)
        }
        try fileManager.copyItem(at: url, to: destinationURL)
        
        let filesURLs = try fileManager.contentsOfDirectory(at: iCloudFolderURL!, includingPropertiesForKeys: nil)
        if filesURLs.isEmpty {
                    print("No files found in folder: \(filesURLs)")
                } else {
                    print("Files in folder \(filesURLs):")
                }
        completion("File uploaded successfully to iCloud", false)
      } else {
        completion("iCloud is currently inaccessible. Please check authentication with your iCloud and try again.", false)
      }
    } catch {
      print("Error uploading file to iCloud: \(error.localizedDescription)")
      completion("Error uploading file to iCloud: \(error.localizedDescription)", false)
    }
  }
  
  @objc func backup(path: String, password: String, callback: @escaping ((String) -> Void)) -> Void {
    do {
      let keys = try restoreKeys(bitcoinNetwork: BitcoinNetwork.regtest, mnemonic: password)
      let filePath = Utility.getBackupPath(fileName: keys.masterFingerprint)

      let response = try self.rgbManager.rgbWallet?.backup(backupPath: filePath?.path ?? "", password: password)
      
      let data = [
        "message": "Backup successful",
        "file": filePath?.path ?? "",
        "error": ""
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print("backup error: \(error)")
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func isBackupRequired(callback: @escaping ((Bool) -> Void)) -> Void{
    do {
      guard let wallet = self.rgbManager.rgbWallet else {
        throw NSError(domain: "RGBHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "RGB wallet not initialized"])
      }
      let response = try wallet.backupInfo() ?? false
      callback(response)
    } catch {
      callback(false)
    }
  }
  
  @objc func restore(mnemonic: String, backupPath: String, callback: @escaping ((String) -> Void)) -> Void {
    do {
      NSString(string: backupPath).expandingTildeInPath
      try restoreBackup(backupPath: backupPath, password: mnemonic, dataDir: Utility.getRgbDir()?.path ?? "")
      let data = ["message": "Restore successful"]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      print("restore error: \(error)")
      let errorData = ["error": error.localizedDescription]
      let json = Utility.convertToJSONString(params: errorData)
      callback(json)
    }
  }
  
  @objc func isValidBlindedUtxo(invoiceData: String,callback: @escaping ((Bool) -> Void)) -> Void{
    do {
      try Invoice(invoiceString: invoiceData)
      callback(true)
    } catch {
      callback(false)
    }
  }
  
  @objc func getRgbDir(callback: @escaping ((String) -> Void)) -> Void{
    let dir = Utility.getRgbDir()?.absoluteString
    let data = [
      "dir": dir,
      "error": ""
    ]
    let json = Utility.convertToJSONString(params: data as [String : Any])
    callback(json)
  }
  
}
