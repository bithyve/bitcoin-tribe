package com.bithyve.tribe

import android.app.Activity
import com.facebook.react.bridge.*
import com.google.android.play.core.appupdate.*
import com.google.android.play.core.install.model.*

class AndroidInAppUpdateModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val UPDATE_REQUEST_CODE = 1234

  override fun getName(): String {
    return "AndroidInAppUpdate"
  }

  @ReactMethod
  fun checkAndUpdate(isForced: Boolean, promise: Promise) {
    val activity: Activity? = reactContext.currentActivity

    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Current activity is null")
      return
    }

    val appUpdateManager = AppUpdateManagerFactory.create(reactContext)

    appUpdateManager.appUpdateInfo
      .addOnSuccessListener { appUpdateInfo ->

        if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {

          val updateType =
            if (isForced) AppUpdateType.IMMEDIATE
            else AppUpdateType.FLEXIBLE

          if (appUpdateInfo.isUpdateTypeAllowed(updateType)) {

            val options = AppUpdateOptions
              .newBuilder(updateType)
              .build()

            try {
              appUpdateManager.startUpdateFlowForResult(
                appUpdateInfo,
                activity,
                options,
                UPDATE_REQUEST_CODE
              )
              promise.resolve(true)
            } catch (e: Exception) {
              promise.reject("UPDATE_FAILED", e)
            }

          } else {
            promise.resolve(false)
          }
        } else {
          promise.resolve(false)
        }
      }
      .addOnFailureListener {
        promise.reject("UPDATE_ERROR", it)
      }
  }
}
