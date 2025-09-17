package io.hexawallet.hexa
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.bithyve.tribe.AppConstants
import com.bithyve.tribe.RGBHelper
import com.bithyve.tribe.RGBWalletRepository
import com.facebook.react.bridge.ReadableArray
import com.google.gson.JsonArray
import kotlinx.coroutines.*
import kotlinx.coroutines.withContext
import org.rgbtools.Assignment
import org.rgbtools.BitcoinNetwork


class RGBModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    val TAG = "RGBMODULE"
    private val coroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    companion object {
        private val gson = Gson()
    }

    override
    fun getName() = "RGB"

    private fun getRgbNetwork(network: String): BitcoinNetwork {
        return if (network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
    }

    private suspend fun resolvePromise(promise: Promise, result: String) {
        withContext(Dispatchers.Main) {
            promise.resolve(result)
        }
    }

    private suspend fun resolvePromiseWithError(promise: Promise, errorMessage: String, methodName: String) {
        Log.e(TAG, "$methodName failed: $errorMessage")
        withContext(Dispatchers.Main) {
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", errorMessage)
            promise.resolve(jsonObject.toString())
        }
    }

    private fun createErrorResponse(errorMessage: String): String {
        val jsonObject = JsonObject()
        jsonObject.addProperty("error", errorMessage)
        return jsonObject.toString()
    }



    @ReactMethod
    fun generateKeys(network: String, promise: Promise) {
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val rgbNetwork = getRgbNetwork(network)
                val keys = org.rgbtools.generateKeys(rgbNetwork)
                val json = gson.toJson(keys)
                resolvePromise(promise, json.toString())
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to generate keys", "generateKeys")
            }
        }
    }

    @ReactMethod
    fun restoreKeys(network: String, mnemonic: String, promise: Promise) {
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val rgbNetwork = RGBWalletRepository.getNetwork(network)
                val keys = org.rgbtools.restoreKeys(rgbNetwork, mnemonic)
                val json = gson.toJson(keys)
                resolvePromise(promise, json.toString())
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to restore keys", "restoreKeys")
            }
        }
    }

    @ReactMethod
    fun getAddress(promise: Promise) {
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val address = RGBHelper.getAddress()
                withContext(Dispatchers.Main) {
                    promise.resolve(address)
                }
            } catch (e: Exception) {
                Log.e(TAG, "getAddress failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to get address")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun initiate(network: String, mnemonic: String, accountXpubVanilla: String, accountXpubColored: String, masterFingerprint: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val result = RGBWalletRepository.initialize(network,accountXpubVanilla,accountXpubColored,mnemonic, masterFingerprint)
                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "initiate failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to initialize wallet")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun sync(mnemonic: String, network: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    promise.resolve("")
                }
            } catch (e: Exception) {
                Log.e(TAG, "sync failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to sync")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getBalance(mnemonic: String, network: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    promise.resolve("")
                }
            } catch (e: Exception) {
                Log.e(TAG, "getBalance failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to get balance")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getTransactions(mnemonic: String, network: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    promise.resolve("")
                }
            } catch (e: Exception) {
                Log.e(TAG, "getTransactions failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to get transactions")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun syncRgbAssets(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val result = RGBHelper.syncRgbAssets()
                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "syncRgbAssets failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to sync RGB assets")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun receiveAsset(assetID: String, amount: Float, expiry: Int, blinded: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val result = RGBHelper.receiveAsset(assetID, amount.toULong(), expiry.toUInt(), blinded)
                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "receiveAsset failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to receive asset")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun createUtxos(feeRate: Float, num: Int, size: Int, upTo: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val created = RGBHelper.createNewUTXOs(feeRate, num, size, upTo)
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", "")
                jsonObject.addProperty("created", created)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "createUtxos failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to create UTXOs")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun createUtxosBegin(upTo: Boolean, num: Int, size: Int, feeRate: Float, skipSync: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val unsignedPsbt = RGBHelper.createUtxosBegin(upTo, num, size, feeRate, skipSync)
                val jsonObject = JsonObject()
                jsonObject.addProperty("unsignedPsbt", unsignedPsbt)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "createUtxosBegin failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to begin UTXO creation")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun signPsbt(unsignedPsbt: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val signedPsbt = RGBHelper.signPsbt(unsignedPsbt)
                val jsonObject = JsonObject()
                jsonObject.addProperty("signedPsbt", signedPsbt)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "signPsbt failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to sign PSBT")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun createUtxosEnd(signedPsbt: String, skipSync: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val num = RGBHelper.createUtxosEnd(signedPsbt, skipSync)
                val jsonObject = JsonObject()
                jsonObject.addProperty("num", num?.toInt())
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "createUtxosEnd failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to end UTXO creation")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun issueAssetNia(ticker: String, name: String, supply: String, precision: Int, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueAssetNia(ticker, name, amounts.map { it.toULong() }, precision)
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "issueAssetNia failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to issue NIA asset")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun issueAssetCfa(name: String, description: String, supply: String, precision: Int, filePath: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueAssetCfa(name, description, amounts.map { it.toULong() }, precision, filePath)
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "issueAssetCfa failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to issue CFA asset")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun issueAssetUda(name: String, ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: ReadableArray, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val attachments = mutableListOf<String>()
                for (i in 0 until attachmentsFilePaths.size()) {
                    attachments.add(attachmentsFilePaths.getString(i))
                }
                val response = RGBHelper.issueAssetUda(name, ticker, details, mediaFilePath, attachments)
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "issueAssetUda failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to issue UDA asset")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getRgbAssetMetaData(assetId: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val metadata = RGBHelper.getMetadata(assetId)
                withContext(Dispatchers.Main) {
                    promise.resolve(metadata)
                }
            } catch (e: Exception) {
                Log.e(TAG, "getRgbAssetMetaData failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to get asset metadata")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getRgbAssetTransactions(assetId: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val transactions = RGBHelper.getAssetTransfers(assetId)
                withContext(Dispatchers.Main) {
                    promise.resolve(transactions)
                }
            } catch (e: Exception) {
                Log.e(TAG, "getRgbAssetTransactions failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to get asset transactions")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun sendAsset(assetId: String, blindedUTXO: String, amount: Float, consignmentEndpoints: String, feeRate: Float, isDonation: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val endpoints = listOf(consignmentEndpoints)
                val result = RGBHelper.send(assetId, blindedUTXO, amount.toULong(), endpoints, feeRate, isDonation)
                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "sendAsset failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to send asset")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun failTransfer(batchTransferIdx: Int, noAssetOnly: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val status = RGBHelper.failTransfer(batchTransferIdx, noAssetOnly, true)
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", status)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "failTransfer failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to fail transfer")
                    jsonObject.addProperty("status", false)
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun deleteTransfers(batchTransferIdx: Int, noAssetOnly: Boolean, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val status = RGBHelper.deleteTransfers(batchTransferIdx, noAssetOnly)
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", status)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "deleteTransfers failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to delete transfers")
                    jsonObject.addProperty("status", false)
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getWalletData(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val walletData = RGBHelper.getWalletData()
                val json = gson.toJson(walletData)
                resolvePromise(promise, json)
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to get wallet data", "getWalletData")
            }
        }
    }

    @ReactMethod
    fun getBtcBalance(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val balance = RGBHelper.getBtcBalance()
                val json = gson.toJson(balance)
                resolvePromise(promise, json)
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to get BTC balance", "getBtcBalance")
            }
        }
    }

    @ReactMethod
    fun decodeInvoice(invoiceString: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val invoice = RGBHelper.decodeInvoice(invoiceString)
                val jsonObject = JsonObject()
                jsonObject.addProperty("assetId", invoice.assetId)
                jsonObject.addProperty("recipientId", invoice.recipientId)
                jsonObject.addProperty("network", invoice.network.name)
                val assignmentJsonObject = JsonObject()
                when (val assignment = invoice.assignment) {
                    is Assignment.Fungible -> {
                        assignmentJsonObject.addProperty("type", "Fungible")
                        assignmentJsonObject.addProperty("amount", assignment.amount.toString())
                    }
                    is Assignment.NonFungible -> {
                        assignmentJsonObject.addProperty("type", "NonFungible")
                    }
                    is Assignment.InflationRight -> {
                        assignmentJsonObject.addProperty("type", "InflationRight")
                        assignmentJsonObject.addProperty("amount", assignment.amount.toString())
                    }
                    is Assignment.ReplaceRight -> {
                        assignmentJsonObject.addProperty("type", "ReplaceRight")
                    }
                    is Assignment.Any -> {
                        assignmentJsonObject.addProperty("type", "Any")
                    }
                }
                jsonObject.add("assignment", assignmentJsonObject)

                val jsonArray = JsonArray()
                invoice.transportEndpoints.forEach { endpoint ->
                    jsonArray.add(endpoint)
                }
                jsonObject.add("transportEndpoints", jsonArray)
                jsonObject.addProperty("expirationTimestamp", invoice.expirationTimestamp)
                jsonObject.addProperty("expirationTimestamp", invoice.expirationTimestamp)
                withContext(Dispatchers.Main) {
                    promise.resolve(jsonObject.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "decodeInvoice failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to decode invoice")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getUnspents(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val rgbUtxo = RGBHelper.getUnspents()
                resolvePromise(promise, gson.toJson(rgbUtxo))
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to get unspents", "getUnspents")
            }
        }
    }

    @ReactMethod
    fun refreshAsset(assetId: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val rgbUtxo = RGBHelper.getUnspents()
                //val bitcoinUtxo = BdkHelper.getUnspents()
                val jsonObject = JsonObject()
                jsonObject.addProperty("rgb", gson.toJson(rgbUtxo))
                //jsonObject.addProperty("bitcoin", Gson().toJson(bitcoinUtxo))
                resolvePromise(promise, jsonObject.toString())
            } catch (e: Exception) {
                resolvePromiseWithError(promise, e.message ?: "Failed to refresh asset", "refreshAsset")
            }
        }
    }

    @ReactMethod
    fun isValidBlindedUtxo(invoice: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val response = RGBHelper.isValidInvoice(invoice)
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "isValidBlindedUtxo failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to validate blinded UTXO")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun backup(backupPath: String, password: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val response = RGBHelper.backup(backupPath, password, reactApplicationContext)
                withContext(Dispatchers.Main) {
                    promise.resolve(response.toString())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Backup failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Backup failed")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun isBackupRequired(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val response = RGBHelper.getBackupInfo()
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "isBackupRequired failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to check backup status")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun restore(mnemonic: String, filePath: String, promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val response = RGBHelper.restore(mnemonic, filePath, reactApplicationContext)
                withContext(Dispatchers.Main) {
                    promise.resolve(response)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Restore failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Restore failed")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun resetData(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                AppConstants.rgbDir.delete()
                withContext(Dispatchers.Main) {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "resetData failed: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    val jsonObject = JsonObject()
                    jsonObject.addProperty("error", e.message ?: "Failed to reset data")
                    promise.resolve(jsonObject.toString())
                }
            }
        }
    }

    @ReactMethod
    fun getRgbDir(promise: Promise){
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val dir = AppConstants.rgbDir.absolutePath
                val jsonObject = JsonObject()
                jsonObject.addProperty("dir", dir)
                promise.resolve(jsonObject.toString())
            } catch (e: Exception) {
                Log.e(TAG, "resetData failed: ${e.message}", e)
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", e.message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    fun cleanup() {
        coroutineScope.cancel()
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cleanup()
    }
}
