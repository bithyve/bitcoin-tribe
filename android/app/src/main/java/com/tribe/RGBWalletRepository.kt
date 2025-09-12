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

    fun  initialize(network: String, accountXpubVanilla: String, accountXpubColored: String, mnemonic: String, masterFingerprint: String): String{
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
            val jsonObject = JsonObject()
            jsonObject.addProperty("status", true)
            return jsonObject.toString()
        }catch (e: RgbLibException) {
            Log.d(TAG, "initialize: "+e.message)
            val jsonObject = JsonObject()
            jsonObject.addProperty("status", false)
            jsonObject.addProperty("error", e.message)
            return jsonObject.toString()
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
