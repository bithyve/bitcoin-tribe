#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <React/RCTLinkingManager.h>
#import "RNAppAuthAuthorizationFlowManager.h"
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : RCTAppDelegate <RNAppAuthAuthorizationFlowManager, UNUserNotificationCenterDelegate>

@property(nonatomic, weak) id<RNAppAuthAuthorizationFlowManagerDelegate> authorizationFlowManagerDelegate;

@end
