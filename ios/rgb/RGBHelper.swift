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
  
  override init() {
    self.rgbManager = RgbManager.shared
  }
  
  
  @objc func generate_keys(btcNetwotk: String, callback: @escaping ((String) -> Void)){
    let network = RgbManager.getRgbNetwork(network: btcNetwotk)
    let keys = generateKeys(bitcoinNetwork: network)
    if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
      let rgbURL = documentDirectory.appendingPathComponent(Constants.rgbDirName)
      let data: [String: Any] = [
        "mnemonic": keys.mnemonic,
        "xpub": keys.xpub,
        "xpubFingerprint": keys.accountXpubFingerprint,
        "accountXpub": keys.accountXpub,
        "rgbDir": rgbURL.absoluteString,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func restore_keys(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)){
    let network = RgbManager.getRgbNetwork(network: btcNetwotk)
    do{
      let keys = try restoreKeys(bitcoinNetwork: network, mnemonic: mnemonic)
      if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let rgbURL = documentDirectory.appendingPathComponent(Constants.rgbDirName)
        let data: [String: Any] = [
          "mnemonic": keys.mnemonic,
          "xpub": keys.xpub,
          "accountXpubFingerprint": keys.accountXpubFingerprint,
          "accountXpub": keys.accountXpub,
          "rgbDir": rgbURL.absoluteString,
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
    }
    catch{
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
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
        jsonObject["assetIface"] = "\(metaData.assetIface)"
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
              print("rgbWallet or online is not initialized")
              return "{}"
          }
          
          let refresh = try wallet.refresh(online: online, assetId: assetId, filter: [
              RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true),
              RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)
          ], skipSync: false)
          
        let transfers = try wallet.listTransfers(assetId: assetId).reversed()
          var jsonArray = [[String: Any]]()
          
          for transfer in transfers {
              var jsonObject = [String: Any]()
              jsonObject["idx"] = transfer.idx
              jsonObject["txid"] = transfer.txid
              jsonObject["amount"] = transfer.amount
              jsonObject["createdAt"] = transfer.createdAt
              jsonObject["updatedAt"] = transfer.updatedAt
              jsonObject["recipientId"] = transfer.recipientId
              jsonObject["status"] = "\(transfer.status)"
              jsonObject["kind"] = "\(transfer.kind)"
              jsonObject["expiration"] = transfer.expiration
              jsonObject["batchTransferIdx"] = transfer.batchTransferIdx
              jsonObject["receiveUtxo"] = [
                  "txid": transfer.receiveUtxo?.txid,
                  "vout": transfer.receiveUtxo?.vout
              ]
              jsonObject["changeUtxo"] = [
                  "txid": transfer.changeUtxo?.txid,
                  "vout": transfer.changeUtxo?.vout
              ]
              jsonObject["consignmentEndpoints"] = transfer.transportEndpoints.map { endpoint in
                  return [
                      "endpoint": endpoint.endpoint,
                      "used": endpoint.used,
                      "transportType": "\(endpoint.transportType)"
                  ]
              }
              jsonArray.append(jsonObject)
          }
          
          let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: .prettyPrinted)
          let jsonString = String(data: jsonData, encoding: .utf8)!
          return jsonString
      } catch {
          print(error)
          return "{}"
      }
  }

  
  @objc func getUnspents(callback: @escaping ((String) -> Void)) {
      do {
          guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
              print("rgbWallet or online is not initialized")
              callback("[]")
              return
          }
          
        let unspents = try wallet.listUnspents(online: online, settledOnly: false, skipSync: false)
          var jsonString = "["
          
          for (index, unspent) in unspents.enumerated() {
              jsonString += "{"
              let utxo = unspent.utxo
              jsonString += "\"utxo\":{"
              jsonString += "\"outpoint\":{"
              jsonString += "\"txid\":\"\(utxo.outpoint.txid)\","
              jsonString += "\"vout\":\(utxo.outpoint.vout)"
              jsonString += "},"
              jsonString += "\"btcAmount\":\(utxo.btcAmount),"
              jsonString += "\"colorable\":\(utxo.colorable),"
              jsonString += "\"exists\":\(utxo.exists)"
              jsonString += "},"
              jsonString += "\"rgbAllocations\":["
              
              for (allocIndex, allocation) in unspent.rgbAllocations.enumerated() {
                  jsonString += "{"
                  if let assetId = allocation.assetId {
                      jsonString += "\"assetId\":\"\(assetId)\","
                  } else {
                      jsonString += "\"assetId\":null,"
                  }
                  jsonString += "\"amount\":\(allocation.amount),"
                  jsonString += "\"settled\":\(allocation.settled)"
                  jsonString += "}"
                  if allocIndex < unspent.rgbAllocations.count - 1 {
                      jsonString += ","
                  }
              }
              jsonString += "]"
              jsonString += "}"
              if index < unspents.count - 1 {
                  jsonString += ","
              }
          }
          
          jsonString += "]"
          callback(jsonString)
      } catch {
          print(error)
          callback("[]")
      }
  }

  func getRgbAssets() -> String {
      do {
          guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
              print("rgbWallet or online is not initialized")
              return "{}"
          }

        let refresh = try wallet.refresh(online: online, assetId: nil, filter: [], skipSync: false)
          let assets = try wallet.listAssets(filterAssetSchemas: [])
          
          if let niaAssets = assets.nia {
              try niaAssets.forEach { assetNia in
                try wallet.refresh(online: online, assetId: assetNia.assetId, filter: [], skipSync: false)
              }
          }
          
          if let cfaAssets = assets.cfa {
              try cfaAssets.forEach { assetCfa in
                try wallet.refresh(online: online, assetId: assetCfa.assetId, filter: [], skipSync: false)
              }
          }
        
        if let udaAssets = assets.cfa {
          try udaAssets.forEach { assetUda in
              try wallet.refresh(online: online, assetId: assetUda.assetId, filter: [], skipSync: false)
            }
        }

          var jsonArray = [[String: Any]]()
          var jsonRgb121Array = [[String: Any]]()
        var udaArray = [[String: Any]]()

          if let niaAssets = assets.nia {
              for asset in niaAssets {
                  var jsonObject = [String: Any]()
                  jsonObject["assetId"] = asset.assetId
                  jsonObject["ticker"] = asset.ticker
                  jsonObject["name"] = asset.name
                  jsonObject["precision"] = asset.precision
                  jsonObject["balance"] = [
                      "future": asset.balance.future,
                      "settled": asset.balance.settled,
                      "spendable": asset.balance.spendable,
                  ]
                  jsonObject["issuedSupply"] = asset.issuedSupply
                  jsonObject["timestamp"] = asset.timestamp
                  jsonObject["addedAt"] = asset.addedAt
                  jsonObject["assetIface"] = "\(asset.assetIface)"
                  jsonArray.append(jsonObject)
              }
          }
          
          if let cfaAssets = assets.cfa {
              for asset in cfaAssets {
                  var jsonRgb121Object = [String: Any]()
                  jsonRgb121Object["assetId"] = asset.assetId
                  jsonRgb121Object["balance"] = [
                      "future": asset.balance.future,
                      "settled": asset.balance.settled,
                      "spendable": asset.balance.spendable,
                  ]
                  jsonRgb121Object["description"] = asset.details
                  jsonRgb121Object["details"] = asset.details
                  jsonRgb121Object["name"] = asset.name
                  jsonRgb121Object["precision"] = asset.precision
                  jsonRgb121Object["issuedSupply"] = asset.issuedSupply
                  jsonRgb121Object["timestamp"] = asset.timestamp
                  jsonRgb121Object["addedAt"] = asset.addedAt
                  jsonRgb121Object["media"] = [
                      "filePath": asset.media?.filePath,
                      "mime": asset.media?.mime,
                  ]
                  jsonRgb121Object["assetIface"] = "\(asset.assetIface)"
                  jsonRgb121Object["dataPaths"] = [[String: Any]]() // Empty dataPaths array
                  jsonRgb121Array.append(jsonRgb121Object)
              }
          }
        
        if let udaAssets = assets.uda {
          for asset in udaAssets {
                var udaObject = [String: Any]()
                udaObject["assetId"] = asset.assetId
                udaObject["balance"] = [
                    "future": asset.balance.future,
                    "settled": asset.balance.settled,
                    "spendable": asset.balance.spendable,
                ]
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
                udaObject["ticker"] = asset.ticker
                udaObject["details"] = asset.details
                udaObject["name"] = asset.name
                udaObject["precision"] = asset.precision
                udaObject["issuedSupply"] = asset.issuedSupply
                udaObject["timestamp"] = asset.timestamp
                udaObject["addedAt"] = asset.addedAt
                udaObject["token"] = [
                  "index": asset.token?.index,
                  "ticker": asset.token?.ticker,
                  "name": asset.token?.name,
                  "details": asset.token?.details,
                  "embeddedMedia": asset.token?.embeddedMedia,
                  "reserves": asset.token?.reserves,
                  "attachments": attachmentsArray,
                  "media": media
                ]
                udaObject["assetIface"] = "\(asset.assetIface)"
                udaArray.append(udaObject)
            }
        }
          
          let data: [String: Any] = [
              "nia": jsonArray,
              "cfa": jsonRgb121Array,
              "uda": udaArray
          ]
          
          let json = Utility.convertToJSONString(params: data)
          return json
          
      } catch {
          print("Error: \(error)")
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
      default:
        throw error
      }
    }
    fatalError("Missing return statement")
  }
  
  @objc func createUTXOs(feeRate: Int, callback: @escaping ((String) -> Void)) {
      print("Creating UTXOs... \(feeRate)")
      
      // Safely unwrap rgbWallet and online
      guard let wallet = self.rgbManager.rgbWallet, let online = self.rgbManager.online else {
          let data: [String: Any] = [
              "error": "RGB Wallet or Online service is not initialized."
          ]
          let json = Utility.convertToJSONString(params: data)
          callback(json)
          return
      }
      
      do {
          return try handleMissingFunds {
              var attempts = 3
              var newUTXOs: UInt8 = 0
                            while newUTXOs == 0 && attempts > 0 {
                  print("Attempting to create UTXOs, attempts left: \(attempts)")
                              newUTXOs = try wallet.createUtxos(online: online, upTo: false, num: nil, size: nil, feeRate: Float(feeRate), skipSync: true)
                  print("newUTXOs=\(newUTXOs)")
                  attempts -= 1
              }
              
              let data: [String: Any] = [
                  "created": newUTXOs > 0
              ]
              let json = Utility.convertToJSONString(params: data)
              callback(json)
          }
          
      } catch let error {
          let data: [String: Any] = [
              "error": error.localizedDescription
          ]
          let json = Utility.convertToJSONString(params: data)
          callback(json)
      }
  }

  
