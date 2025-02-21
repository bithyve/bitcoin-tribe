package com.bithyve.tribe

import android.content.Context
import java.io.File

object AppConstants {

    const val rgbDirName = ""
    lateinit var appContext: Context
    lateinit var rgbDir: File
    const val backupName = "%s.rgb_backup"

    const val testnetElectrumURL = "ssl://electrum.iriswallet.com:50013"
    const val regtestElectrumURL = "electrum.rgbtools.org:50041"
    const val mainnetElectrumUrl = "electrum.acinq.co:50002"

    const val proxyConsignmentEndpoint = "rpcs://proxy.iriswallet.com/0.2/json-rpc"
    const val rgbDefaultPrecision: UByte = 0U
    const val rgbBlindDuration = 86400U

    const val defaultFeeRate = 50.0F

    @JvmStatic
    fun initContext(context: Context) {
        appContext = context
        rgbDir = File(appContext.filesDir, rgbDirName)
    }

    fun getElectrumUrl(network: String): String {
        return when (network.uppercase()) {
            "TESTNET" -> testnetElectrumURL
            "REGTEST" -> regtestElectrumURL
            "MAINNET" -> mainnetElectrumUrl
            else -> testnetElectrumURL
        }
    }

}