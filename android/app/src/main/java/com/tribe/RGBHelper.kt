package com.bithyve.tribe

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.FileContent
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.gson.Gson
import com.google.gson.JsonObject
import org.rgbtools.AssetCfa
import org.rgbtools.AssetNia
import org.rgbtools.AssetUda
import org.rgbtools.Balance
import org.rgbtools.BtcBalance
import org.rgbtools.Invoice
import org.rgbtools.InvoiceData
import org.rgbtools.Utxo
import org.rgbtools.ReceiveData
import org.rgbtools.Recipient
import org.rgbtools.RefreshFilter
import org.rgbtools.RefreshTransferStatus
import org.rgbtools.RgbLibException
import org.rgbtools.Unspent
import org.rgbtools.WalletData
import org.rgbtools.restoreBackup
import org.rgbtools.restoreKeys
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import kotlin.Exception

object RGBHelper {

    val TAG = "RGBHelper"
    private lateinit var driveClient: Drive
    private const val ZIP_MIME_TYPE = "application/zip"


    fun syncRgbAssets(): String {
        return try {

            // val filter = listOf()
            val refresh =
                RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, null, listOf(), false)
            var assets = RGBWalletRepository.wallet?.listAssets(listOf())
            val rgb25Assets = assets?.cfa
            val rgb20Assets = assets?.nia
            val udaAssets = assets?.uda
            if (rgb20Assets != null) {
                for (rgb20Asset in rgb20Assets) {
                    val assetRefresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, rgb20Asset.assetId, listOf(), false)
                }
            }
            if (rgb25Assets != null) {
                for (rgb25Asset in rgb25Assets) {
                    val assetRefresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, rgb25Asset.assetId, listOf(), false)
                }
            }
            if (udaAssets != null) {
                for (udaAsset in udaAssets) {
                    val assetRefresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, udaAsset.assetId, listOf(), false)
                }
            }
            assets = RGBWalletRepository.wallet?.listAssets(listOf())
            val gson = Gson()
            val json = gson.toJson(assets)
            json.toString()
        } catch (e: Exception) {
            "null"
        }
    }

    private fun startRGBReceiving(assetID: String? = null, amount: ULong? = null): String {
        Log.d(TAG, "startRGBReceiving: assetID=$assetID, amount=$amount")
        val filter = listOf(
            RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, true),
            RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, false)
        )
        val refresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, null, filter, true)
        val blindedData = getBlindedUTXO(if (assetID == "") null else assetID,if (amount == 0.toULong()) null else amount, AppConstants.rgbBlindDuration)
        val gson = Gson()
        val json = gson.toJson(blindedData)
        return json.toString()
    }

    fun receiveAsset(assetID: String, amount: ULong?): String {
        return handleMissingFunds{ startRGBReceiving(assetID, amount) }
    }

    private fun <T> handleMissingFunds(callback: () -> T): T {
        return try {
            callback()
        } catch (e: RgbLibException) {
            Log.d(TAG, "handleMissingFunds: RgbLibException ${e}")
            val jsonObject = JsonObject()
            when (e) {
                is RgbLibException.InsufficientBitcoins,
                is RgbLibException.InsufficientAllocationSlots -> {
                    throw Exception("Insufficient sats for RGB")
                }
                is RgbLibException.InvalidInvoice ->
                    throw Exception("Invalid invoice")
                is RgbLibException.InvalidRecipientId ->
                    throw Exception("Invalid recipient ID")
                is RgbLibException.AssetNotFound ->
                    throw Exception("Asset not found")
                else -> throw Exception(e.message)
            }
        }
    }

    fun getAddress(): String? {
        return RGBWalletRepository.wallet?.getAddress()
    }

    fun getBalance(assetID: String): Balance? {
        return RGBWalletRepository.wallet?.getAssetBalance(assetID)
    }

    private fun getBlindedUTXO(assetID: String? = null, amount: ULong? = null, expirationSeconds: UInt): ReceiveData? {
        Log.d(TAG, "getBlindedUTXO: assetID"+assetID)
        return RGBWalletRepository.wallet?.blindReceive(
            assetID,
            amount,
            expirationSeconds,
            listOf(AppConstants.proxyConsignmentEndpoint),
            0u
        )
    }

    fun getMetadata(assetID: String): String {
        return Gson().toJson(RGBWalletRepository.wallet?.getAssetMetadata(assetID)).toString()
    }

    fun getAssetTransfers(assetID: String): String {
        val refresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, assetID, listOf(), false)
        return Gson().toJson(RGBWalletRepository.wallet?.listTransfers(assetID)?.reversed()).toString()
    }

    fun getTransactions(): String {
        return Gson().toJson(RGBWalletRepository.wallet?.listTransactions(RGBWalletRepository.online, true)).toString()
    }

    fun refresh(assetID: String? = null, light: Boolean = false): Boolean {
        val filter =
            if (light)
                listOf(
                    RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, true),
                    RefreshFilter(RefreshTransferStatus.WAITING_COUNTERPARTY, false)
                )
            else listOf()
        val refresh = RGBWalletRepository.wallet?.refresh(RGBWalletRepository.online!!, assetID, filter, false)
        Log.d(TAG, "refresh: $refresh")
        return true
    }

    fun send(
        assetID: String,
        blindedUTXO: String,
        amount: ULong,
        consignmentEndpoints: List<String>,
        feeRate: Float = AppConstants.defaultFeeRate,
    ): String {
        val txid = handleMissingFunds { RGBWalletRepository.wallet?.send(
            RGBWalletRepository.online!!,
            mapOf(assetID to listOf(Recipient(blindedUTXO,null, amount, consignmentEndpoints))),
            false,
            feeRate,
            0u,
            false
        ) }
        val jsonObject = JsonObject()
        if (txid != null) {
            jsonObject.addProperty("txid", txid.txid)
        }
        return jsonObject.toString()
    }

    fun issueAssetNia(ticker: String, name: String, amounts: List<ULong>, precision: Int): String {
        return try {
            val contract = handleMissingFunds { issueAssetRgb20(ticker, name, amounts, precision) }
            val gson = Gson()
            val json = gson.toJson(contract)
            return json.toString()
        }catch (e: Exception) {
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            return jsonObject.toString()
        }
    }

    fun issueAssetCfa(name: String, description: String, amounts: List<ULong>, precision: Int, filePath: String): String {
        return try {
            val contract = handleMissingFunds { issueAssetRgb25(name, description, amounts, precision, filePath) }
            val gson = Gson()
            val json = gson.toJson(contract)
            return json.toString()
        }catch (e: Exception) {
            val message = e.message
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", message)
            return jsonObject.toString()
        }
    }

    private fun issueAssetRgb20(ticker: String, name: String, amounts: List<ULong>, precision: Int): AssetNia? {
        val asset = RGBWalletRepository.wallet?.issueAssetNia(
            RGBWalletRepository.online!!,
            ticker,
            name,
            precision.toUByte(),
            amounts
        )
        if (asset != null) {
            Log.d(TAG, "issueAssetRgb20: New asset = ${asset.assetId}")
        }
        return  asset
    }

    private fun issueAssetRgb25(name: String, description: String, amounts: List<ULong>, precision: Int, filePath: String): AssetCfa? {
        val asset = RGBWalletRepository.wallet?.issueAssetCfa(
            RGBWalletRepository.online!!,
            name,
            description,
            precision.toUByte(),
            amounts,
            filePath
        )
        Log.d(TAG, "issueAssetRgb25: New asset = ${asset?.assetId}")
        return  asset
    }

    fun issueAssetUda(name: String, ticker: String, details: String, mediaFilePath: String, attachmentsFilePaths: List<String>): String? {
        val asset = RGBWalletRepository.wallet?.issueAssetUda(
            RGBWalletRepository.online!!,
            ticker,
            name,
            details,
            AppConstants.rgbDefaultPrecision,
            mediaFilePath,
            attachmentsFilePaths,
        )
        val gson = Gson()
        val json = gson.toJson(asset)
        return  json
    }

    fun failTransfer(batchTransferIdx: Int, noAssetOnly: Boolean, skipSync: Boolean): Boolean? {
        val status = RGBWalletRepository.wallet?.failTransfers(
            RGBWalletRepository.online!!,
            batchTransferIdx,
            noAssetOnly,
            skipSync
        )
        return status
    }

    fun deleteTransfers(batchTransferIdx: Int, noAssetOnly: Boolean): Boolean? {
        val status = RGBWalletRepository.wallet?.deleteTransfers(
            batchTransferIdx,
            noAssetOnly,
        )
        return status
    }

    private fun createUTXOs(feeRate: Float): UByte? {
        Log.d(TAG, "createUTXOs: tribe")
        return RGBWalletRepository.wallet?.createUtxos(
            RGBWalletRepository.online!!,
            false,
            null,
            null,
            feeRate,
            false
        )
    }

    fun decodeInvoice(invoiceString: String): InvoiceData {
        return Invoice(invoiceString).invoiceData()
    }

    fun createUtxosBegin(upTo: Boolean, num: Int, size: Int, feeRate: Float, skipSync: Boolean): String? {
        return RGBWalletRepository.wallet?.createUtxosBegin(
            RGBWalletRepository.online!!, upTo,
            num.toUByte(), size.toUInt(), feeRate, skipSync)
    }

    fun signPsbt(unsignedPsbt: String): String? {
        return RGBWalletRepository.wallet?.signPsbt(unsignedPsbt)
    }

    fun createUtxosEnd(signedPsbt: String, skipSync: Boolean): UByte? {
        return RGBWalletRepository.wallet?.createUtxosEnd(RGBWalletRepository.online!!, signedPsbt, skipSync)
    }


    fun createNewUTXOs(feeRate: Float): Boolean {
        var attempts = 3
        var newUTXOs: UByte = 0u
        while (newUTXOs == 0u.toUByte() && attempts > 0) {
            Log.d(TAG, "createNewUTXOs: attempts=$attempts")
            try {
                Log.d(TAG, "Calling create UTXOs... with fee $feeRate")
                newUTXOs = createUTXOs(feeRate)!!
                Log.d(TAG, "newUTXO: $newUTXOs")
            } catch (_: RgbLibException.InsufficientBitcoins) {
                throw Exception("Insufficient sats for RGB")
            }catch (e: Exception) {
                Log.d(TAG, "newUTXO:Exception ${e}")
                Log.d(TAG, "newUTXO:Exception ${e.message}")
            }
            attempts--
        }
        return true
    }

    fun getUnspents(): List<Unspent>? {
        return RGBWalletRepository.wallet?.listUnspents(RGBWalletRepository.online,false, true)
    }

    fun getWalletData(): WalletData? {
        return RGBWalletRepository.wallet?.getWalletData()
    }

    fun getBtcBalance(): BtcBalance? {
        return RGBWalletRepository.wallet?.getBtcBalance(RGBWalletRepository.online,true)
    }

    fun refreshAsset(assetID: String) {
        //return RGBWalletRepository.wallet.refresh(assetID, )
    }

    private fun getBackupFile(mnemonic: String, context: ReactApplicationContext): File {
        val keys = restoreKeys(RGBWalletRepository.rgbNetwork!!, mnemonic)
        return File(
            context.filesDir,
            AppConstants.backupName.format(keys.accountXpubFingerprint)
        )
    }

    fun backup(backupPath: String, password: String, context: ReactApplicationContext): String {
        try {
            val backupFile = getBackupFile(password, context)
            backupFile.delete()
            RGBWalletRepository.wallet?.backup(backupFile.absolutePath, password)

            val jsonObject = JsonObject()
            jsonObject.addProperty("file", backupFile.absolutePath)
            return jsonObject.toString()
//            val gAccount = GoogleSignIn.getLastSignedInAccount(context)
//            val credential =
//                GoogleAccountCredential.usingOAuth2(
//                    context,
//                    listOf(DriveScopes.DRIVE_FILE)
//                )
//
//            if (gAccount != null) {
//                credential.selectedAccount = gAccount.account!!
//            }
//            driveClient =
//                Drive.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance(), credential)
//                    .setApplicationName("tribe")
//                    .build()
//            val backupFile = getBackupFile(password, context)
//            backupFile.delete()
//
//
//            val gFile = com.google.api.services.drive.model.File()
//            gFile.name = backupFile.name
//            val newBackupID =
//                driveClient.files().create(gFile, FileContent(ZIP_MIME_TYPE, backupFile)).execute().id
//            Log.d(TAG, "Backup uploaded. Backup file ID: $newBackupID")
//            val oldBackups = driveClient.files().list().setQ("name='${gFile.name}'").execute()
//            Log.d(TAG, "oldBackups='$oldBackups")
////            if (oldBackups != null) {
////                for (file in oldBackups.files) {
////                    Log.d(TAG, "Deleting old backup file ${file.id} ...")
////                    driveClient.files().delete(file.id).execute()
////                }
////            }
//            Log.d(TAG, "Backup operation completed")
//            return "{}"
        }catch (e: Exception){
            Log.d(TAG, "Exception: ${e}")

            return "{error: '$e'}"
        }
    }

    fun getBackupInfo(): Boolean? {
        return RGBWalletRepository.wallet?.backupInfo()
    }

    fun restore(password: String, filePath: String, context: ReactApplicationContext): String {
        try {
            restoreBackup(filePath, password, AppConstants.rgbDir.absolutePath)
            val jsonObject = JsonObject()
            jsonObject.addProperty("restore", true)
            return jsonObject.toString()
        }catch (e: Exception){
            val jsonObject = JsonObject()
            jsonObject.addProperty("error", "$e")
            return jsonObject.toString()
        }
    }

    fun isValidInvoice(invoice: String): Boolean {
        return try {
            Invoice(invoice)
            true
        } catch (e: RgbLibException.InvalidInvoice){
            false
        }
    }

}
