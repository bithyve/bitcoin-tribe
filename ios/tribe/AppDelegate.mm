#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"tribe";
  [FIRApp configure];
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  if ([[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] intValue] > 95) {
    if (![[NSUserDefaults standardUserDefaults] objectForKey:@"FirstRun"]) {
      NSArray *secItemClasses = @[(__bridge id)kSecClassGenericPassword,
                      (__bridge id)kSecClassInternetPassword,
                      (__bridge id)kSecClassCertificate,
                      (__bridge id)kSecClassKey,
                      (__bridge id)kSecClassIdentity];
      for (id secItemClass in secItemClasses) {
          NSDictionary *spec = @{(__bridge id)kSecClass: secItemClass};
          SecItemDelete((__bridge CFDictionaryRef)spec);
      }
      [[NSUserDefaults standardUserDefaults] setValue:@"1strun" forKey:@"FirstRun"];
      [[NSUserDefaults standardUserDefaults] synchronize];
    }
  }
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL) application: (UIApplication *)application
             openURL: (NSURL *)url
             options: (NSDictionary<UIApplicationOpenURLOptionsKey, id> *) options
{
  if ([self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:url]) {
    return YES;
  }
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL) application: (UIApplication *) application
continueUserActivity: (nonnull NSUserActivity *)userActivity
  restorationHandler: (nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    if (self.authorizationFlowManagerDelegate) {
      BOOL resumableAuth = [self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:userActivity.webpageURL];
      if (resumableAuth) {
        return YES;
      }
    }
  }
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionAlert |
                    UNNotificationPresentationOptionSound |
                    UNNotificationPresentationOptionBadge);
}

@end
