//
//  AppDelegate.swift
//  tribe
//
//  Created by Vaibhav on 19/11/25.
//
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import UserNotifications
import React
import AppAuth



@main
class AppDelegate: RCTAppDelegate,UNUserNotificationCenterDelegate, RNAppAuthAuthorizationFlowManager {
  // Required by RNAppAuthAuthorizationFlowManager protocol
    public weak var authorizationFlowManagerDelegate:
      RNAppAuthAuthorizationFlowManagerDelegate?
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "tribe"
    self.dependencyProvider = RCTAppDependencyProvider()
    
    // Firebase configuration: choose dev plist if bundle identifier contains "tribe.dev"
       if let bundleIdentifier = Bundle.main.bundleIdentifier,
          bundleIdentifier.contains("tribe.dev") {
         if let plistPath = Bundle.main.path(forResource: "GoogleService-Info-dev", ofType: "plist"),
            let options = FirebaseOptions(contentsOfFile: plistPath) {
           FirebaseApp.configure(options: options)
         } else {
           NSLog("Error: GoogleService-Info-dev.plist not found for tribe-dev target")
         }
       } else {
         FirebaseApp.configure()
       }
    
    // Notifications
       UNUserNotificationCenter.current().delegate = self
       UIApplication.shared.registerForRemoteNotifications()
    
    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]
    
    // CFBundleVersion check and keychain cleanup on first run
        if let bundleVersionString = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String,
           let bundleVersion = Int(bundleVersionString), bundleVersion > 95 {
          let defaults = UserDefaults.standard
          if defaults.object(forKey: "FirstRun") == nil {
            // classes to delete
            let secItemClasses: [CFString] = [
              kSecClassGenericPassword,
              kSecClassInternetPassword,
              kSecClassCertificate,
              kSecClassKey,
              kSecClassIdentity
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

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
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
  
  override func application(_ application: UIApplication,
                            open url: URL,
                            options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
      return RCTLinkingManager.application(application,
                                           open: url,
                                           options: options)
  }

  
  // Handle OAuth redirect URL
 override func application(
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
  
  
  
  
  
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {

      if #available(iOS 14.0, *) {
          completionHandler([.banner, .sound, .badge])
      } else {
          completionHandler([.alert, .sound, .badge])
      }
  }

  
  
}



