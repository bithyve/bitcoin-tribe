package com.bithyve.tribe

import android.util.Log
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
            rgbNetwork = getNetwork(network)
            val walletData =  WalletData(
                AppConstants.rgbDir.absolutePath,
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
        }
    }

    fun deleteRuntimeLockFile(masterFingerprint: String) {
        try {
            val runtimeLockPath = AppConstants.rgbDir
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
