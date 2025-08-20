import React, { useEffect, useState } from 'react';
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
import { hash256 } from 'src/utils/encryption';
import { ChatEncryptionManager } from 'src/services/p2p/ChatEncryptionManager';
import ModalLoading from 'src/components/ModalLoading';

function Community() {
  const route = useRoute();
  const navigation = useNavigation();
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const cm = ChatPeerManager.getInstance();
  const communities = useQuery<CommunityType[]>(RealmSchema.Community);
  const lastBlock = useQuery<MessageType[]>(RealmSchema.Message).sorted('block', true)[0]?.block;
  const [loading, setLoading] = useState(!ChatPeerManager.isConnected);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (
        route.params?.contactKey &&
        route.params?.type === CommunityTypeEnum.Peer
      ) {
        initChat(route.params.contactKey, route.params.publicKey);
      } else if (route.params?.groupKey) {
      }
    });
    return unsubscribe;
  }, [navigation, app.id, route.params?.contactKey, route.params?.publicKey]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await initialize();
    await cm.loadPendingMessages(lastBlock);
    await cm.syncContacts();
  };

  const initialize = async () => {
    try {
      if (ChatPeerManager.isConnected) {
        setLoading(false);
        return;
      }
      const chatPeerInitialized = await cm.init(app.primarySeed);
      if (!chatPeerInitialized) {
        throw new Error();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error initializing chat peer:', error);
      Toast('Chat Peer initialization failed', true);
      return;
    }
  };

  const initChat = async (contactKey: string, publicKey: string) => {
    try {
      if (contactKey === app.contactsKey.publicKey) {
        Toast('You cannot chat with yourself', true);
        return;
      }
      const profiles = await Relay.getWalletProfiles([contactKey]);
      if (profiles.results.length > 0) {
        dbManager.createObject(RealmSchema.Contact, profiles.results[0]);
      }
      const communityId = hash256([app.contactsKey.publicKey, contactKey].sort().join('-'));
      const sessionKeys = ChatEncryptionManager.generateSessionKeys();
      const sharedSecret = ChatEncryptionManager.deriveSharedSecret(
        app.contactsKey.secretKey,
        publicKey
      );
      const pubKey = ChatEncryptionManager.derivePublicKey(app.contactsKey.secretKey);
      const encryptedKeys = ChatEncryptionManager.encryptKeys(sessionKeys.aesKey, sharedSecret);
      const community = dbManager.getObjectByPrimaryId(RealmSchema.Community, 'id', communityId);
      if (!community) {
        dbManager.createObject(RealmSchema.Community, {
          id: communityId,
          communityId: communityId,
          name: profiles.results[0].name,
          createdAt: Date.now(),
          type: CommunityTypeEnum.Peer,
          with: contactKey,
          key: sessionKeys.aesKey,
        });
        const message = {
          id: uuidv4(),
          communityId: communityId,
          type: MessageType.Alert,
          text: `Start of conversation`,
          createdAt: Date.now(),
          sender: app.contactsKey.publicKey,
          unread: false,
          encryptedKeys: encryptedKeys,
          pubKey: pubKey,
        };
        cm.sendMessage(contactKey, JSON.stringify(message));
        dbManager.createObject(RealmSchema.Message, message);
        Toast('New Tribe Contact created', false);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };


  return (
    <ScreenContainer>
      <ModalLoading visible={loading} />
      <CommunityHeader />
      <CommunityList onRefresh={init} />
    </ScreenContainer>
  );
}

export default Community;