//  private func createUTXOs()->UInt8{
//    return try! self.rgbManager.rgbWallet!.createUtxos(online: self.rgbManager.online!, upTo: false, num: nil, size: nil, feeRate: Float(Constants.defaultFeeRate))
//  }
  
  func genReceiveData(assetID: String, amount: Float) -> String {
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
              let bindData = try wallet.blindReceive(
                assetId: assetID != "" ? assetID : nil,
                amount: amount != 0 ? UInt64(amount) : nil,
                  durationSeconds: Constants.rgbBlindDuration,
                  transportEndpoints: [Constants.proxyConsignmentEndpoint],
                  minConfirmations: 0
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
          let data: [String: Any] = [
              "error": error.localizedDescription
          ]
          let json = Utility.convertToJSONString(params: data)
          return json
      }
  }
  
  @objc func failTransfer(batchTransferIdx: Int32, noAssetOnly: Bool, callback: @escaping ((String) -> Void)) {
    do{
      let status = try self.rgbManager.rgbWallet!.failTransfers(online: self.rgbManager.online!, batchTransferIdx: batchTransferIdx, noAssetOnly: noAssetOnly, skipSync: false)
      let data: [String: Any] = [
          "status": status
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch{
      let data: [String: Any] = [
          "status": false,
          "error": error.localizedDescription
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func getWalletData(callback: @escaping ((String) -> Void)) {
    do{
      let walletData = self.rgbManager.rgbWallet!.getWalletData()
      let data: [String: Any] = [
        "dataDir": walletData.dataDir,
//        "bitcoinNetwork": walletData.bitcoinNetwork,
//        "databaseType": walletData.databaseType,
        "maxAllocationsPerUtxo": walletData.maxAllocationsPerUtxo,
        "mnemonic": walletData.mnemonic,
        "pubkey": walletData.pubkey,
        "vanillaKeychain": walletData.vanillaKeychain,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch{
      let data: [String: Any] = [
          "status": false,
          "error": error.localizedDescription
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func deleteTransfers(batchTransferIdx: Int32, noAssetOnly: Bool, callback: @escaping ((String) -> Void)) {
    do{
      let status = try self.rgbManager.rgbWallet!.deleteTransfers( batchTransferIdx: batchTransferIdx, noAssetOnly: noAssetOnly)
      let data: [String: Any] = [
          "status": status
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch{
      let data: [String: Any] = [
          "status": false,
          "error": error.localizedDescription
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func decodeInvoice(invoiceString: String, callback: @escaping ((String) -> Void)) {
    do{
      let invoice = try Invoice(invoiceString: invoiceString).invoiceData()
      let data: [String: Any] = [
        "recipientId": invoice.recipientId,
        "expirationTimestamp": invoice.expirationTimestamp ?? 0,
        "assetId": invoice.assetId,
        "assetIface": invoice.assetIface,
        "network": invoice.network,
        "transportEndpoints": invoice.transportEndpoints
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    } catch {
      let data: [String: Any] = [
          "error": error.localizedDescription
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func getAddress(callback: @escaping ((String) -> Void)) {
    do{
      let address = try self.rgbManager.rgbWallet!.getAddress()
      callback(address)
    } catch{
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
    
  }
  
  
  @objc func receiveAsset(assetID: String, amount: Float,callback: @escaping ((String) -> Void)){
    let response = genReceiveData(assetID: assetID, amount: amount)
    callback(response)
  }
  
  @objc func syncRgb(callback: @escaping ((String) -> Void)){
    do {
      let wallet = getRgbWallet()
      callback(getRgbAssets())
    }catch{
      callback("{}")
    }
  }
  
  @objc func getRgbAssetMetaData(assetId:String, callback: @escaping ((String) -> Void)){
    do {
      callback(getRgbAssetMetaData( assetId: assetId))
    }catch{
      callback("{}")
    }
  }
  
  @objc func getRgbAssetTransactions(assetId:String, callback: @escaping ((String) -> Void)){
    do {
      callback(getRgbAssetTransfers(assetId: assetId))
    }catch{
      print(error)
      callback("[]")
    }
  }
  
  @objc func initiate(btcNetwotk: String, mnemonic: String, pubkey: String, callback: @escaping ((String) -> Void)) -> Void{
    self.rgbManager = RgbManager.shared
    let result =  self.rgbManager.initialize(bitcoinNetwork: btcNetwotk, pubkey: pubkey, mnemonic: mnemonic)
    callback(result)
  }
  
  @objc func issueRgb20Asset(ticker: String, name: String, supply: String,callback: @escaping ((String) -> Void)) -> Void{
    do{
      return try handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetNia(online: self.rgbManager.online!, ticker: ticker, name: name, precision: 0, amounts: [UInt64(UInt64(supply)!)])
        let data: [String: Any] = [
          "assetId": asset?.assetId,
          "name": asset?.name,
          "ticker": asset?.ticker,
          "precision": asset?.precision,
          "futureBalance": asset?.balance.future,
          "settledBalance": asset?.balance.settled,
          "spendableBalance": asset?.balance.spendable
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
    } catch{
      print(error)
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func issueRgb121Asset(name: String, description: String, supply: String, filePath: String, callback: @escaping ((String) -> Void)) -> Void{
    do{
      return try handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetCfa(online: self.rgbManager.online!, name: name, details: description, precision: 0, amounts: [UInt64(UInt64(supply)!)], filePath: filePath)
        var dataPaths: [[String: Any]] = []
        let data: [String: Any] = [
          "assetId": asset?.assetId,
          "name": asset?.name,
          "description": asset?.details,
          "precision": asset?.precision,
          "futureBalance": asset?.balance.future,
          "settledBalance": asset?.balance.settled,
          "spendableBalance": asset?.balance.spendable,
          "dataPaths": dataPaths
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
    } catch{
      print(error)
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func issueAssetUda(name: String,ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: [String], callback: @escaping ((String) -> Void)) -> Void{
    do{
      return try handleMissingFunds {
        let asset = try self.rgbManager.rgbWallet?.issueAssetUda(online: self.rgbManager.online!, ticker: ticker, name: name, details: details, precision: 0, mediaFilePath: mediaFilePath, attachmentsFilePaths: attachmentsFilePaths)
        var dataPaths: [[String: Any]] = []
        let data: [String: Any] = [
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
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
    } catch{
      print(error)
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func sendAsset(assetId: String, blindedUTXO: String, amount: String, consignmentEndpoints: String, fee: NSNumber, callback: @escaping ((String) -> Void)) -> Void{
    do{
      var recipientMap: [String: [Recipient]] = [:]
      let recipient = Recipient(recipientId: blindedUTXO, witnessData: nil, amount: UInt64(amount)!, transportEndpoints: [consignmentEndpoints])
      recipientMap[assetId] = [recipient]
      let response = try handleMissingFunds {
        return try self.rgbManager.rgbWallet?.send(online: self.rgbManager.online!, recipientMap: recipientMap, donation: false, feeRate: Float(truncating: fee), minConfirmations: 0, skipSync: true)
      }
      print(response)
      let data: [String: Any] = [
        "txid": response?.txid
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }catch{
      print(error)
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  private func fetchRecordFromICloud(recordID: String,completion: @escaping (_ error: String?, _ isError: Bool, _ fileURL: String?) -> Void){
      let container = CKContainer.default()
      let privateDatabase = container.privateCloudDatabase
      let recordID = CKRecord.ID(recordName: recordID)
      privateDatabase.fetch(withRecordID: recordID) { (fetchedRecord, error) in
          if let fetchedRecord = fetchedRecord {
              print("Record fetched successfully:")
              print("Record Type: \(fetchedRecord.recordType)")
              print("Record ID: \(fetchedRecord.recordID.recordName)")
            if let fileAsset = fetchedRecord["rgb_backup"] as? CKAsset {
                           let fileURL = fileAsset.fileURL
              print("Record found: \(fileURL?.path)")
              completion("Record found", false, fileURL?.path)
              } else {
                completion("Record not found in iCloud", true, nil)
              }
          } else {
              if let error = error {
                  print("Error fetching record from iCloud: \(error.localizedDescription)")
                completion(error.localizedDescription, true, nil)
              } else {
                  print("Record not found in iCloud")
                completion("Record not found in iCloud", true, nil)
              }
          }
      }
  }
  
  func getICloudFolder() -> URL? {
    let fileManager = FileManager.default
      guard let iCloudURL = fileManager.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
          print("iCloud is not available.")
          return nil
      }
    return iCloudURL
  }
  
  func uploadToIcloud(url: URL,  completion: @escaping (_ error: String?, _ isError: Bool) -> Void) {
    print("uploading to iCloud...")
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
  
  @objc func backup(path: String, password: String,callback: @escaping ((String) -> Void)) -> Void{
    do{
      let keys = try restoreKeys(bitcoinNetwork: BitcoinNetwork.regtest, mnemonic: password)

      let filePath = Utility.getBackupPath(fileName: keys.accountXpubFingerprint)
      print("filePath \(String(describing: filePath))")

      let response = try self.rgbManager.rgbWallet?.backup(backupPath: filePath?.path ?? "", password: password)
            print("backup \(TAG) \(String(describing: response))")
      
      var data: [String: Any] = [:]
      data = [
        "message": "Backup successful",
        "file": filePath?.path ?? "",
        "error": ""
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
      return
//      uploadToIcloud(url: filePath!, completion: {
//        (error, isError) in
//        if isError {
//          print("Error: \(error ?? "Unknown error")")
//          data = [
//            "message": "Backup successful",
//            "file": filePath?.path ?? "",
//            "error": error ?? "Unknown error"
//          ]
//          let json = Utility.convertToJSONString(params: data)
//          callback(json)
//        } else {
//          print("Upload successful")
//          data = [
//            "message": "Backup successful",
//            "file": filePath?.path ?? "",
//            "error": ""
//          ]
//          let json = Utility.convertToJSONString(params: data)
//          callback(json)
//        }
//      })
    }catch let error{
      print(error)
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func isBackupRequired(callback: @escaping ((Bool) -> Void)) -> Void{
    do{
      let response = try self.rgbManager.rgbWallet?.backupInfo()
      callback(response ?? false)
    }
    catch{
      print(false)
    }
  }
  
  @objc func restore(mnemonic: String, backupPath: String, callback: @escaping ((String) -> Void)) -> Void{
    do{
//      if FileManager.default.fileExists(atPath: backupPath) {
//          print("The file exists at the specified path.")
//      } else {
//          print("The file does not exist at the specified path.")
//      }
      NSString(string: backupPath).expandingTildeInPath
      try restoreBackup(backupPath: backupPath, password: mnemonic, dataDir: Utility.getRgbDir()?.path ?? "")
    }
    catch let error{
      print("error \(error):")
      print("error \(error.localizedDescription):")
      
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
  
  @objc func isValidBlindedUtxo(invoiceData: String,callback: @escaping ((Bool) -> Void)) -> Void{
    do{
      try Invoice(invoiceString: invoiceData)
      callback(true)
    }
    catch{
      callback(false)
    }}
  
}
