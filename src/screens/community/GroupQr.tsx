import React, { useContext, useRef } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ScreenContainer from 'src/components/ScreenContainer';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import IconCopy from 'src/assets/images/ic_copy.svg';
import IconCopyLight from 'src/assets/images/ic_copy_light.svg';
import IconShare from 'src/assets/images/ic_shareqr.svg';
import IconShareLight from 'src/assets/images/ic_shareqr_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'src/components/Toast';
import ViewShot from 'react-native-view-shot';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';

const qrSize = (windowWidth * 65) / 100;

export const GroupQr = () => {
  const route = useRoute<RouteProp<{ params: { room: HolepunchRoom } }>>();
  const { room } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles();
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const share = JSON.stringify({
    roomKey: room.roomKey,
    roomName: room.roomName,
    roomType: room.roomType,
    roomDescription: room.roomDescription,
  }) 
  const navigation = useNavigation();
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();
      await Share.share({
        message: share,
        url: `file://${uri}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Toast(common.failedToShareQrCode, true);
    }
  };

  const handleCopy = () => {
    try {
      Clipboard.setString(share);
      Toast(common.copiedToClipboard, false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Toast(common.failedToCopyToClipboard, true);
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
            <AppText variant="caption" style={styles.menuItemText}>
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
        title={community.groupInfo}
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
              value={share}
              size={qrSize}
              logo={room.roomImage ? { uri: room.roomImage } : undefined}
              logoSize={qrSize * 0.35}
              logoBorderRadius={qrSize * 0.3}
            />
          </View>
          <AppText variant="heading3SemiBold" style={styles.groupNameTxt}>
            {room.roomName || 'Group'}
          </AppText>
          <AppText variant="caption" style={styles.groupIdTxt}>
            {room.roomKey}
          </AppText>
        </ViewShot>
        {renderMenu()}
      </View>
    </ScreenContainer>
  );
};

export default GroupQr;



const getStyles = () =>
  StyleSheet.create({
    bodyWrapper: {
      flex: 1,
    },
    groupNameTxt: {
      marginTop: hp(16),
      textAlign: 'center',
    },
    groupIdTxt: {
      marginTop: hp(8),
      textAlign: 'center',
      opacity: 0.6,
    },
    qrWrapper: {
      backgroundColor: Colors.White,
      padding: wp(20),
      borderRadius: wp(20),
      marginTop: hp(20),
      alignItems: 'center',
      alignSelf: 'center',
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
      marginTop: hp(6),
      textAlign: 'center',
    },
  });