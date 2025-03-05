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
import kotlinx.coroutines.*
import org.rgbtools.BitcoinNetwork


class RGBModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    val TAG = "RGBMODULE"
    private val coroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    override
    fun getName() = "RGB"

    private fun getRgbNetwork(network: String): BitcoinNetwork {
        return if (network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
    }

    @ReactMethod
    fun generateKeys(network: String, promise: Promise) {
        val rgbNetwork = if(network == "TESTNET") BitcoinNetwork.TESTNET else BitcoinNetwork.MAINNET
        val keys = org.rgbtools.generateKeys(rgbNetwork)
        val gson = Gson()
        val json = gson.toJson(keys)
        promise.resolve(json.toString())
    }

    @ReactMethod
    fun restoreKeys(network: String, mnemonic: String, promise: Promise) {
        val rgbNetwork = RGBWalletRepository.getNetwork(network)
        val keys = org.rgbtools.restoreKeys(rgbNetwork, mnemonic)
        val gson = Gson()
        val json = gson.toJson(keys)
        promise.resolve(json.toString())
    }

    @ReactMethod
    fun getAddress(promise: Promise) {
        promise.resolve(RGBHelper.getAddress())
    }
    @ReactMethod
    fun initiate(network: String, mnemonic:String, xpub: String, promise: Promise){
        promise.resolve(RGBWalletRepository.initialize(network,mnemonic,xpub))
    }

    @ReactMethod
    fun sync( mnemonic:String, network: String, promise: Promise){
    }

    @ReactMethod
    fun getBalance( mnemonic:String,network: String, promise: Promise){
        promise.resolve("")
    }

    @ReactMethod
    fun getTransactions( mnemonic:String,network: String, promise: Promise){
        promise.resolve("")
    }

    @ReactMethod
    fun syncRgbAssets(promise: Promise){
        coroutineScope.launch {
            promise.resolve(RGBHelper.syncRgbAssets())
        }
    }

    @ReactMethod
    fun receiveAsset(assetID: String, amount: Float, promise: Promise){
        coroutineScope.launch{
            try {
                promise.resolve(RGBHelper.receiveAsset(assetID, amount.toULong()))
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun createUtxos(feeRate: Float, promise: Promise){
        coroutineScope.launch {
            try {
                val created = RGBHelper.createNewUTXOs(feeRate)
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", "")
                jsonObject.addProperty("created", created)
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun createUtxosBegin(upTo: Boolean, num: Int, size: Int, feeRate: Float, skipSync: Boolean, promise: Promise){
        coroutineScope.launch {
            try {
                val unsignedPsbt = RGBHelper.createUtxosBegin(upTo, num, size, feeRate, skipSync)
                val jsonObject = JsonObject()
                jsonObject.addProperty("unsignedPsbt", unsignedPsbt)
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun signPsbt(unsignedPsbt: String, promise: Promise){
        coroutineScope.launch {
            try {
                val signedPsbt = RGBHelper.signPsbt(unsignedPsbt)
                val jsonObject = JsonObject()
                jsonObject.addProperty("signedPsbt", signedPsbt)
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun createUtxosEnd(signedPsbt: String, skipSync: Boolean, promise: Promise){
        coroutineScope.launch {
            try {
                val num = RGBHelper.createUtxosEnd(signedPsbt, skipSync)
                val jsonObject = JsonObject()
                jsonObject.addProperty("num", num?.toInt())
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun issueAssetNia(ticker: String, name: String, supply: String, precision: Int, promise: Promise){
        coroutineScope.launch {
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueAssetNia(ticker, name, amounts.map { it.toULong() }, precision)
                promise.resolve(response)
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun issueAssetCfa(name: String, description: String, supply: String, precision: Int, filePath: String, promise: Promise){
        coroutineScope.launch{
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueAssetCfa(name, description, amounts.map { it.toULong() }, precision, filePath)
                promise.resolve(response)
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun issueAssetUda(name: String, ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: ReadableArray, promise: Promise){
        coroutineScope.launch{
            try {
                val attachments = mutableListOf<String>()
                for (i in 0 until attachmentsFilePaths.size()) {
                    attachments.add(attachmentsFilePaths.getString(i))
                }
                val response = RGBHelper.issueAssetUda(name,ticker, details, mediaFilePath, attachments)
                promise.resolve(response)
            }catch (e: Exception) {
                Log.d(TAG, "issueAssetUda:e.message ${e.message}")
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun getRgbAssetMetaData( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getMetadata(assetId))
    }

    @ReactMethod
    fun getRgbAssetTransactions( assetId: String, promise: Promise){
        promise.resolve(RGBHelper.getAssetTransfers(assetId))
    }

    @ReactMethod
    fun sendAsset( assetId: String, blindedUTXO: String, amount: Float, consignmentEndpoints: String, feeRate: Float, isDonation: Boolean, promise: Promise){
        coroutineScope.launch {
            try {
                val endpoints = listOf(consignmentEndpoints)
                promise.resolve(RGBHelper.send(assetId, blindedUTXO, amount.toULong(), endpoints, feeRate, isDonation))
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun failTransfer( batchTransferIdx: Int, noAssetOnly: Boolean, promise: Promise){
        coroutineScope.launch {
            try {
                val status = RGBHelper.failTransfer(batchTransferIdx, noAssetOnly, true)
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", status)
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                jsonObject.addProperty("status", false)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun deleteTransfers( batchTransferIdx: Int, noAssetOnly: Boolean, promise: Promise){
        coroutineScope.launch {
            try {
                val status = RGBHelper.deleteTransfers(batchTransferIdx, noAssetOnly)
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", status)
                promise.resolve(jsonObject.toString())
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                jsonObject.addProperty("status", false)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun getWalletData(promise: Promise){
        coroutineScope.launch {
            try {
                val walletData = RGBHelper.getWalletData()
                val gson = Gson()
                val json = gson.toJson(walletData)
                promise.resolve(json)
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                jsonObject.addProperty("status", false)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun getBtcBalance(promise: Promise){
        coroutineScope.launch {
            try {
                val balance = RGBHelper.getBtcBalance()
                val gson = Gson()
                val json = gson.toJson(balance)
                promise.resolve(json)
            }catch (e: Exception) {
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun decodeInvoice(invoiceString: String, promise: Promise){
        try {
            val invoice = RGBHelper.decodeInvoice(invoiceString)
            val jsonObject = JsonObject()
            jsonObject.addProperty("assetId", invoice.assetId)
            jsonObject.addProperty("recipientId", invoice.recipientId)
            jsonObject.addProperty("network", invoice.network.name)
            jsonObject.addProperty("amount", invoice.amount?.toFloat() ?: 0)
            jsonObject.addProperty("transportEndpoints", invoice.transportEndpoints.toString())
            jsonObject.addProperty("assetIface", invoice.assetIface?.name ?: "")
            jsonObject.addProperty("expirationTimestamp", invoice.expirationTimestamp)
            jsonObject.addProperty("expirationTimestamp", invoice.expirationTimestamp)
            promise.resolve(jsonObject.toString())
        } catch (e: Exception) {
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            promise.resolve(jsonObject.toString())
        }
    }

    @ReactMethod
    fun getUnspents(promise: Promise){
        val rgbUtxo = RGBHelper.getUnspents()
        promise.resolve(Gson().toJson(rgbUtxo))
    }

    @ReactMethod
    fun refreshAsset(assetId: String, promise: Promise){
        coroutineScope.launch {
            val rgbUtxo = RGBHelper.getUnspents()
            //val bitcoinUtxo = BdkHelper.getUnspents()
            val jsonObject = JsonObject()
            jsonObject.addProperty("rgb", Gson().toJson(rgbUtxo))
            //jsonObject.addProperty("bitcoin", Gson().toJson(bitcoinUtxo))
            promise.resolve(jsonObject.toString())
        }
    }
    @ReactMethod
    fun isValidBlindedUtxo(invoice:String,promise: Promise){
        val response = RGBHelper.isValidInvoice(invoice)
        promise.resolve(response)
    }

    @ReactMethod
    fun backup(backupPath: String, password: String, promise: Promise){
        coroutineScope.launch {
            val response = RGBHelper.backup(backupPath, password, reactApplicationContext)
            promise.resolve(response.toString())
        }
    }

    @ReactMethod
    fun isBackupRequired(promise: Promise){
        val response = RGBHelper.getBackupInfo()
        promise.resolve(response)
    }

    @ReactMethod
    fun restore(mnemonic: String,filePath: String, promise: Promise){
        coroutineScope.launch {
            val response = RGBHelper.restore(mnemonic, filePath, reactApplicationContext)
            promise.resolve(response)
        }
    }

    @ReactMethod
    fun resetData(promise: Promise){
        AppConstants.rgbDir.delete()
        promise.resolve(true)
    }
}
