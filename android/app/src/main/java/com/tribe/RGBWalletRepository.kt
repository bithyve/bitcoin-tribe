package com.bithyve.tribe

import android.util.Log
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

    fun  initialize(network: String, accountXpubVanilla: String, accountXpubColored: String, mnemonic: String): String{
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
                0u
            )
            wallet = Wallet(walletData)
            online = wallet!!.goOnline(true, AppConstants.getElectrumUrl(network))
            return "true"
        }catch (e: RgbLibException) {
            Log.d(TAG, "initialize: "+e.message)
            return "false"
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
