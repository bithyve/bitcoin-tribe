import React, { useContext, useRef } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import IconCopy from 'src/assets/images/ic_copy.svg';
import IconCopyLight from 'src/assets/images/ic_copy_light.svg';
import IconShare from 'src/assets/images/ic_shareqr.svg';
import IconShareLight from 'src/assets/images/ic_shareqr_light.svg';
import IconScan from 'src/assets/images/ic_scan.svg';
import IconScanLight from 'src/assets/images/ic_scan_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ViewShot from 'react-native-view-shot';
import OptionCard from 'src/components/OptionCard';
import { deeplinkType } from 'src/models/interfaces/Community';

const qrSize = (windowWidth * 65) / 100;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bodyWrapper: {
      flex: 1,
    },
    qrWrapper: {
      backgroundColor: Colors.White,
      padding: wp(20),
      borderRadius: wp(20),
      marginTop: hp(20),
      alignItems: 'center',
      alignSelf: 'center',
    },
    textName: {
      marginTop: hp(20),
      textAlign: 'center',
    },
    menuWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(20),
      alignSelf: 'center',
      marginBottom: hp(30),
    },
    menuItem: {
      paddingHorizontal: wp(20),
      paddingVertical: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemText: {
      marginTop: hp(10),
      textAlign: 'center',
    },
  });

const ProfileInfo = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const qrValue = `tribe://${deeplinkType.Contact}/${app?.contactsKey?.publicKey}/`;
  const navigation = useNavigation();
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();
      await Share.share({
        message: `${community.shareQrMessage} ${qrValue.split('/')[2]}`,
        url: `file://${uri}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Toast(common.failedToShareQrCode, true);
    }
  };

  const handleCopy = () => {
    try {
      Clipboard.setString(qrValue);
      Toast(common.copiedToClipboard, false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Toast(common.failedToCopyToClipboard, true);
    }
  };

  const handleScan = () => {
    try {
      navigation.goBack();
      navigation.navigate(NavigationRoutes.SENDSCREEN, {
        receiveData: 'send',
        title: common.scanQrTitle,
        subTitle: common.scanQrSubTitle,
      });
    } catch (error) {
      console.error('Error navigating to scan screen:', error);
      Toast(common.failedToOpenScanner, true);
    }
  };

  const renderMenu = () => {
    const menuItems = [
      {
        icon: isThemeDark ? <IconShare /> : <IconShareLight />,
        text: common.share,
        onPress: handleShare,
      },
      {
        icon: isThemeDark ? <IconScan /> : <IconScanLight />,
        text: common.scan,
        onPress: handleScan,
      },
      {
        icon: isThemeDark ? <IconCopy /> : <IconCopyLight />,
        text: common.copy,
        onPress: handleCopy,
      },
    ];

    return (
      <View style={styles.menuWrapper}>
        {menuItems.map((item, index) => (
          <AppTouchable key={index} style={styles.menuItem} onPress={item.onPress}>
            {item.icon}
            <AppText variant="body1" style={styles.menuItemText}>
              {item.text}
            </AppText>
          </AppTouchable>
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={community.profileInfoTitle}
        subTitle={community.profileInfoSubTitle}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
      />
      <View style={styles.bodyWrapper}>
        <ViewShot
          ref={viewShotRef}
          options={{
            format: 'jpg',
            quality: 1.0,
            fileName: `${app.appName}-qr.jpg`,
          }}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={qrSize}
              logo={app?.walletImage ? { uri: app.walletImage } : undefined}
              logoSize={qrSize * 0.35}
              logoBorderRadius={qrSize * 0.3}
            />
          </View>
          <AppText variant="heading1" style={styles.textName}>
            {app.appName}
          </AppText>
        </ViewShot>
        {renderMenu()}

        <OptionCard
          title={community.createGroup}
          onPress={() => {
          }}
        />
      </View>
    </ScreenContainer>
  );
};

export default ProfileInfo;
