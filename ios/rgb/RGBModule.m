#import "RGBModule.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "tribe-Swift.h"

@implementation RGB

RCT_EXPORT_MODULE();

- (void)resolvePromise:(RCTPromiseResolveBlock)resolve withResult:(id)result {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(result);
  });
}

- (void)rejectPromise:(RCTPromiseRejectBlock)reject withError:(NSString *)errorMessage {
  dispatch_async(dispatch_get_main_queue(), ^{
    reject(@"ERROR", errorMessage, nil);
  });
}

#define EXEC_ASYNC(methodBlock) \
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{ \
    @try { methodBlock } \
    @catch (NSException *exception) { \
      [self rejectPromise:reject withError:exception.reason ?: @"Unknown error"]; \
    } \
  });

#pragma mark - Native Methods

RCT_EXPORT_METHOD(generateKeys:(NSString*)network resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper generate_keysWithBtcNetwotk:network callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(restoreKeys:(NSString*)network mnemonic:(NSString *)mnemonic resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper restore_keysWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getAddress:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getAddressWithCallback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(initiate:(NSString*)network mnemonic:(NSString *)mnemonic accountXpubVanilla:(NSString *)accountXpubVanilla accountXpubColored:(NSString *)accountXpubColored masterFingerprint:(NSString *)masterFingerprint resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper initiateWithBtcNetwotk:network mnemonic:mnemonic accountXpubVanilla:accountXpubVanilla accountXpubColored:accountXpubColored masterFingerprint:masterFingerprint callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(sync:(NSString*)mnemonic network:(NSString *)network resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper syncWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getBalance:(NSString*)mnemonic network:(NSString *)network resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getBalanceWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(syncRgbAssets:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper syncRgbWithCallback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(receiveAsset:(NSString*)assetID amount:(float)amount blinded:(BOOL)blinded resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper receiveAssetWithAssetID:assetID amount:amount blinded:blinded callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getWalletData:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getWalletDataWithCallback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getRgbAssetMetaData:(NSString*)assetId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getRgbAssetMetaDataWithAssetId:assetId callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getRgbAssetTransactions:(NSString*)assetId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getRgbAssetTransactionsWithAssetId:assetId callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(sendAsset:(NSString*)assetId blindedUTXO:(NSString *)blindedUTXO amount:(nonnull NSNumber *)amount consignmentEndpoints:(NSString *)consignmentEndpoints fee:(nonnull NSNumber *)fee isDonation:(BOOL)isDonation resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper sendAssetWithAssetId:assetId blindedUTXO:blindedUTXO amount:amount consignmentEndpoints:consignmentEndpoints fee:fee isDonation:isDonation callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(issueAssetNia:(NSString*)ticker name:(NSString *)name supply:(NSString *)supply precision:(nonnull NSNumber *)precision resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper issueAssetNiaWithTicker:ticker name:name supply:supply precision:precision callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(issueAssetCfa:(NSString*)name description:(NSString *)description supply:(NSString *)supply precision:(nonnull NSNumber *)precision filePath:(NSString *)filePath resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper issueAssetCfaWithName:name description:description supply:supply precision:precision filePath:filePath callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(issueAssetUda:(NSString*)name ticker:(NSString *)ticker details:(NSString *)details mediaFilePath:(NSString *)mediaFilePath attachmentsFilePaths:(NSArray<NSString *> *)attachmentsFilePaths resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper issueAssetUdaWithName:name ticker:ticker details:details mediaFilePath:mediaFilePath attachmentsFilePaths:attachmentsFilePaths callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(decodeInvoice:(NSString*)invoiceString resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper decodeInvoiceWithInvoiceString:invoiceString callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(deleteTransfers:(NSInteger)batchTransferIdx noAssetOnly:(BOOL)noAssetOnly resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper deleteTransfersWithBatchTransferIdx:batchTransferIdx noAssetOnly:noAssetOnly callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(failTransfer:(NSInteger)batchTransferIdx noAssetOnly:(BOOL)noAssetOnly resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper failTransferWithBatchTransferIdx:batchTransferIdx noAssetOnly:noAssetOnly callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(backup:(NSString*)path password:(NSString *)password resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper backupWithPath:path password:password callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(restore:(NSString*)mnemonic backupPath:(NSString *)backupPath resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper restoreWithMnemonic:mnemonic backupPath:backupPath callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(isBackupRequired:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper isBackupRequiredWithCallback:^(BOOL response) {
      [self resolvePromise:resolve withResult:@(response)];
    }];
  });
}

RCT_EXPORT_METHOD(isValidBlindedUtxo:(NSString*)invoiceData resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper isValidBlindedUtxoWithInvoiceData:invoiceData callback:^(BOOL response) {
      [self resolvePromise:resolve withResult:@(response)];
    }];
  });
}

RCT_EXPORT_METHOD(createUtxos:(NSInteger)feeRate num:(NSInteger)num size:(NSInteger)size upTo:(BOOL)upTo resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper createUTXOsWithFeeRate:feeRate num:num size:size upTo:upTo callback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

RCT_EXPORT_METHOD(getUnspents:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  EXEC_ASYNC({
    RGBHelper *helper = [[RGBHelper alloc] init];
    [helper getUnspentsWithCallback:^(NSString * _Nonnull response) {
      [self resolvePromise:resolve withResult:response];
    }];
  });
}

@end
