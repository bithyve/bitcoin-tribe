import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp, windowHeight } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import TextField from 'src/components/TextField';
import pickImage from 'src/utils/imagePicker';
import { SceneMap, TabView } from 'react-native-tab-view';
import PrimaryCTA from 'src/components/PrimaryCTA';
import ClearIcon from 'src/assets/images/clearIcon.svg';
import ClearIconLight from 'src/assets/images/clearIcon_light.svg';
import Clipboard from '@react-native-clipboard/clipboard';
import GradientView from 'src/components/GradientView';
import Scan from 'src/assets/images/scan.svg';
import ScanLight from 'src/assets/images/scanLight.svg';
import Toast from 'src/components/Toast';
import AddMediaFile from 'src/assets/images/addMediaFile.svg';
import AddMediaFileLight from 'src/assets/images/addMediaFileLight.svg';
import { useChat } from 'src/hooks/useChat';
import { HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';
import ModalLoading from 'src/components/ModalLoading';
import Deeplinking, { DeepLinkFeature } from 'src/utils/DeepLinking';
import { events, logCustomEvent } from 'src/services/analytics';

export const CreateGroup = () => {
  const layout = useWindowDimensions();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const navigation = useNavigation();
  const params = useRoute().params;
  const [index, setIndex] = useState(0);
  const routes = useMemo(() => {
    return [
      { key: 'create', title: common.create },
      { key: 'join', title: common.join },
    ];
  }, []);
  const pendingJoinRef = useRef<any | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params) joinRoomWithParams(params);
  }, []);

  // Initialize P2P chat
  const {
    isInitializing,
    isCreatingRoom,
    isRootPeerConnected,
    currentRoom,
    createRoom,
    error,
    sendDMInvitation,
  } = useChat();

  // Navigate to chat when room is created/joined
  useEffect(() => {
    if (currentRoom && currentRoom.roomType != HolepunchRoomType.INBOX) {
      (navigation as any).navigate(NavigationRoutes.CHAT, {
        roomId: currentRoom.roomId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom]);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast(error, true);
    }
  }, [error]);

  const joinRoomWithParams = async params => {
    try {
      const {
        roomKey,
        roomName,
        roomType,
        roomDescription,
        publicKey,
        contactName,
      } = params as any;
      console.log({
        roomKey,
        roomName,
        roomType,
        roomDescription,
        publicKey,
        contactName,
      });
      navigation.setParams(null);
      setIndex(1);
      if (!roomType) {
        Toast('Invalid group link', true);
        return;
      }

      // If ready, join immediately
      if (!isInitializing && isRootPeerConnected) {
        if (roomType == HolepunchRoomType.GROUP){
          createRoom(roomName, roomType, roomDescription, '', roomKey);
          logCustomEvent(events.JOIN_GROUP);
        }
        else await joinDm(publicKey, contactName);
        return;
      }

      pendingJoinRef.current = params;
      Toast('Waiting for initialization...', false);

      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);

      pendingTimeoutRef.current = setTimeout(() => {
        if (pendingJoinRef.current) {
          pendingJoinRef.current = null;
          Toast('Initialization timed out. Try again later.', true);
        }
      }, 20000);
    } catch (error) {
      console.log('🚀 ~ CreateGroup ~ error:', error);
    }
  };

  useEffect(() => {
    if (!pendingJoinRef.current) return;
    if (!isInitializing && isRootPeerConnected) {
      const {
        roomKey,
        roomName,
        roomType,
        roomDescription,
        publicKey,
        contactName,
      } = pendingJoinRef.current;
      pendingJoinRef.current = null;
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
      if (roomType == HolepunchRoomType.GROUP){
        createRoom(roomName, roomType, roomDescription, '', roomKey);
        logCustomEvent(events.JOIN_GROUP);
      }
      else joinDm(publicKey, contactName);
    }
  }, [isInitializing, isRootPeerConnected]);

  const joinDm =async (publicKey, contactName)=>{
    const dmRoom = await sendDMInvitation(publicKey, contactName);
    logCustomEvent(events.JOIN_DM);
    (navigation as any).navigate(NavigationRoutes.CHAT, {
      roomId: dmRoom.roomId,
    });
    return;
  }

  return (
    <ScreenContainer>
      <ModalLoading visible={isInitializing || isCreatingRoom} />
      <AppHeader
        title={community.group}
        enableBack={true}
        onBackNavigation={() => {
          navigation.goBack()
        }}
      />

      <TabView
        animationEnabled={false}
        renderTabBar={props => <TabHeader {...props} />}
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          create: () => <CreateTab createRoom={createRoom} isCreatingRoom={isCreatingRoom} isRootPeerConnected={isRootPeerConnected} />,
          join: () => <JoinTab createRoom={createRoom} isCreatingRoom={isCreatingRoom} isRootPeerConnected={isRootPeerConnected} />,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </ScreenContainer>
  );
};
const TabHeader = ({ navigationState, jumpTo }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.tabBarContainer}>
      {navigationState.routes.map((route, index) => {
        const isActive = navigationState.index === index;
        return (
          <AppTouchable
            key={route.key}
            onPress={() => jumpTo(route.key)}
            style={styles.wrapper}>
            <AppText
              variant="heading3"
              style={{
                color: isActive ? theme.colors.accent1 : theme.colors.mutedTab,
              }}>
              {route.title}
            </AppText>
            <View
              style={[
                styles.activateView,
                {
                  height: 1,
                  backgroundColor: isActive
                    ? theme.colors.accent1
                    : theme.colors.mutedTab,
                },
              ]}
            />
          </AppTouchable>
        );
      })}
    </View>
  );
};

