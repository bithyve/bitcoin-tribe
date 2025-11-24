package com.bithyve.tribe

import android.util.Log
import com.google.gson.JsonObject
import org.rgbtools.AssetSchema
import org.rgbtools.BitcoinNetwork
import org.rgbtools.DatabaseType
import org.rgbtools.Online
import org.rgbtools.RgbLibException
import org.rgbtools.Wallet
import org.rgbtools.WalletData

object RGBWalletRepository {

    val TAG = "RGBWalletRepository"

    var wallet: Wallet? = null
    var online: Online? = null
    var rgbNetwork: BitcoinNetwork? = null

    init {

    }

    fun  initialize(network: String, accountXpubVanilla: String, accountXpubColored: String, mnemonic: String, masterFingerprint: String): Pair<Boolean, String>{
        try {
            online = null
            rgbNetwork = getNetwork(network)
            val rgbDir = AppConstants.rgbDir
                ?: throw IllegalStateException("RGB directory not initialized. Call AppConstants.initContext() first.")
            val walletData =  WalletData(
                rgbDir.absolutePath,
                rgbNetwork!!,
                DatabaseType.SQLITE,
                1u,
                accountXpubVanilla,
                accountXpubColored,
                mnemonic,
                masterFingerprint,
                0u,
                listOf(AssetSchema.CFA, AssetSchema.NIA, AssetSchema.UDA)
            )
            wallet = Wallet(walletData)
            online = wallet!!.goOnline(true, AppConstants.getElectrumUrl(network))
            return Pair(true, "")
        }catch (e: RgbLibException) {
            Log.d(TAG, "initialize: "+e.message)
            return Pair(false, e.message!!)
        } catch (e: IllegalStateException) {
            Log.d(TAG, "initialize: "+e.message)
            return Pair(false, e.message ?: "RGB directory not initialized")
        }
    }

    fun resetWallet(masterFingerprint: String): String {
        val jsonObject = JsonObject()
        try {
            online = null
            val rgbDir = AppConstants.rgbDir
                ?: throw IllegalStateException("RGB directory not initialized")
            val rgbWalletDir = rgbDir.resolve(masterFingerprint)
            Log.i("RGB", "Deleting rgb wallet path at: ${rgbWalletDir.path}")
            if (rgbWalletDir.deleteRecursively()) {
                Log.i("RGB", "rgb wallet path deleted successfully.")
                jsonObject.addProperty("message", "Rgb wallet path deleted successfully.")
                jsonObject.addProperty("status", true)
            } else {
                Log.e("RGB", "Failed to delete rgb wallet path.")
                jsonObject.addProperty("message", "Failed to delete rgb wallet path.")
                jsonObject.addProperty("status", false)
            }
            return jsonObject.toString()
        } catch (e: Exception) {
            Log.d(TAG, "resetWallet: " + e.message)
            jsonObject.addProperty("message", e.message)
            jsonObject.addProperty("status", false)
            return jsonObject.toString()
        }
    }

    fun deleteRuntimeLockFile(masterFingerprint: String) {
        try {
            val rgbDir = AppConstants.rgbDir
                ?: run {
                    Log.e("RGB", "RGB directory not initialized")
                    return
                }
            val runtimeLockPath = rgbDir
                .resolve(masterFingerprint)
                .resolve("rgb_runtime.lock")
            if (!runtimeLockPath.exists()) {
                Log.i("RGB", "No runtime lock file exists at path: ${runtimeLockPath.path}")
                return
            }
            Log.i("RGB", "Deleting runtime lock at: ${runtimeLockPath.path}")
            if (runtimeLockPath.delete()) {
                Log.i("RGB", "Runtime lock deleted successfully.")
            } else {
                Log.e("RGB", "Failed to delete runtime lock.")
            }
        } catch (e: Exception) {
            Log.e("RGB", "Failed to delete runtime lock: ${e.message}", e)
        }
    }

    fun writeToLogFile(masterFingerprint: String, content: String) {
        try {
            val rgbDir = AppConstants.rgbDir
                ?: run {
                    Log.e("RGB", "RGB directory not initialized")
                    return
                }
            val logFilePath = rgbDir
                .resolve(masterFingerprint)
                .resolve("log")

            logFilePath.parentFile?.mkdirs()

            if (!logFilePath.exists()) {
                logFilePath.createNewFile()
            }
            val formatter = java.time.format.DateTimeFormatter
                .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
                .withZone(java.time.ZoneOffset.UTC)

            val timestamp = formatter.format(java.time.Instant.now())
            val logLine = "$timestamp INFO[TRIBE_INTERNAL] $content\n"
            logFilePath.appendText(logLine)
        } catch (e: Exception) {
            Log.e("RGB", "Failed to write log file: ${e.message}", e)
        }
    }



//    fun checkWalletInitialized(): Boolean {
//        return this::wallet.isInitialized && this::online.isInitialized
//    }

    fun getNetwork(network: String): BitcoinNetwork {
        return when (network.uppercase()) {
            "TESTNET" -> BitcoinNetwork.TESTNET
            "REGTEST" -> BitcoinNetwork.REGTEST
            "MAINNET" -> BitcoinNetwork.MAINNET
            "SIGNET" -> BitcoinNetwork.SIGNET
            else -> BitcoinNetwork.TESTNET
        }
    }
}
