package io.hexawallet.hexa
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.gson.Gson
import com.google.gson.JsonObject
import android.os.Handler
import android.os.HandlerThread
import com.bithyve.tribe.AppConstants
import com.bithyve.tribe.RGBHelper
import com.bithyve.tribe.RGBWalletRepository
import com.facebook.react.bridge.ReadableArray
import org.rgbtools.BitcoinNetwork


class RGBModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    val TAG = "RGBMODULE"
    private val backgroundHandler: Handler

    init {
        val handlerThread = HandlerThread("BackgroundThread")
        handlerThread.start()
        backgroundHandler = Handler(handlerThread.looper)
    }
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
        backgroundHandler.post{
            promise.resolve(RGBHelper.syncRgbAssets())
        }
    }

    @ReactMethod
    fun receiveAsset(promise: Promise){
        backgroundHandler.post{
            try {
                promise.resolve(RGBHelper.receiveAsset())
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
        backgroundHandler.post {
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
    fun issueRgb20Asset( ticker: String, name: String, supply: String, promise: Promise){
        backgroundHandler.post {
            Log.d(TAG, "issueRgb20Asset: ${supply}")
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueRgb20Asset(ticker, name, amounts.map { it.toULong() })
                promise.resolve(response)
            }catch (e: Exception) {
                Log.d(TAG, "issueRgb20Asset:e.message ${e.message}")

                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun issueRgb25Asset(name: String, description: String, supply: String,filePath: String, promise: Promise){
        backgroundHandler.post{
            try {
                val amounts = listOf(supply)
                val response = RGBHelper.issueRgb25Asset(name, description, amounts.map { it.toULong() }, filePath)
                promise.resolve(response)
            }catch (e: Exception) {
                Log.d(TAG, "issueRgb20Asset:e.message ${e.message}")
                val message = e.message
                val jsonObject = JsonObject()
                jsonObject.addProperty("error", message)
                promise.resolve(jsonObject.toString())
            }
        }
    }

    @ReactMethod
    fun issueAssetUda(name: String, ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: ReadableArray, promise: Promise){
        backgroundHandler.post{
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
    fun sendAsset( assetId: String, blindedUTXO: String, amount: String, consignmentEndpoints: String, feeRate: Float, promise: Promise){
        backgroundHandler.post {
            try {
                val endpoints = listOf(consignmentEndpoints)
                Log.d(TAG, "sendAsset: blindedUTXO=$blindedUTXO, amount=$amount, endpoints=$endpoints, feeRate=$feeRate")
                promise.resolve(RGBHelper.send(assetId, blindedUTXO, amount.toULong(), endpoints, feeRate))
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
        backgroundHandler.post {
            try {
                val status = RGBHelper.failTransfer(batchTransferIdx, noAssetOnly, true)
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", status)
                promise.resolve(jsonObject.toString())
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
    fun getUnspents(promise: Promise){
        val rgbUtxo = RGBHelper.getUnspents()
        promise.resolve(Gson().toJson(rgbUtxo))
    }

    @ReactMethod
    fun refreshAsset(assetId: String, promise: Promise){
        backgroundHandler.post {
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
        backgroundHandler.post {
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
        val response = RGBHelper.restore(mnemonic, filePath, reactApplicationContext)
        promise.resolve(response)
    }

    @ReactMethod
    fun resetData(promise: Promise){
        AppConstants.rgbDir.delete()
        promise.resolve(true)
    }
}
