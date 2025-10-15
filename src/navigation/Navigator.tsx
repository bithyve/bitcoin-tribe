import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from 'src/screens/splash/Splash';
import WalletSetupOption from 'src/screens/onBoarding/WalletSetupOption';
import ProfileSetup from 'src/screens/onBoarding/ProfileSetup';
import Settings from 'src/screens/settings/Settings';
import SendScreen from 'src/screens/send/SendScreen';
import ReceiveScreen from 'src/screens/receive/ReceiveScreen';
import WalletDetails from 'src/screens/wallet/WalletDetails';
import WalletAllTransactions from 'src/screens/wallet/WalletAllTransactions';
import TransactionDetails from 'src/screens/wallet/TransactionDetails';
import LanguageAndCurrency from 'src/screens/settings/LanguageAndCurrency';
import HomeTabs from './tabNavigation/HomeTabs';
import { NavigationRoutes } from './NavigationRoutes';
import { AppStackParams } from './types';
import WalletSettings from 'src/screens/wallet/WalletSettings';
import EditWalletProfile from 'src/screens/wallet/EditWalletProfile';
import AppBackup from 'src/screens/settings/AppBackup';
import ConnectionSettings from 'src/screens/settings/ConnectionSettings';
import NodeSettings from 'src/screens/settings/NodeSettings';
import CloudBackup from 'src/screens/settings/CloudBackup';
import ConnectNodeManually from 'src/screens/settings/ConnectNodeManually';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import IssueScreen from 'src/screens/collectiblesCoins/IssueScreen';
import ReceiveAsset from 'src/screens/receiveasset/ReceiveAssetScreen';
import EnterInvoiceDetails from 'src/screens/receiveasset/EnterInvoiceDetails';
import SendToScreen from 'src/screens/send/SendToScreen';
import ShowXPub from 'src/screens/wallet/ShowXPub';
import CoinDetails from 'src/screens/assets/CoinDetailsScreen';
import CoinMetaData from 'src/screens/assets/CoinsMetaDataScreen';
import SendAsset from 'src/screens/assets/SendAssetScreen';
import CollectibleMetaData from 'src/screens/assets/CollectibleMetaDataScreen';
import AppInfo from 'src/screens/settings/AppInfo';
import AppVersionHistory from 'src/screens/settings/AppVersionHistory';
import TransferDetails from 'src/screens/wallet/TransferDetails';
import CoinAllTransaction from 'src/screens/assets/CoinAllTransaction';
import ViewUnspent from 'src/screens/collectiblesCoins/ViewUnspentScreen';
import CreatePin from 'src/screens/onBoarding/CreatePin';
import CollectibleDetails from 'src/screens/assets/CollectibleDetailsScreen';
import AddAsset from 'src/screens/home/components/AddAsset';
import AppBackupMenu from 'src/screens/settings/AppBackupMenu';
import WalletBackupHistory from 'src/screens/settings/WalletBackupHistory';
import ScanAssetScreen from 'src/screens/assets/ScanAssetScreen';
import Login from 'src/screens/onBoarding/Login';
import RGBCreateUtxo from 'src/screens/collectiblesCoins/RGBCreateUtxo';
import BackupPhraseSetting from 'src/screens/settings/BackupPhraseSetting';
import EnterSeedScreen from 'src/screens/onBoarding/EnterSeedScreen';
import SelectAssetToSend from 'src/screens/assets/SelectAssetToSend';
import SelectWallet from 'src/screens/onBoarding/SelectWallet';
import RgbLightningNodeConnect from 'src/screens/onBoarding/RgbLightningNodeConnect';
import LightningReceiveScreen from 'src/screens/receive/LightningReceiveScreen';
import ViewNodeInfo from 'src/screens/nodeinfo/ViewNodeInfo';
import SupportTermAndCondition from 'src/screens/onBoarding/SupportTermAndCondition';
import RgbChannels from 'src/screens/channels/RgbChannels';
import OpenRgbChannel from 'src/screens/channels/OpenRgbChannel';
import SendBTCScreen from 'src/screens/send/SendBTCScreen';
import LightningSend from 'src/screens/send/LightningSend';
import ChannelDetails from 'src/screens/channels/ChannelDetails';
import RGBWalletStatus from 'src/components/RGBWalletOffline';
import OnboardingSlides from 'src/screens/onBoarding/OnboardingSlides';
import ImportRgbBackup from 'src/screens/onBoarding/ImportRgbBackup';
import ViewLogs from 'src/screens/settings/ViewLogs';
import OnchainLearnMore from 'src/screens/onBoarding/OnchainLearnMore';
import LNLearnMore from 'src/screens/onBoarding/LNLearnMore';
import SupportLearnMore from 'src/screens/onBoarding/SupportLearnMore';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import IssueCollectible from 'src/screens/collectiblesCoins/IssueCollectible';
import UDADetailsScreen from 'src/screens/assets/UDADetailsScreen';
import HiddenAssets from 'src/screens/settings/HiddenAssets';
import ChangePin from 'src/screens/onBoarding/ChangePin';
import UTXOTabs from './tabNavigation/UTXOTabs';
import BackupAlertBanner from 'src/components/BackupAlertBanner';
import BackupDoneBanner from 'src/components/BackupDoneBanner';
import AssetRegistryScreen from 'src/screens/collectiblesCoins/AssetRegistryScreen';
import RegisterDomain from 'src/screens/assets/RegisterDomain';
import VerifyDomain from 'src/screens/assets/VerifyDomain';
import VerifyX from 'src/screens/assets/VerifyX';
import ImportXPost from 'src/screens/assets/ImportXPost';
import ProfileInfo from 'src/screens/community/ProfileInfo';
import Chat from 'src/screens/community/ChatNew';
import TransactionTypeInfoScreen from 'src/screens/assets/components/TransactionTypeInfoScreen';
import NodeConnectingSetup from 'src/components/NodeConnectingSetup';
import NodeConnected from 'src/components/NodeConnected';
import GetBTCWithRamp from 'src/screens/wallet/GetBTCWithRamp';
import InvoicesScreen from 'src/screens/collectiblesCoins/InvoicesScreen';
import WebViewScreen from 'src/screens/wallet/WebViewScreen';
import RequestOrSend from 'src/screens/community/RequestOrSend';
import { CreateGroup } from 'src/screens/community/CreateGroup';
import { GroupInfo } from 'src/screens/community/GroupInfo';
import GroupQr from 'src/screens/community/GroupQr';
import { ScanQrScreen } from 'src/screens/community/ScanQRScreen';
import { EditGroup } from 'src/screens/community/EditGroup';

