import React, { useContext, useMemo, useRef, useState } from 'react';
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
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import { CommonActions, useNavigation } from '@react-navigation/native';
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

export const CreateGroup = () => {
  const layout = useWindowDimensions();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const routes = useMemo(() => {
    return [
      { key: 'create', title: common.create },
      { key: 'join', title: common.join },
    ];
  }, []);
  return (
    <ScreenContainer>
      <AppHeader
        title={community.group}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
      />
      <TabView
        renderTabBar={props => <TabHeader {...props} />}
        navigationState={{ index, routes }}
        renderScene={renderScene}
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

const CreateTab = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const navigation = useNavigation();
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

  const isButtonDisabled = useMemo(() => {
    return !name || !desc || !image;
  }, [name, desc, image]);

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
          maxLength={100}
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
          title={common.create}
          disabled={isButtonDisabled}
          width={'100%'}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate(NavigationRoutes.GROUPINFO),
            )
          }
        />
      </View>
    </View>
  );
};

const JoinTab = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common, sendScreen } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [channelId, setChannelId] = useState('');
  const navigation = useNavigation();
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);

  const handlePasteChannelId = async () => {
    const clipboardValue = await Clipboard.getString();
    setChannelId(clipboardValue);
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
    const channelId = data[0]?.value;
    if (channelId) setChannelId(channelId);
    else Toast(community.scanChannelError, true);
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
          value={channelId}
          onChangeText={setChannelId}
          placeholder={community.viaChannelIdPlaceholder}
          multiline={true}
          maxLength={100}
          contentStyle={
            channelId ? styles.channelMultiLine : styles.channelIdInput
          }
          inputStyle={styles.shortInput}
          blurOnSubmit={true}
          returnKeyType="next"
          rightText={!channelId && sendScreen.paste}
          rightIcon={
            channelId && isThemeDark ? <ClearIcon /> : <ClearIconLight />
          }
          onRightTextPress={() =>
            channelId ? setChannelId('') : handlePasteChannelId()
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
          title={common.joinNow}
          disabled={!channelId}
          width={'100%'}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate(NavigationRoutes.GROUPINFO),
            )
          }
        />
      </View>
    </View>
  );
};

const renderScene = SceneMap({
  create: CreateTab,
  join: JoinTab,
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
      alignItems: 'center',
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
      alignSelf: 'center',
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