const CreateTab = ({ createRoom, isCreatingRoom, isRootPeerConnected }) => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const [image, setImage] = useState(null);

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = async () => {
    if (!isRootPeerConnected) {
      Toast('⚠️ Cannot create room - server is offline', true);
      return;
    }

    try {
      await createRoom(name, HolepunchRoomType.GROUP, desc, image);
      Toast('Room created successfully!', false);
      logCustomEvent(events.CREATE_GROUP);
    } catch (err) {
      console.error('Failed to create room:', err);
      Toast('Failed to create room', true);
    }
  };

  const isButtonDisabled = useMemo(() => {
    return !name || !desc || isCreatingRoom;
  }, [name, desc, isCreatingRoom]);

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex}>
        <AppText variant="body2" style={styles.textInputTitle}>
          {community.groupName}
        </AppText>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder={community.groupNamePlaceholder}
          maxLength={32}
          style={styles.input}
          autoCapitalize="words"
          blurOnSubmit={false}
          returnKeyType="next"
        />

        <AppText variant="body2" style={styles.textInputTitle}>
          {community.groupDesc}
        </AppText>
        <TextField
          ref={descriptionInputRef}
          value={desc}
          onChangeText={setDesc}
          placeholder={community.groupDescPlaceholder}
          onContentSizeChange={event =>
            setInputHeight(event.nativeEvent.contentSize.height)
          }
          keyboardType={'default'}
          returnKeyType="next"
          maxLength={300}
          multiline={true}
          numberOfLines={2}
          style={[styles.input, desc && styles.descInput]}
          blurOnSubmit={false}
        />

        <AppText variant="body2" style={styles.pictureLabel}>
          {community.groupPic}
        </AppText>

        {image ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri:
                  Platform.OS === 'ios' ? image.replace('file://', '') : image,
              }}
              style={styles.imageStyle}
            />
          </View>
        ) : (
          <AppTouchable
            onPress={handlePickImage}
            style={styles.imageSelectionCtr}>
            {isThemeDark ? <AddMediaFile /> : <AddMediaFileLight />}
          </AppTouchable>
        )}
        <AppText variant="caption" style={styles.textInputTitle}>
          {community.uploadFileDesc}
        </AppText>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <PrimaryCTA
          title={isCreatingRoom ? 'Creating...' : common.create}
          disabled={isButtonDisabled}
          width={'100%'}
          onPress={handleCreateRoom}
        />
      </View>
    </View>
  );
};

