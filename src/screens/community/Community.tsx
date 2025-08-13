import React, { useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import CommunityHeader from './components/CommunityHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { MessageType } from 'src/models/interfaces/Community';
import { v4 as uuidv4 } from 'uuid';
import Relay from 'src/services/relay';
import {
  Community as CommunityType,
  CommunityType as CommunityTypeEnum,
} from 'src/models/interfaces/Community';
import CommunityList from './components/CommunityList';
import ChatPeerManager from 'src/services/p2p/ChatPeerManager';
import Toast from 'src/components/Toast';
import { ChatKeyManager } from 'src/utils/ChatEnc';
import { hash256 } from 'src/utils/encryption';

function Community() {
  const route = useRoute();
  const navigation = useNavigation();
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const cm = ChatPeerManager.getInstance();
  const communities = useQuery<CommunityType[]>(RealmSchema.Community);
  const lastBlock = useQuery<MessageType[]>(RealmSchema.Message).sorted('block', true)[0]?.block;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (
        route.params?.publicKey &&
        route.params?.type === CommunityTypeEnum.Peer
      ) {
        initChat(route.params.publicKey);
      } else if (route.params?.groupKey) {
      }
    });
    return unsubscribe;
  }, [navigation, app.id, route.params?.publicKey]);

  const initChat = async (publicKey: string) => {
    try {
      const profiles = await Relay.getWalletProfiles([publicKey]);
      if (profiles.results.length > 0) {
        dbManager.createObject(RealmSchema.Contact, profiles.results[0]);
      }
      const communityId = hash256([app.contactsKey.publicKey, publicKey].sort().join('-'));
      const sessionKeys = ChatKeyManager.generateSessionKeys();
      const encryptedKeys = ChatKeyManager.encryptKeys(
        sessionKeys.aesKey,
        ChatKeyManager.performKeyExchange(app.contactsKey, publicKey),
      );
      const community = dbManager.getObjectByPrimaryId(RealmSchema.Community, 'id', communityId);
      if (!community) {
        dbManager.createObject(RealmSchema.Community, {
          id: communityId,
          communityId: communityId,
          name: profiles.results[0].name,
          createdAt: Date.now(),
          type: CommunityTypeEnum.Peer,
          with: publicKey,
          key: sessionKeys.aesKey,
        });
        const message = {
          id: uuidv4(),
          communityId: communityId,
          type: MessageType.Alert,
          text: `Start of community`,
          createdAt: Date.now(),
          sender: app.contactsKey.publicKey,
          unread: false,
          encryptedKeys: encryptedKeys,
        };
        cm.sendMessage(publicKey, JSON.stringify(message));
        dbManager.createObject(RealmSchema.Message, message);
        Toast('New Tribe Contact created', false);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await cm.loadPendingMessages(lastBlock);
    await cm.syncContacts();
  };

  useEffect(() => {
    listenToRooms();
  }, []);

  const listenToRooms = () => {
    try {
      cm.setOnConnectionListener(handleConnection);
    } catch (error) {
      console.error('Error setting up rooms listener:', error);
    }
  };

  const handleConnection = async (data: any) => {
    console.log('data', data);

    return;
    try {
      const profiles = await Relay.getWalletProfiles([
        app.contactsKey.publicKey,
      ]);
      if (profiles.results.length > 0) {
        dbManager.createObject(RealmSchema.Contact, profiles.results[0]);
      }
      const communityId = [app.contactsKey.publicKey, data.publicKey]
        .sort()
        .join('-');
      const community = communities.find(c => c.id === communityId);
      if (!community) {
        dbManager.createObject(RealmSchema.Community, {
          id: communityId,
          communityId: communityId,
          name: profiles.results[0].name,
          createdAt: Date.now(),
          type: CommunityTypeEnum.Peer,
          with: data.publicKey,
        });
      }
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  return (
    <ScreenContainer>
      <CommunityHeader />
      <CommunityList onRefresh={init} />
    </ScreenContainer>
  );
}

export default Community;
