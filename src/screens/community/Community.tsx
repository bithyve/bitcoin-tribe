  import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import CommunityHeader from './components/CommunityHeader';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useQuery, useRealm } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import AppText from 'src/components/AppText';
import Identicon from 'src/components/Identicon';
import moment from 'moment';
import { Worklet } from 'react-native-bare-kit';
import DHT from 'hyperdht';
import b4a from 'b4a';

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const realm = useRealm();
  const [rooms, setRooms] = useState<any[]>([]);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRooms();
    });
    return unsubscribe;
  }, [navigation, app.id]);

  const fetchRooms = async () => {
    try {
      const worklet = new Worklet();
      const { IPC } = worklet;
      IPC.setEncoding('utf8');
      const sourceCode = ` const DHT = require('hyperdht');
  const b4a = require('b4a');

  const keyPair = DHT.keyPair();
  const dht = new DHT();
  const server = dht.createServer((socket) => {
    socket.on('data', (msg) => {
      const text = b4a.toString(msg, 'utf8');
      const { IPC } = BareKit;
      IPC.write(JSON.stringify({ type: 'message', text }));
    });
  });
  await server.listen(keyPair);

  const topic = new Uint8Array(32).fill(0xAA);
  dht.announce(topic, keyPair);

  const lookup = dht.lookup(topic);
  lookup.on('data', (res) => {
    for (const peer of res.peers) {
      const conn = dht.connect(peer.publicKey);
      conn.once('open', () => console.log('Connected to peer'));
      conn.on('data', (msg) => {
        const text = b4a.toString(msg, 'utf8');
        const { IPC } = BareKit;
        IPC.write(JSON.stringify({ type: 'message', text }));
      });
    }
  });`;
      worklet.start('/p2pWorklet.js', sourceCode);
      IPC.on('data', handleWorkletMessages);
      IPC.write(JSON.stringify({ action: 'init' }));
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  useEffect(() => {
    listenToRooms();
  }, []);

  const listenToRooms = () => {
    try {

    } catch (error) {
      console.error('Error setting up rooms listener:', error);
    }
  };

  const handleWorkletMessages = (data) => {
    console.log('data', data);
  }


  return (
    <ScreenContainer>
      <CommunityHeader />

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        ListEmptyComponent={<AppText variant="heading3" style={styles.emptyText}>No rooms found</AppText>}
        style={styles.flatList}
        renderItem={({ item }) =>
          <AppTouchable style={styles.roomItem}
            onPress={() => navigation.navigate(NavigationRoutes.CHAT, { room: item })}>
            <View style={styles.roomItemTop}>
              <Identicon
                value={item.roomId}
                style={styles.identiconView}
                size={45}
              />
              <View style={styles.roomItemContent}>
                <View style={styles.row}>
                  <AppText numberOfLines={1} variant="heading3" style={styles.roomName}>{item.roomId}</AppText>
                  <AppText numberOfLines={1} style={styles.roomTime}>{moment(item.timestamp).format('HH:mm')}</AppText>
                </View>
                <AppText numberOfLines={1} style={styles.roomLastMessage}>{item.lastMessage}</AppText>

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
