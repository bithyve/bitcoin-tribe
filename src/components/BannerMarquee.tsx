import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AppImageBackupBanner } from './AppImageBackupBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { hp, windowWidth } from 'src/constants/responsive';
import { useNetInfo } from '@react-native-community/netinfo';
import Carousel from 'react-native-reanimated-carousel';
import { CommunityServerBanner } from './CommunityServerBanner';
import { AppContext } from 'src/contexts/AppContext';
import BackupDoneBanner from './BackupDoneBanner';

type BannerMarqueeProps = {};
const DURATION = 3000;

export const BannerMarquee = (props: BannerMarqueeProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = getStyles(theme, insets);
  const { common } = useContext(LocalizationContext).translations;
  const { isConnected } = useNetInfo();
  const [modalVisible, setModalVisible] = useState(false);
  const { communityStatus, isBackupDone, setBackupDone } =
    useContext(AppContext);
  const [isAppImageBackupError] = useMMKVBoolean(
    Keys.IS_APP_IMAGE_BACKUP_ERROR,
  );

  const NetworkBanner = () => (
    <View style={styles.errorBanner}>
      <Text style={styles.text}>{common.noInternet}</Text>
    </View>
  );

  const banners = [
    isBackupDone && {
      id: 'backupDone',
      element: <BackupDoneBanner />,
    },

    !isConnected && {
      id: 'network',
      element: <NetworkBanner />,
    },

    isAppImageBackupError && {
      id: 'appImageBackup',
      element: (
        <AppImageBackupBanner
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      ),
    },

    communityStatus != null && {
      id: 'communityServer',
      element: (
        <CommunityServerBanner
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      ),
    },
  ].filter(Boolean);

  useEffect(() => {
    if (banners.length === 1) onSnapToItem(0);
  }, [banners.length]);

  const onSnapToItem = index => {
    if (banners[index].id == 'backupDone') {
      setTimeout(() => {
        setBackupDone(false);
      }, 1500);
    }
  };

  if (!banners.length) return null;
  return (
    <View style={styles.container}>
      <Carousel
        data={banners}
        renderItem={({ item }) => item.element}
        pagingEnabled
        height={hp(25)}
        autoPlay={banners.length > 1 && !modalVisible ? true : false}
        autoPlayInterval={DURATION}
        width={windowWidth}
        vertical={false}
        onSnapToItem={onSnapToItem}
      />
    </View>
  );
};

const getStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top,
      left: 0,
      right: 0,
      backgroundColor: '#00ffffa1',
      zIndex: 1000,
    },
    errorBanner: {
      backgroundColor: Colors.FireOpal,
      alignItems: 'center',
      width: windowWidth,
      height: hp(25),
      justifyContent: 'center',
    },
    text: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
