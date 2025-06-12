  import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import CommunityHeader from './components/CommunityHeader';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useQuery, useRealm } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import AppText from 'src/components/AppText';
import Identicon from 'src/components/Identicon';
import moment from 'moment';
import ContactsManager from 'src/services/p2p/ContactsManager';
import dbManager from 'src/storage/realm/dbManager';

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const route = useRoute();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const realm = useRealm();
  const cm = ContactsManager.getInstance()
  const communities = useQuery(RealmSchema.Community);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.publicKey) {
        cm.joinPeers(route.params.publicKey)
      }
    });
    return unsubscribe;
  }, [navigation, app.id, route.params?.publicKey]);


  useEffect(() => {
    listenToRooms();
  }, []);

  const listenToRooms = () => {
    try {
      cm.setOnConnectionListener(handleConnection)
    } catch (error) {
      console.error('Error setting up rooms listener:', error);
    }
  };

  const handleConnection = (data) => {
    console.log('data', data);
    try {
      dbManager.createObject(RealmSchema.Community, {
        id: data.publicKey,
        publicKey: data.publicKey,
        name: 'Satoshi\'s Pallet',
        createdAt: Date.now(),
      })
    } catch (error) {
      console.error('Error creating community:', error);
    }
  }

  return (
    <ScreenContainer>
      <CommunityHeader />

      <FlatList
        data={communities}
        keyExtractor={(item) => item.roomId}
        ListEmptyComponent={<AppText variant="heading3" style={styles.emptyText}>No rooms found</AppText>}
        style={styles.flatList}
        renderItem={({ item }) =>
          <AppTouchable style={styles.roomItem}
            onPress={() => navigation.navigate(NavigationRoutes.CHAT, { room: item })}>
            <View style={styles.roomItemTop}>
              <Identicon
                value={item.id}
                style={styles.identiconView}
                size={45}
              />
              <View style={styles.roomItemContent}>
                <View style={styles.row}>
                  <AppText numberOfLines={1} variant="heading3" style={styles.roomName}>{item.name}</AppText>
                  <AppText numberOfLines={1} style={styles.roomTime}>{moment(item.createdAt).format('HH:mm')}</AppText>
                </View>
                <AppText numberOfLines={1} style={styles.roomLastMessage}>{item.messages.length > 0 ? item.messages[item.messages.length - 1].message : 'Room created'}</AppText>

              </View>
            </View>

          </AppTouchable>
        }
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    imageWrapper: {},
    textStyle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 36,
    },
    subTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: 130,
      right: 30,
      zIndex: 100
    },
    addNewIconWrapperLight: {
      position: 'absolute',
      bottom: 100,
      right: 0,
      shadowColor: Colors.Black,
      shadowOffset: { width: 8, height: 15 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 100
    },
    roomItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
    roomItemTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    roomName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.headingColor,
      flex: 1,
    },
    roomTime: {
      fontSize: 12,
      color: theme.colors.secondaryHeadingColor,
      marginLeft: 10,
    },
    identiconView: {
      marginRight: 10,
      height: 45,
      width: 45,
      borderRadius: 25,
    },
    roomItemContent: {
      flex: 1,
    },
    roomLastMessage: {
      fontSize: 14,
      color: theme.colors.secondaryHeadingColor,
    },
    flatList: {
      flex: 1,
      marginTop: 10,
    },
    emptyText: {
      textAlign: 'center',
    },
  });
export default Community;