function LoginStack() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <Stack.Navigator
      initialRouteName={NavigationRoutes.SPLASH}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name={NavigationRoutes.SPLASH} component={Splash} />
      <Stack.Screen
        name={NavigationRoutes.WALLETSETUPOPTION}
        component={WalletSetupOption}
      />
      <Stack.Screen
        name={NavigationRoutes.PROFILESETUP}
        component={ProfileSetup}
      />
      <Stack.Screen name={NavigationRoutes.CREATEPIN} component={CreatePin} />

      <Stack.Screen name={NavigationRoutes.LOGIN} component={Login} />
      <Stack.Screen
        name={NavigationRoutes.ENTERSEEDSCREEN}
        component={EnterSeedScreen}
      />
      <Stack.Screen
        name={NavigationRoutes.SELECTWALLET}
        component={SelectWallet}
      />
      <Stack.Screen
        name={NavigationRoutes.RGBLIGHTNINGNODECONNECT}
        component={RgbLightningNodeConnect}
      />
      <Stack.Screen
        name={NavigationRoutes.SUPPORTTERMANDCONDITION}
        component={SupportTermAndCondition}
      />
      <Stack.Screen
        name={NavigationRoutes.ONBOARDINGSCREEN}
        component={OnboardingSlides}
      />
      <Stack.Screen
        name={NavigationRoutes.IMPORTRGBBACKUP}
        component={ImportRgbBackup}
      />
      <Stack.Screen
        name={NavigationRoutes.ONCHAINLEARNMORE}
        component={OnchainLearnMore}
      />
      <Stack.Screen
        name={NavigationRoutes.LNLEARNMORE}
        component={LNLearnMore}
      />
      <Stack.Screen
        name={NavigationRoutes.SUPPORTLEARNMORE}
        component={SupportLearnMore}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <RealmProvider>
      <Stack.Navigator
        initialRouteName={NavigationRoutes.HOME}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name={NavigationRoutes.HOME} component={HomeTabs} />
        <Stack.Screen name={NavigationRoutes.SETTINGS} component={Settings} />
        <Stack.Screen
          name={NavigationRoutes.SENDSCREEN}
          component={SendScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.RECEIVESCREEN}
          component={ReceiveScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETDETAILS}
          component={WalletDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETALLTRANSACTION}
          component={WalletAllTransactions}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETSETTINGS}
          component={WalletSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.TRANSACTIONDETAILS}
          component={TransactionDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.LANGUAGEANDCURRENCY}
          component={LanguageAndCurrency}
        />
        <Stack.Screen
          name={NavigationRoutes.EDITWALLETPROFILE}
          component={EditWalletProfile}
        />
        <Stack.Screen name={NavigationRoutes.APPBACKUP} component={AppBackup} />
        <Stack.Screen
          name={NavigationRoutes.CONNECTIONSETTINGS}
          component={ConnectionSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.NODESETTINGS}
          component={NodeSettings}
        />
        <Stack.Screen
          name={NavigationRoutes.CONNECTNODEMANUALLY}
          component={ConnectNodeManually}
        />
        <Stack.Screen
          name={NavigationRoutes.ISSUESCREEN}
          component={IssueScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.ISSUECOLLECTIBLESCREEN}
          component={IssueCollectible}
        />
        <Stack.Screen
          name={NavigationRoutes.RECEIVEASSET}
          component={ReceiveAsset}
        />
        <Stack.Screen
          name={NavigationRoutes.ENTERINVOICEDETAILS}
          component={EnterInvoiceDetails}
        />
        <Stack.Screen name={NavigationRoutes.SENDTO} component={SendToScreen} />
        <Stack.Screen name={NavigationRoutes.SHOWXPUB} component={ShowXPub} />
        <Stack.Screen
          name={NavigationRoutes.COINDETAILS}
          component={CoinDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.COLLECTIBLEDETAILS}
          component={CollectibleDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.UDADETAILS}
          component={UDADetailsScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.COINMETADATA}
          component={CoinMetaData}
        />
        <Stack.Screen
          name={NavigationRoutes.COLLECTIBLEMETADATA}
          component={CollectibleMetaData}
        />
        <Stack.Screen name={NavigationRoutes.SENDASSET} component={SendAsset} />
        <Stack.Screen
          name={NavigationRoutes.SCANASSET}
          component={ScanAssetScreen}
        />
        <Stack.Screen name={NavigationRoutes.APPINFO} component={AppInfo} />
        <Stack.Screen
          name={NavigationRoutes.APPVERSIONHISTORY}
          component={AppVersionHistory}
        />
        <Stack.Screen
          name={NavigationRoutes.TRANSFERDETAILS}
          component={TransferDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.COINALLTRANSACTION}
          component={CoinAllTransaction}
        />
        <Stack.Screen
          name={NavigationRoutes.VIEWUNSPENT}
          component={UTXOTabs}
        />
        <Stack.Screen name={NavigationRoutes.ADDASSET} component={AddAsset} />
        <Stack.Screen
          name={NavigationRoutes.APPBACKUPMENU}
          component={AppBackupMenu}
        />
        <Stack.Screen
          name={NavigationRoutes.WALLETBACKUPHISTORY}
          component={WalletBackupHistory}
        />
        <Stack.Screen name={NavigationRoutes.CREATEPIN} component={CreatePin} />
        <Stack.Screen name={NavigationRoutes.CHANGEPIN} component={ChangePin} />
        <Stack.Screen
          name={NavigationRoutes.CLOUDBACKUP}
          component={CloudBackup}
        />

        <Stack.Screen
          name={NavigationRoutes.RGBCREATEUTXO}
          component={RGBCreateUtxo}
        />
        <Stack.Screen
          name={NavigationRoutes.BACKUPPHRASESETTING}
          component={BackupPhraseSetting}
        />
        <Stack.Screen
          name={NavigationRoutes.SELECTASSETTOSEND}
          component={SelectAssetToSend}
        />
        <Stack.Screen
          name={NavigationRoutes.LIGHTNINGRECEIVE}
          component={LightningReceiveScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.VIEWNODEINFO}
          component={ViewNodeInfo}
        />
        <Stack.Screen
          name={NavigationRoutes.RGBCHANNELS}
          component={RgbChannels}
        />
        <Stack.Screen
          name={NavigationRoutes.CHANNELDETAILS}
          component={ChannelDetails}
        />
        <Stack.Screen
          name={NavigationRoutes.OPENRGBCHANNEL}
          component={OpenRgbChannel}
        />
        <Stack.Screen
          name={NavigationRoutes.SENDBTCSCREEN}
          component={SendBTCScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.LIGHTNINGSEND}
          component={LightningSend}
        />
        <Stack.Screen name={NavigationRoutes.VIEWLOGS} component={ViewLogs} />
        <Stack.Screen
          name={NavigationRoutes.HIDDENASSETS}
          component={HiddenAssets}
        />
        <Stack.Screen
          name={NavigationRoutes.ASSETREGISTRYSCREEN}
          component={AssetRegistryScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.REGISTERDOMAIN}
          component={RegisterDomain}
        />
        <Stack.Screen
          name={NavigationRoutes.VERIFYDOMAIN}
          component={VerifyDomain}
        />
        <Stack.Screen name={NavigationRoutes.VERIFYX} component={VerifyX} />
        <Stack.Screen
          name={NavigationRoutes.IMPORTXPOST}
          component={ImportXPost}
        />
        <Stack.Screen
          name={NavigationRoutes.PROFILEINFO}
          component={ProfileInfo}
        />
        <Stack.Screen name={NavigationRoutes.CHAT} component={Chat} />
        <Stack.Screen
          name={NavigationRoutes.TRANSACTIONTYPEINFO}
          component={TransactionTypeInfoScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.GETBTCWITHRAMP}
          component={GetBTCWithRamp}
        />
        <Stack.Screen name={NavigationRoutes.REQUESTORSEND}
          component={RequestOrSend}
        />
        <Stack.Screen
          name={NavigationRoutes.INVOICES}
          component={InvoicesScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.WEBVIEWSCREEN}
          component={WebViewScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.CREATEGROUP}
          component={CreateGroup}
        />
        <Stack.Screen
          name={NavigationRoutes.GROUPINFO}
          component={GroupInfo}
        />
        <Stack.Screen
          name={NavigationRoutes.GROUPQR}
          component={GroupQr}
        />
        <Stack.Screen
          name={NavigationRoutes.SCANQRSCREEN}
          component={ScanQrScreen}
        />
        <Stack.Screen
          name={NavigationRoutes.EDITGROUP}
          component={EditGroup}
        />
      </Stack.Navigator>
    </RealmProvider>
  );
}
function Navigator() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();

  return (
    <NavigationContainer
      linking={{
        prefixes: ['tribe://'],
        config: {
          screens: {
            [NavigationRoutes.LOGINSTACK]: 'login',
          },
        },
      }}
      theme={{
        dark: isThemeDark,
        colors: {
          background: theme.colors.primaryBackground,
          border: theme.colors.primaryBackground,
          card: theme.colors.primaryBackground,
          notification: '',
          primary: '',
          text: '',
        },
      }}>
      <RGBWalletStatus />
      <BackupAlertBanner />
      <NodeConnectingSetup />
      <NodeConnected />
      <BackupDoneBanner />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={NavigationRoutes.LOGINSTACK}
          component={LoginStack}
        />
        <Stack.Screen name={NavigationRoutes.APPSTACK} component={AppStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
