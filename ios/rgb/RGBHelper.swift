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
  
  func getRgbNetwork(network: String)->BitcoinNetwork{
    return network == "TESTNET" ? BitcoinNetwork.testnet : BitcoinNetwork.mainnet
  }
  
  @objc func generate_keys(btcNetwotk: String, callback: @escaping ((String) -> Void)){
    let network = getRgbNetwork(network: btcNetwotk)
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
    let network = getRgbNetwork(network: btcNetwotk)
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
  
  func getRgbWallet()->Wallet?{
    return self.rgbManager.rgbWallet
  }
  
  func getRgbAssetMetaData(assetId: String)->String{
    do{
      let metaData = try self.rgbManager.rgbWallet!.getAssetMetadata(assetId: assetId)
      var jsonObject = [String: Any]()
      jsonObject["assetId"] = assetId
      jsonObject["precision"] = metaData.precision
      jsonObject["name"] = metaData.name
      jsonObject["ticker"] = metaData.ticker
      jsonObject["description"] = metaData.details
      jsonObject["timestamp"] = metaData.timestamp
      jsonObject["assetIface"] = "\(metaData.assetIface)"
      jsonObject["assetSchema"] = "\(metaData.assetSchema)"
      //jsonObject["parentId"] = metaData.parentId
      jsonObject["issuedSupply"] = metaData.issuedSupply
      
      let jsonData = try JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted)
      let jsonString = String(data: jsonData, encoding: .utf8)!
      return jsonString
    }catch{
      print(error)
      return "{}"
    }
  }
  
  func getRgbAssetTransfers(assetId: String)->String{
    do{
      let refresh = try self.rgbManager.rgbWallet!.refresh(online: self.rgbManager.online!, assetId: assetId, filter: [RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])
      let transfers = try self.rgbManager.rgbWallet!.listTransfers(assetId: assetId)
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
          "vout": transfer.receiveUtxo?.vout,
        ]
        jsonObject["changeUtxo"] = [
          "txid": transfer.changeUtxo?.txid,
          "vout": transfer.changeUtxo?.vout,
        ]
        jsonObject["consignmentEndpoints"] =
        transfer.transportEndpoints.map{ endpoint in
          return [
            "endpoint": endpoint.endpoint,
            "used": endpoint.used,
            "transportType": "\(endpoint.transportType)"
          ]
        }
        jsonArray.append(jsonObject)
      }
      print(jsonArray)
      let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: .prettyPrinted)
      let jsonString = String(data: jsonData, encoding: .utf8)!
      return jsonString
    }catch{
      print(error)
      return "{}"
    }
  }
  
  func getRgbAssets()->String{
    do{
      let refresh = try self.rgbManager.rgbWallet!.refresh(online: self.rgbManager.online!, assetId: nil, filter: [])
      let assets = try self.rgbManager.rgbWallet!.listAssets(filterAssetSchemas: [])
      if((assets.nia) != nil) {
        try assets.nia?.forEach({ AssetNia in
          try self.rgbManager.rgbWallet!.refresh(online: self.rgbManager.online!, assetId: AssetNia.assetId, filter: [])
        })
      }
      if((assets.cfa) != nil) {
        try assets.cfa?.forEach({ AssetCfa in
          try self.rgbManager.rgbWallet!.refresh(online: self.rgbManager.online!, assetId: AssetCfa.assetId, filter: [])
        })
      }
      var jsonArray = [[String: Any]]()
      var jsonRgb121Array = [[String: Any]]()
      for asset in assets.nia! {
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
        jsonObject["dataPaths"] = asset.media
        jsonObject["assetIface"] = "\(asset.assetIface)"
        jsonArray.append(jsonObject)
      }
      for asset in assets.cfa! {
        var jsonRgb121Object = [String: Any]()
        jsonRgb121Object["assetId"] = asset.assetId
        jsonRgb121Object["balance"] = [
          "future": asset.balance.future,
          "settled": asset.balance.settled,
          "spendable": asset.balance.spendable,
        ]
        jsonRgb121Object["description"] = asset.details
        jsonRgb121Object["name"] = asset.name
        jsonRgb121Object["precision"] = asset.precision
        jsonRgb121Object["issuedSupply"] = asset.issuedSupply
        jsonRgb121Object["timestamp"] = asset.timestamp
        jsonRgb121Object["addedAt"] = asset.addedAt
        jsonRgb121Object["dataPaths"] = asset.media
        jsonRgb121Object["assetIface"] = "\(asset.assetIface)"
        
        var jsonDataPaths: [[String: Any]] = []
        
//        asset.dataPaths.forEach { Media in
//          let jsonDatapath: [String: Any] = [
//            "mime": Media.mime,
//            "filePath": Media.filePath
//          ]
//          jsonDataPaths.append(jsonDatapath)
//        }
        jsonRgb121Object["dataPaths"] = jsonDataPaths
        jsonRgb121Array.append(jsonRgb121Object)
      }
      try JSONSerialization.data(withJSONObject: jsonArray, options: .prettyPrinted)
      try JSONSerialization.data(withJSONObject: jsonRgb121Array, options: .prettyPrinted)
      let data: [String: Any] = [
        "nia": jsonArray,
        "cfa": jsonRgb121Array
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
    }catch{
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
  
  @objc func createUTXOs(feeRate: Int,callback: @escaping ((String) -> Void)) {
    print("Creating UTXOs... " + String(feeRate))
    do {
      return try handleMissingFunds {
        var attempts = 3
        var newUTXOs: UInt8 = 0
        while newUTXOs == 0 && attempts > 0 {
          print("Calling create UTXOs...")
          newUTXOs = try self.rgbManager.rgbWallet!.createUtxos(online: self.rgbManager.online!, upTo: false, num: nil, size: nil, feeRate: Float(feeRate))
          print("newUTXOs=\(newUTXOs)")
          attempts -= 1
        }
        let data: [String: Any] = [
          "created": true,
        ]
        let json = Utility.convertToJSONString(params: data)
        callback(json)
      }
      
    } catch let error {
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }

  
//  private func createUTXOs()->UInt8{
//    return try! self.rgbManager.rgbWallet!.createUtxos(online: self.rgbManager.online!, upTo: false, num: nil, size: nil, feeRate: Float(Constants.defaultFeeRate))
//  }
  
  func genReceiveData() -> String {
    do {
      return try handleMissingFunds {
        let refresh_ = try self.rgbManager.rgbWallet!.refresh(online: self.rgbManager.online!, assetId: nil, filter: [RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])
        print("\(TAG) refresh_\(refresh_)")
        let bindData = try self.rgbManager.rgbWallet!.blindReceive(assetId: nil, amount: nil, durationSeconds: Constants.rgbBlindDuration, transportEndpoints: [Constants.proxyConsignmentEndpoint], minConfirmations: 0)
        let data: [String: Any] = [
          "invoice": bindData.invoice,
          "recipientId": bindData.recipientId,
          "expirationTimestamp": bindData.expirationTimestamp ?? 0,
          "batchTransferIdx": bindData.batchTransferIdx,
        ]
        let json = Utility.convertToJSONString(params: data)
        return json
      }
    } catch let error {
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
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
  
  
  @objc func receiveAsset(callback: @escaping ((String) -> Void)){
    let response = genReceiveData()
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
//        asset!.dataPaths.forEach { Media in
//          let jsonDatapath: [String: Any] = [
//            "mime": Media.mime,
//            "filePath": Media.filePath
//          ]
//          dataPaths.append(jsonDatapath)
//        }
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
  
  @objc func sendAsset(assetId: String, blindedUTXO: String, amount: String, consignmentEndpoints: String, callback: @escaping ((String) -> Void)) -> Void{
    do{
      var recipientMap: [String: [Recipient]] = [:]
      let recipient = Recipient(recipientId: blindedUTXO, witnessData: nil, amount: UInt64(amount)!, transportEndpoints: [consignmentEndpoints])
      recipientMap[assetId] = [recipient]
      let response = try handleMissingFunds {
        return try self.rgbManager.rgbWallet?.send(online: self.rgbManager.online!, recipientMap: recipientMap, donation: false, feeRate: Float(Constants.defaultFeeRate), minConfirmations: 0)
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

  
  private func uploadBackupOnCloud(recordID: String, filePath: URL, completion: @escaping (_ error: String?, _ isError: Bool) -> Void) {
    let container = CKContainer.default()
    let privateDatabase = container.privateCloudDatabase
    let recordID = CKRecord.ID(recordName:  recordID)
    
    privateDatabase.fetch(withRecordID: recordID) { (existingRecord, error) in
      if let existingRecord = existingRecord {
        print("Record already exists, removing it...")
        privateDatabase.delete(withRecordID: existingRecord.recordID) { (deletedRecordID, deleteError) in
          if let deleteError = deleteError {
            print("Error deleting existing record: \(deleteError.localizedDescription)")
            completion(deleteError.localizedDescription, true)
          } else {
            print("Deleted existing record...")
            let record = CKRecord(recordType: "rgb_backup", recordID: recordID)
            let fileURL = filePath
            
            let asset = CKAsset(fileURL: fileURL)
            privateDatabase.save(record) { (record, error) in
                if let error = error {
                  completion(error.localizedDescription, true)
                    print("Error uploading file to iCloud: \(error.localizedDescription)")
                } else {
                    completion("File uploaded successfully to iCloud", false)
                    print("File uploaded successfully to iCloud")
                  print("record: \(record)")

                }
            }
          }
        }
      } else {
        let record = CKRecord(recordType: "rgb_backup", recordID: recordID)
        let fileURL = filePath
        let asset = CKAsset(fileURL: fileURL)
        privateDatabase.save(record) { (record, error) in
            if let error = error {
                print("Error uploading file to iCloud: \(error.localizedDescription)")
              completion(error.localizedDescription, true)
            } else {
                print("File uploaded successfully to iCloud")
              completion("File uploaded successfully to iCloud", false)
            }
        }
      }
    }
  }
  
  @objc func backup(path: String, password: String,callback: @escaping ((String) -> Void)) -> Void{
    do{
      let keys = try restoreKeys(bitcoinNetwork: BitcoinNetwork.testnet, mnemonic: password)
      let filePath = Utility.getBackupPath(fileName: keys.accountXpubFingerprint)
      let fileName = String(format: Constants.backupName, password)
      let response = try self.rgbManager.rgbWallet?.backup(backupPath: filePath?.path ?? "", password: password)
      //      print("backup \(TAG) \(String(describing: response))")
      
      var data: [String: Any] = [:]
      uploadBackupOnCloud(recordID: keys.accountXpubFingerprint, filePath: filePath!, completion: {
        (error, isError) in
        if isError {
          print("Error: \(error ?? "Unknown error")")
          data = [
            "message": "Backup successful",
            "file": filePath?.path ?? "",
            "error": error ?? "Unknown error"
          ]
          let json = Utility.convertToJSONString(params: data)
          callback(json)
        } else {
          print("Upload successful")
          data = [
            "message": "Backup successful",
            "file": filePath?.path ?? "",
            "error": ""
          ]
          let json = Utility.convertToJSONString(params: data)
          callback(json)
        }
      })
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
  
  @objc func restore(mnemonic: String,callback: @escaping ((String) -> Void)) -> Void{
    do{
      let keys = try restoreKeys(bitcoinNetwork: BitcoinNetwork.testnet, mnemonic: mnemonic)
      fetchRecordFromICloud(recordID: keys.accountXpubFingerprint, completion: {
        (error, isError, url) in
        if isError {
          callback(error!)
        } else {
          do{
           try restoreBackup(backupPath: url!, password: mnemonic, dataDir: Utility.getRgbDir()?.path ?? "")
            callback("true")
          } catch {
            callback("Error: \(error.localizedDescription)")
        }
        }
      })
    }
    catch let error{
      let data: [String: Any] = [
        "error": error.localizedDescription,
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }}
  
  
  
  @objc func isValidBlindedUtxo(invoiceData: String,callback: @escaping ((Bool) -> Void)) -> Void{
    do{
      try Invoice(invoiceString: invoiceData)
      callback(true)
    }
    catch{
      callback(false)
    }}
  
}