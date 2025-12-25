import Foundation
import StoreKit
import React
import UIKit

@objc(AppStoreModule)
class AppStoreModule: NSObject, RCTBridgeModule, SKStoreProductViewControllerDelegate {

  static func moduleName() -> String! {
    return "AppStoreModule"
  }

  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func openAppStore(_ appId: String) {
    DispatchQueue.main.async {
      // Validate appId
      guard !appId.isEmpty else {
        print("AppStoreModule: Invalid appId provided")
        return
      }

      // Get root view controller
      guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let rootVC = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
        print("AppStoreModule: Could not find root view controller")
        return
      }

      // Create store product view controller
      let storeVC = SKStoreProductViewController()
      storeVC.delegate = self
      
      let params: [String: Any] = [
        SKStoreProductParameterITunesItemIdentifier: appId
      ]

      // Load product with completion handler
      storeVC.loadProduct(withParameters: params) { [weak self] (success, error) in
        if let error = error {
          print("AppStoreModule: Failed to load product - \(error.localizedDescription)")
          return
        }
        
        if success {
          // Present the view controller
          rootVC.present(storeVC, animated: true, completion: nil)
        } else {
          print("AppStoreModule: Failed to load product - unknown error")
        }
      }
    }
  }

  // MARK: - SKStoreProductViewControllerDelegate
  
  func productViewControllerDidFinish(_ viewController: SKStoreProductViewController) {
    viewController.dismiss(animated: true, completion: nil)
  }
}