const JoinTab = ({ createRoom, isCreatingRoom, isRootPeerConnected }) => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common, sendScreen } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [joinData, setJoinData] = useState('');
  const navigation = useNavigation();
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);

  const handlePasteJoinData = async () => {
    const clipboardValue = await Clipboard.getString();
    setJoinData(clipboardValue);
  };

  const navigateToScanChannelId = () => {
    navigation.dispatch(
      CommonActions.navigate(NavigationRoutes.SCANQRSCREEN, {
        title: community.scanChannelTitle,
        subTitle: community.scanChannelSubTitle,
        onCodeScanned: onScanChannelId,
      }),
    );
  };

  const onScanChannelId = data => {
    const joinData = data[0]?.value;
    if (joinData) setJoinData(joinData);
    else Toast(community.scanChannelError, true);
  };

  const handleJoinRoom = async () => {
    let parsedJoinData;
    try {
      const { isValid, feature, params } = Deeplinking.processDeepLink(joinData);
      if (!isValid || feature !== DeepLinkFeature.COMMUNITY) {
        Toast('Invalid community deeplink', true);
        return;
      }

      parsedJoinData = params;
      if (!parsedJoinData?.roomKey || !parsedJoinData?.roomType) {
        Toast('Invalid join data, missing room key or room type', true);
        return;
      }
    } catch (error) {
      Toast('Invalid join data', true);
      return;
    }


    if (!isRootPeerConnected) {
      Toast('Cannot join room - server is offline', true);
      return;
    }

    try {
      if (!parsedJoinData?.roomKey) throw new Error('Invalid join data');
      await createRoom(parsedJoinData.roomName, parsedJoinData.roomType, parsedJoinData.roomDescription, parsedJoinData.roomImage, parsedJoinData.roomKey);
      Toast('Joined room successfully!', false);
      logCustomEvent(events.JOIN_GROUP);
    } catch (err) {
      console.error('Failed to join room:', err);
      Toast('Failed to join room - invalid key or connection error', true);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex}>
        <AppText variant="body1" style={styles.joinHeaderText}>
          {community.joinExisting}
        </AppText>

        <AppText variant="body2" style={styles.textInputTitle}>
          {community.viaChannelId}
        </AppText>
        <TextField
          value={joinData}
          onChangeText={setJoinData}
          placeholder={community.viaChannelIdPlaceholder}
          multiline={true}
          contentStyle={
            joinData ? styles.channelMultiLine : styles.channelIdInput
          }
          inputStyle={styles.shortInput}
          blurOnSubmit={true}
          returnKeyType="next"
          rightText={!joinData && sendScreen.paste}
          rightIcon={
            joinData && isThemeDark ? <ClearIcon /> : <ClearIconLight />
          }
          onRightTextPress={() =>
            joinData ? setJoinData('') : handlePasteJoinData()
          }
          rightCTAStyle={styles.rightCTAStyle}
          rightCTATextColor={theme.colors.accent1}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
        />

        <AppTouchable
          onPress={navigateToScanChannelId}
          style={styles.scannerCtaCtr}>
          <GradientView
            style={styles.ctaContainer}
            colors={[
              theme.colors.cardGradient1,
              theme.colors.cardGradient2,
              theme.colors.cardGradient3,
            ]}>
            <View style={styles.iconWrapper}>
              <View style={styles.contentWrapper}>
                <AppText variant="body1" style={styles.ctaTitleStyle}>
                  {community.viaQR}
                </AppText>
              </View>
            </View>
            <View style={styles.ctaIconCtr}>
              {isThemeDark ? <Scan /> : <ScanLight />}
            </View>
          </GradientView>
        </AppTouchable>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <PrimaryCTA
          title={isCreatingRoom ? 'Joining...' : common.joinNow}
          disabled={!joinData || isCreatingRoom}
          width={'100%'}
          onPress={handleJoinRoom}
        />
      </View>
    </View>
  );
};

// Styles for disconnected banner
const styles = StyleSheet.create({
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
});

const getStyles = (theme: AppTheme, inputHeight = 0) =>
  StyleSheet.create({
    textInputTitle: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(5),
      marginBottom: hp(3),
    },
    input: {
      marginVertical: hp(5),
    },
    buttonWrapper: {
      marginTop: hp(30),
      alignItems: 'center',
    },
    // Create Tab
    flex: {
      flex: 1,
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    pictureLabel: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(10),
      marginBottom: hp(13),
    },
    imageWrapper: {
      alignItems: 'flex-start',
    },
    imageStyle: {
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageSelectionCtr: {
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      paddingVertical: hp(14),
      borderStyle: 'dashed',
      marginBottom: hp(10),
    },

    // Join Tab
    joinHeaderText: { marginBottom: hp(15) },
    channelIdInput: { height: hp(50) },
    channelMultiLine: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    shortInput: { width: '80%' },
    rightCTAStyle: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(16) : hp(10),
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '85%',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    ctaTitleStyle: {
      color: theme.colors.headingColor,
    },
    ctaIconCtr: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    scannerCtaCtr: { marginTop: hp(20) },

    // TabBar
    tabBarContainer: {
      flexDirection: 'row',
      marginBottom: hp(30),
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    activateView: {
      width: '100%',
      marginTop: hp(10),
    },
  });
