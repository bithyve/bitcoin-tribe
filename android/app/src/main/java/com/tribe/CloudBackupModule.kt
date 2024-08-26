package com.bithyve.tribe

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.json.GoogleJsonResponseException
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.gson.JsonObject


class CloudBackupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private val SIGN_IN_INTENT_REQ_CODE = 1010
    private val FOLDER_NAME = "Bitcoin-Tribe"
    private var apiClient: GoogleSignInClient? = null
    private lateinit var tokenPromise: Promise
    private val qrImageSize = 250f

    init {
        reactContext.addActivityEventListener(this)
    }

    override
    fun getName() = "CloudBackup"

    @ReactMethod
    fun setup(promise: Promise) {
        val signInOptions =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("356352269942-3qojl5eo1vsf0ve9ovj00eb31bqckhkj.apps.googleusercontent.com")
                .requestEmail()
                .requestScopes(Scope(DriveScopes.DRIVE_FILE))
                .build()
        apiClient = GoogleSignIn.getClient(reactApplicationContext, signInOptions);
        promise.resolve(true)
    }

    @ReactMethod
    fun login(promise: Promise) {
        val activity = currentActivity
        if (apiClient == null) {
            rejectWithError(promise,"Call setup method first")
            return;
        }
        tokenPromise = promise
        activity?.runOnUiThread {
            val signInIntent = apiClient!!.signInIntent
            activity.startActivityForResult(signInIntent, SIGN_IN_INTENT_REQ_CODE)
        }
    }


    private fun createFolder(drive: Drive): String? {
        val folders = drive.files().list()
            .setQ("mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '$FOLDER_NAME'")
            .execute()
        if(folders.files.size > 0) {
            return folders.files[0].id
        }
        val file: com.google.api.services.drive.model.File = com.google.api.services.drive.model.File()
        file.name = FOLDER_NAME;
        file.mimeType = "application/vnd.google-apps.folder";
        return try {
            val folder: com.google.api.services.drive.model.File? = drive.files().create(file)
                .setFields("id")
                .execute()
            folder?.id
        } catch (e: GoogleJsonResponseException) {
            throw e
        }
    }

    private fun rejectWithError(promise: Promise, error: String?) {
        val jsonObject = JsonObject()
        jsonObject.addProperty("status", false)
        jsonObject.addProperty("error", error)
        promise.resolve(jsonObject.toString())
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        intent: Intent?
    ) {
        if(requestCode == SIGN_IN_INTENT_REQ_CODE) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(intent)
            try {
                val account: GoogleSignInAccount = task.getResult(
                    ApiException::class.java
                )
                val jsonObject = JsonObject()
                jsonObject.addProperty("status", true)
                jsonObject.addProperty("error", "")
                jsonObject.addProperty("data", account.email)
                tokenPromise.resolve(jsonObject.toString())
            } catch (e: ApiException) {
                Log.d(name, "onActivityResult@@: ${e.message}")
                val code = e.statusCode
                val errorDescription = getDriveErrorMessage(code)
                rejectWithError(tokenPromise, errorDescription)
            }
        }
    }

    private fun getDriveErrorMessage(statusCode: Int): String {
        return when(statusCode) {
            17-> "Failed to connect to your Google Drive. Please try after sometime."
            14, 20-> "Error connecting with server. Please try again after sometime."
            10-> "Technical error occurred. This cannot be rectified at your end. Please contact our support."
            13-> "We encountered a error. Please try again after sometime"
            8-> "Google Drive is temporarily unavailable. Please try again"
            5-> "Incorrect account name. Please use the account name you used originally while setting up the wallet."
            7-> "A network error occurred. Please check your connection and try again."
            30-> "Please check authentication with your google account in settings and try again."
            15-> "Request timed out. Please try again."
            4-> "You are not logged-in into your Google Drive account. Please log in from your Phone Settings."
            19-> "Unable to connect with Google Drive right now. Please try again after sometime."
            2-> "The installed version of Google Play services is out of date. Please update it from Play store."
            22,21-> "Unable to re-connect with Google Drive right now. Please try again after sometime."
            12501, 12502, 16-> "We recommend signing in as it easily allows you to backup your wallet on your personal cloud."
            else-> "We encountered a non-standard error. Please try again after sometime or contact us"
        }
    }

    override fun onNewIntent(intent: Intent?) {
    }

}