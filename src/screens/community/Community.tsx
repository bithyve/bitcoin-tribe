import React, { useEffect, useState, useCallback, useContext } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import HomeHeader from '../home/components/HomeHeader';
import { StyleSheet, View, FlatList, Text, Image, Modal, Share, TextInput, ActivityIndicator } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { useChat } from 'src/hooks/useChat';
import { HolepunchRoom, HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { HolepunchMessage } from 'src/services/messaging/holepunch/storage/MessageStorage';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import { formatSmartTime } from 'src/utils/snakeCaseToCamelCaseCase';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import EmptyCommunityIllustration from 'src/assets/images/emptyCommunityIllustration.svg';
import EmptyCommunityIllustrationLight from 'src/assets/images/emptyCommunityIllustration_light.svg';
import { AppContext } from 'src/contexts/AppContext';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import QRScanner from 'src/components/QRScanner';
import Deeplinking, { DeepLinkFeature } from 'src/utils/DeepLinking';
import { useQuery, useRealm } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { events, logCustomEvent } from 'src/services/analytics';

function Community() {
  const theme: AppTheme = useTheme();
  const realm = useRealm();
  const [rooms, setRooms] = useState<HolepunchRoom[]>([]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStartDMModal, setShowStartDMModal] = useState(false);
  const [publicKeyInput, setPublicKeyInput] = useState('');
  const [isCreatingDM, setIsCreatingDM] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasAutoSynced, setHasAutoSynced] = useState(false);
  const [hasConnectionSettled, setHasConnectionSettled] = useState(false);
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { community } = translations;
  const { communityStatus, setCommunityStatus } =
    useContext(AppContext);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];


  // Initialize P2P chat with useChat hook
  const {
    isInitializing,
    isRootPeerConnected,
    isReconnecting,
    error,
    getAllRooms,
    reconnectRootPeer,
    syncInbox,
    getCurrentPeerPubKey,
    sendDMInvitation,
    getInboxRoom,
  } = useChat();

  // Only get public key if service is initialized
  const userPublicKey = !isInitializing ? getCurrentPeerPubKey() : null;

  // Generate contact deep link once
  const contactDeepLink = userPublicKey ? Deeplinking.buildUrl(DeepLinkFeature.COMMUNITY, {
    publicKey: userPublicKey,
    contactName: app?.appName || 'Anonymous',
    roomType: HolepunchRoomType.DIRECT_MESSAGE,
  }) : null;

  // Load rooms from storage and filter by type
  const loadRooms = useCallback(async () => {
    try {
      const savedRooms = await getAllRooms();

      // Filter out inbox rooms
      const filteredRooms = (savedRooms || []).filter(
        r => r.roomType !== HolepunchRoomType.INBOX
      );

      setRooms(filteredRooms);
    } catch (e) {
      setRooms([]);
    }
  }, [getAllRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Reload rooms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[Community] Screen focused, reloading rooms...');
      loadRooms();
    }, [loadRooms]),
  );

  // Auto-sync inbox when root peer connects for the first time
  useEffect(() => {
    const autoSyncInbox = async () => {
      // Only auto-sync if:
      // 1. Root peer is connected
      // 2. Not currently syncing
      // 3. Haven't auto-synced yet in this session
      if (isRootPeerConnected && !isSyncing && !hasAutoSynced) {
        setHasAutoSynced(true);
        console.log('[Community] 📬 Auto-syncing inbox on first connection...');

        try {
          setIsSyncing(true);
          
          // Get inbox room and query its messages
          const inboxRoom = await getInboxRoom();
          const lastSyncIndex = inboxRoom 
            ? realm.objects<HolepunchMessage>(RealmSchema.HolepunchMessage)
                .filtered('roomId == $0', inboxRoom.roomId).length
            : 0;
          
          console.log('[Community] 📬 Last sync index:', lastSyncIndex);
          const { synced } = await syncInbox(lastSyncIndex);

          if (synced) {
            console.log('[Community] ✅ Auto-sync complete');
            // Reload rooms to show new DMs
            setTimeout(() => {
              loadRooms();
            }, 0)
          } else {
            console.warn('[Community] Auto-sync returned false');
          }
        } catch (error) {
          console.error('[Community] Auto-sync failed:', error);
          // Don't show error toast for auto-sync failures
        } finally {
          setIsSyncing(false);
        }
      }
    };

    autoSyncInbox();
  }, [isRootPeerConnected, isSyncing, hasAutoSynced, syncInbox, loadRooms, getInboxRoom]);

  useEffect(() => {
    if (error) {
      Toast(error, true);
    }
  }, [error]);

  const handleOpenRoom = (room: HolepunchRoom) => {
    // Navigate immediately without waiting for join
    (navigation as any).navigate(NavigationRoutes.CHAT, {
      roomId: room.roomId,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // If root peer is disconnected, try to reconnect
      if (!isRootPeerConnected) {
        console.log(
          '[Community] 🔄 Root peer disconnected, attempting reconnection...',
        );
        try {
          await reconnectRootPeer();
          setCommunityStatus('connected');
        } catch (reconnectError) {
          console.error('[Community] Failed to reconnect:', reconnectError);
          Toast('Could not reconnect to server', true);
        }
      }

      // Always reload rooms list
      await loadRooms();
      await handleSyncInbox();
    } catch (error) {
      console.error('[Community] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleCopyPublicKey = () => {
    if (contactDeepLink) {
      Clipboard.setString(contactDeepLink);
      Toast('Contact link copied to clipboard');
    }
  };

  const handleSharePublicKey = async () => {
    if (contactDeepLink) {
      try {
        await Share.share({
          message: `Add me on Tribe!\n\n${contactDeepLink}\n\nScan my QR code or tap the link to start a DM.`,
          title: 'My Tribe Contact',
        });
      } catch (error) {
        console.error('[Community] Failed to share public key:', error);
      }
    }
  };

  // Start DM Modal handlers
  const handleShowStartDM = () => {
    setShowStartDMModal(true);
    setScanning(true);
    setPublicKeyInput('');
  };

  const handleCloseStartDM = () => {
    setShowStartDMModal(false);
    setScanning(true);
    setPublicKeyInput('');
    setIsCreatingDM(false);
  };

  const parseDeepLinkData = (data: string): { publicKey: string; contactName?: string } | null => {
    try {
      // Handle deep link format (https://bitcointribe.app/app/.../community?publicKey=...&roomType=direct_message&contactName=...)
      const deepLinkResult = Deeplinking.processDeepLink(data);
      if (deepLinkResult.isValid && deepLinkResult.feature === DeepLinkFeature.COMMUNITY) {
        // Check if it's a contact type (DM invitation)
        if (deepLinkResult.params?.roomType === HolepunchRoomType.DIRECT_MESSAGE) {
          const publicKey = deepLinkResult.params?.publicKey;
          const contactName = deepLinkResult.params?.contactName;
          if (publicKey && /^[0-9a-f]{64}$/i.test(publicKey)) {
            return { publicKey, contactName };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('[Community] Failed to parse QR data:', error);
      return null;
    }
  };

  const handleStartDM = async (publicKey: string, contactName?: string) => {
    try {
      setIsCreatingDM(true);
      console.log('[Community] Starting DM with:', publicKey.substring(0, 8), 'Contact:', contactName);

      const dmRoom = await sendDMInvitation(publicKey, contactName);
      logCustomEvent(events.CREATE_DM);

      Toast('DM invitation sent!');
      handleCloseStartDM();

      // Navigate to the DM chat
      (navigation as any).navigate(NavigationRoutes.CHAT, {
        roomId: dmRoom.roomId,
      });

    } catch (error) {
      console.error('[Community] Failed to start DM:', error);
      Toast(error.message || 'Failed to start DM', true);
    } finally {
      setIsCreatingDM(false);
    }
  };

  const handleQRScan = async (codes: any[]) => {
    if (!codes || codes.length === 0) return;

    const data = codes[0]?.value;
    if (!data) return;

    const result = parseDeepLinkData(data);

    if (!result) {
      Toast('Invalid QR code format', true);
      return;
    }

    if (result.publicKey === userPublicKey) {
      Toast('You cannot DM yourself', true);
      return;
    }

    setScanning(false);
    await handleStartDM(result.publicKey, result.contactName);
  };

  const handlePasteFromClipboard = async () => {
    const clipboardContent = await Clipboard.getString();
    if (clipboardContent) {
      setPublicKeyInput(clipboardContent);
    }
  };

  const handleManualSubmit = async () => {
    const trimmedInput = publicKeyInput.trim();

    if (!trimmedInput) {
      Toast('Please enter a contact link', true);
      return;
    }

    const result = parseDeepLinkData(trimmedInput);

    if (!result) {
      Toast('Invalid contact link format', true);
      return;
    }

    if (result.publicKey === userPublicKey) {
      Toast('You cannot DM yourself', true);
      return;
    }

    await handleStartDM(result.publicKey, result.contactName);
  };

  // Sync inbox handler
  const handleSyncInbox = async () => {
    if (isSyncing || !isRootPeerConnected) {
      if (!isRootPeerConnected) {
        Toast('Cannot sync - not connected to root peer', true);
      }
      return;
    }

    setIsSyncing(true);
    try {
      console.log('[Community] Starting inbox sync...');
      
      // Get inbox room and query its messages
      const inboxRoom = await getInboxRoom();
      const lastSyncIndex = inboxRoom 
        ? realm.objects<HolepunchMessage>(RealmSchema.HolepunchMessage)
            .filtered('roomId == $0', inboxRoom.roomId).length
        : 0;

      const { synced } = await syncInbox(lastSyncIndex);
      if (synced) {
        Toast('✅ Inbox synced');
        setTimeout(() => {
          loadRooms();
        }, 0)
      } else {
        Toast('Failed to sync inbox', true);
      }
    } catch (error) {
      console.error('[Community] Failed to sync inbox:', error);
      Toast('Failed to sync inbox', true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset settlement state when initialization starts
  useEffect(() => {
    if (isInitializing) {
      setHasConnectionSettled(false);
    }
  }, [isInitializing]);

  // Track when connection settles (we've seen at least one connection event)
  // Connection is considered "settled" when:
  // 1. We've seen isRootPeerConnected become true (connected), OR
  // 2. After initialization completes, we wait a reasonable time and if still not connected, mark as settled (offline)
  useEffect(() => {
    if (isInitializing) {
      return;
    }

    // If we become connected, immediately mark as settled
    if (isRootPeerConnected && !hasConnectionSettled) {
      setHasConnectionSettled(true);
      return;
    }

    // If we've already been connected before (settled), and we disconnect,
    // we're still considered settled (just show offline status)
    if (hasConnectionSettled && !isRootPeerConnected) {
      // Already settled, no action needed
      return;
    }

    // If we haven't settled yet and we're not connected, start a timer
    // This gives time for the connection attempt to complete
    if (!hasConnectionSettled && !isRootPeerConnected) {
      const timer = setTimeout(() => {
        setHasConnectionSettled(true);
      }, 10000); // Give 10 seconds for connection attempt
      
      return () => clearTimeout(timer);
    }
  }, [isRootPeerConnected, isInitializing, hasConnectionSettled]);

  // Set community status based on connection state
  useEffect(() => {
    // Don't set status while initializing
    if (isInitializing) {
      return;
    }

    // If connection hasn't settled yet, show connecting
    if (!hasConnectionSettled) {
      setCommunityStatus('connecting');
      return;
    }

    // Connection has settled, show final status
    if (isRootPeerConnected) {
      setCommunityStatus('online');
    } else {
      setCommunityStatus('offline');
    }
  }, [isInitializing, isRootPeerConnected, hasConnectionSettled]);

  // Get connection status for status bar
  const getConnectionStatus = () => {
    if (isInitializing) {
      return { text: '🔄 Initializing P2P chat...', color: theme.colors.accent };
    }
    if (!isRootPeerConnected) {
      return { text: '🔌 Connecting to root peer...', color: '#FFA500' };
    }
    if (isReconnecting) {
      return { text: '🔄 Reconnecting...', color: theme.colors.accent };
    }
    return null;
  };

  const connectionStatus = getConnectionStatus();


  const renderRoomItem = ({ item }: { item: HolepunchRoom }) => {
    const isDM = item.roomType === HolepunchRoomType.DIRECT_MESSAGE;

    return (
      <AppTouchable
        style={styles.roomCard}
        onPress={() => handleOpenRoom(item)}
        activeOpacity={0.7}>
        <View style={styles.roomCardRow}>
          <View style={styles.roomImageContainer}>
            {item.roomImage ? (
              <Image
                style={styles.roomImage}
                source={{ uri: item.roomImage ?? '' }}
              />
            ) : (
              <View style={[styles.roomImage, styles.roomImagePlaceholder]}>
                <AppText style={styles.roomImagePlaceholderText}>
                  {item.roomName.charAt(0).toUpperCase()}
                </AppText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.roomInfo}>
            <AppText variant="heading3SemiBold">{item.roomName}</AppText>
            <AppText variant="caption" style={styles.roomDesc}>
              {item.roomDescription}
            </AppText>
          </View>
        <AppText variant="caption" style={styles.roomTime}>
          {formatSmartTime(item?.lastActive)}
        </AppText>
      </AppTouchable>
    );
  };

  const ItemSeparatorComponent = () => <View style={styles.listSeparator} />;

  return (
    <ScreenContainer style={styles.container}>
      <ModalLoading visible={isInitializing || isReconnecting} />
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showAdd />
      </View>

      {/* Connection Status Bar */}
      {/* {connectionStatus && (
        <View style={[styles.statusBar, { backgroundColor: connectionStatus.color }]}>
          <AppText style={styles.statusBarText}>{connectionStatus.text}</AppText>
        </View>
      )} */}

      {isInitializing ? (
        <View style={styles.loadingContainer}>
          <Text>Initializing P2P chat...</Text>
        </View>
      ) : (
        <>
          {/* Action buttons for My DM QR, Start DM, and Sync Inbox */}
          <View style={styles.actionButtonsContainer}>

          </View>

          {/* Sync Inbox Button */}
          {/* <View style={styles.syncButtonContainer}>
            <AppTouchable
              style={[
                styles.syncButton,
                (isSyncing || !isRootPeerConnected) && styles.syncButtonDisabled
              ]}
              onPress={handleSyncInbox}
              activeOpacity={0.7}
              disabled={isSyncing || !isRootPeerConnected}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={theme.colors.primaryBackground} />
              ) : (
                <AppText style={[
                  styles.syncButtonText,
                  !isRootPeerConnected && styles.syncButtonTextDisabled
                ]}>
                  🔄 Sync DM Invitations
                </AppText>
              )}
            </AppTouchable>
          </View> */}

          <FlatList
            data={rooms}
            keyExtractor={item => item.roomKey}
            renderItem={renderRoomItem}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <>
                <EmptyStateView
                  title={community.noConnectionTitle}
                  subTitle={community.noConnectionSubTitle}
                  IllustartionImage={
                    isThemeDark ? (
                      <EmptyCommunityIllustration />
                    ) : (
                      <EmptyCommunityIllustrationLight />
                    )
                  }
                />
                <AppText variant="heading3" style={styles.pullText}>
                  Pull down to sync inbox
                </AppText>
              </>
            }
            style={styles.flatList}
            ItemSeparatorComponent={ItemSeparatorComponent}
          />
        </>
      )}

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <AppText variant="heading3" style={styles.modalTitle}>
                My DM QR Code
              </AppText>
              <AppTouchable onPress={() => setShowQRModal(false)}>
                <AppText style={styles.closeButton}>✕</AppText>
              </AppTouchable>
            </View>

            {/* QR Code */}
            {contactDeepLink && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={contactDeepLink}
                  size={wp(250)}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            )}

            {/* Contact Link Display */}
            {contactDeepLink && (
              <View style={styles.publicKeyContainer}>
                <AppText variant="body2" style={styles.publicKeyLabel}>
                  Contact Link
                </AppText>
                <View style={styles.publicKeyBox}>
                  <AppText variant="caption" style={styles.publicKeyText} numberOfLines={3}>
                    {contactDeepLink}
                  </AppText>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActionButtons}>
              <AppTouchable
                onPress={handleCopyPublicKey}
                style={[styles.modalActionButton, styles.copyButton]}
              >
                <AppText style={styles.copyButtonText}>Copy Link</AppText>
              </AppTouchable>

              <AppTouchable
                onPress={handleSharePublicKey}
                style={[styles.modalActionButton, styles.shareButton]}
              >
                <AppText style={styles.shareButtonText}>Share</AppText>
              </AppTouchable>
            </View>

            {/* Info Text */}
            <AppText variant="caption" style={styles.infoText}>
              Share this QR code or contact link with others so they can send you DM invitations
            </AppText>
          </View>
        </View>
      </Modal>

      {/* Start DM Modal */}
      <Modal
        visible={showStartDMModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStartDM}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <AppText variant="heading3" style={styles.modalTitle}>
                Start Direct Message
              </AppText>
              <AppTouchable onPress={handleCloseStartDM}>
                <AppText style={styles.closeButton}>✕</AppText>
              </AppTouchable>
            </View>

            {isCreatingDM ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
                <AppText style={styles.loadingText}>Creating DM room...</AppText>
              </View>
            ) : (
              <>
                {/* QR Scanner */}
                {scanning ? (
                  <View style={styles.scannerContainer}>
                    <QRScanner onCodeScanned={handleQRScan} isScanning={scanning} />
                    <AppText variant="caption" style={styles.scannerHint}>
                      Scan contact's QR code
                    </AppText>
                  </View>
                ) : null}

                {/* Manual Input Section */}
                <View style={styles.manualInputSection}>
                  <AppText variant="body2" style={styles.inputLabel}>
                    Or paste contact link
                  </AppText>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={publicKeyInput}
                      onChangeText={setPublicKeyInput}
                      placeholder="Paste contact link"
                      placeholderTextColor={theme.colors.placeholder}
                      autoCapitalize="none"
                      autoCorrect={false}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <AppTouchable
                      onPress={handlePasteFromClipboard}
                      style={[styles.actionButtonSmall, styles.pasteButton]}
                    >
                      <AppText style={styles.pasteButtonText}>Paste</AppText>
                    </AppTouchable>
                    <AppTouchable
                      onPress={handleManualSubmit}
                      style={[
                        styles.actionButtonSmall,
                        styles.submitButton,
                        !publicKeyInput.trim() && styles.submitButtonDisabled,
                      ]}
                      disabled={!publicKeyInput.trim()}
                    >
                      <AppText
                        style={[
                          styles.submitButtonText,
                          !publicKeyInput.trim() && styles.submitButtonTextDisabled,
                        ]}
                      >
                        Start DM
                      </AppText>
                    </AppTouchable>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 0,
    },
    listSeparator: {
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.optionsCardGradient2,
      marginVertical: hp(15),
    },
    roomCard: { flexDirection: 'row', justifyContent: 'space-between' },
    roomCardRow: {
      gap: wp(15),
      flexDirection: 'row',
      alignItems: 'center',
    },
    roomTime: {
      color: theme.colors.mutedTab,
      paddingTop: hp(10),
    },
    roomImageContainer: {},
    roomImage: {
      height: wp(50),
      width: wp(50),
      borderRadius: wp(50),
      backgroundColor: theme.colors.mutedTab,
    },
    roomImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.accent,
    },
    roomImagePlaceholderText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primaryBackground,
    },
    roomTypeBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: wp(18),
      height: wp(18),
      borderRadius: wp(9),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primaryBackground,
    },
    dmBadge: {
      backgroundColor: '#4CAF50', // Green for DMs
    },
    groupBadge: {
      backgroundColor: '#2196F3', // Blue for Groups
    },
    roomTypeBadgeText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    roomInfo: {
      flex: 1,
      marginHorizontal: wp(10),
      marginVertical: hp(5),
    },

    // Action buttons
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: wp(12),
      paddingHorizontal: wp(16),
      marginBottom: hp(16),
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      paddingVertical: hp(12),
      paddingHorizontal: wp(16),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(8),
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryText,
    },
    primaryActionButton: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    primaryActionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },

    // Sync button
    syncButtonContainer: {
      paddingHorizontal: wp(16),
      marginBottom: hp(16),
    },
    syncButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      paddingVertical: hp(12),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: hp(48),
    },
    syncButtonDisabled: {
      opacity: 0.6,
    },
    syncButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },
    syncButtonTextDisabled: {
      opacity: 0.5,
    },

    // Status bar
    statusBar: {
      paddingVertical: hp(10),
      paddingHorizontal: wp(16),
      alignItems: 'center',
      marginHorizontal: wp(16),
      marginBottom: hp(12),
      borderRadius: 8,
    },
    statusBarText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },

    //
    disconnectedBanner: {
      backgroundColor: '#FFA500',
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    disconnectedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    headerWrapper: {
      marginVertical: hp(16),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flatList: {
      flex: 1,
    },
    emptyListContent: {
      // flexGrow: 1,
    },

    roomName: {
      marginBottom: hp(3),
    },
    roomDesc: {
      color: theme.colors.mutedTab,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: '#666666',
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.primaryBackground,
      borderRadius: 16,
      padding: wp(24),
      width: wp(340),
      maxWidth: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(20),
    },
    modalTitle: {
      color: theme.colors.headingColor,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.placeholder,
      paddingHorizontal: wp(8),
    },
    qrContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: wp(20),
      backgroundColor: 'white',
      borderRadius: 12,
      marginBottom: hp(20),
    },
    publicKeyContainer: {
      marginBottom: hp(20),
    },
    publicKeyLabel: {
      color: theme.colors.placeholder,
      marginBottom: hp(8),
    },
    publicKeyBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      padding: wp(12),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    publicKeyText: {
      color: theme.colors.placeholder,
      fontFamily: 'Courier',
      fontSize: 12,
    },
    modalActionButtons: {
      flexDirection: 'row',
      gap: wp(12),
    },
    modalActionButton: {
      flex: 1,
      paddingVertical: hp(12),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyButton: {
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    copyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },
    shareButton: {
      backgroundColor: theme.colors.accent,
    },
    shareButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },
    infoText: {
      color: theme.colors.placeholder,
      textAlign: 'center',
      marginTop: hp(16),
    },

    // Start DM Modal styles
    scannerContainer: {
      height: hp(300),
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: hp(20),
      backgroundColor: theme.colors.cardBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerHint: {
      color: theme.colors.placeholder,
      textAlign: 'center',
      marginTop: hp(12),
    },
    manualInputSection: {
      marginTop: hp(12),
    },
    inputLabel: {
      color: theme.colors.placeholder,
      marginBottom: hp(8),
    },
    inputRow: {
      marginBottom: hp(12),
    },
    input: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      padding: wp(12),
      color: theme.colors.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      minHeight: hp(60),
      textAlignVertical: 'top',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: wp(12),
    },
    actionButtonSmall: {
      flex: 1,
      paddingVertical: hp(12),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pasteButton: {
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    pasteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    submitButton: {
      backgroundColor: theme.colors.accent,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.cardBackground,
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },
    submitButtonTextDisabled: {
      color: theme.colors.placeholder,
    },
    loadingText: {
      marginTop: hp(12),
      color: theme.colors.text,
    },
    pullText: {
      color: theme.colors.secondaryHeadingColor,
      alignSelf: 'center',
      marginTop: hp(5),
    },
  });

export default Community;
