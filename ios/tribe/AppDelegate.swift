import AppAuth
import Firebase
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
//
//  AppDelegate.swift
//  tribe
//
//  Created by Vaibhav on 19/11/25.
//
import UIKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate,
  UNUserNotificationCenterDelegate, RNAppAuthAuthorizationFlowManager
{
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  // Required by RNAppAuthAuthorizationFlowManager protocol
  public weak var authorizationFlowManagerDelegate:
    RNAppAuthAuthorizationFlowManagerDelegate?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication
      .LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "tribe",
      in: window,
      launchOptions: launchOptions
    )

    // Firebase configuration: choose dev plist if bundle identifier contains "tribe.dev"
    if let bundleIdentifier = Bundle.main.bundleIdentifier,
      bundleIdentifier.contains("tribe.dev")
    {
      if let plistPath = Bundle.main.path(
        forResource: "GoogleService-Info-dev", ofType: "plist"),
        let options = FirebaseOptions(contentsOfFile: plistPath)
      {
        FirebaseApp.configure(options: options)
      } else {
        NSLog(
          "Error: GoogleService-Info-dev.plist not found for tribe-dev target")
      }
    } else {
      FirebaseApp.configure()
    }

    // Notifications
    UNUserNotificationCenter.current().delegate = self
    UIApplication.shared.registerForRemoteNotifications()

    // CFBundleVersion check and keychain cleanup on first run
    if let bundleVersionString = Bundle.main.object(
      forInfoDictionaryKey: "CFBundleVersion") as? String,
      let bundleVersion = Int(bundleVersionString), bundleVersion > 95
    {
      let defaults = UserDefaults.standard
      if defaults.object(forKey: "FirstRun") == nil {
        // classes to delete
        let secItemClasses: [CFString] = [
          kSecClassGenericPassword,
          kSecClassInternetPassword,
          kSecClassCertificate,
          kSecClassKey,
          kSecClassIdentity,
        ]

        for secClass in secItemClasses {
          let query: [CFString: Any] = [kSecClass: secClass]
          SecItemDelete(query as CFDictionary)
        }

        defaults.set("1strun", forKey: "FirstRun")
        // `synchronize()` is deprecated but included below to mirror original behavior
        defaults.synchronize()
      }
    }

    return true
  }

  func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(
      application,
      open: url,
      options: options)
  }

  // Handle OAuth redirect URL
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {

    // Handle Universal-Link–style OAuth redirects first
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
      let delegate = authorizationFlowManagerDelegate,
      delegate.resumeExternalUserAgentFlow(with: userActivity.webpageURL)
    {
      return true
    }

    // Fall back to React Native’s own Linking logic
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (
      UNNotificationPresentationOptions
    ) -> Void
  ) {

    if #available(iOS 14.0, *) {
      completionHandler([.banner, .sound, .badge])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }

}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
