import React, { useContext, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
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
import { CommonActions, useNavigation } from '@react-navigation/native';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import IconScan from 'src/assets/images/ic_scan.svg';
import IconScanLight from 'src/assets/images/ic_scan_light.svg';
import AppTouchable from 'src/components/AppTouchable';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import TextField from 'src/components/TextField';
import pickImage from 'src/utils/imagePicker';
import AddMediaFile from 'src/assets/images/addMediaFile.svg';
import AddMediaFileLight from 'src/assets/images/addMediaFileLight.svg';
import Buttons from 'src/components/Buttons';

const qrSize = (windowWidth * 65) / 100;

export const CreateGroup = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [groupId, setGroupId] = useState('');


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

  const handlePickImage = async () => {
    Keyboard.dismiss();
    try {
      const result = await pickImage(false);
      setImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={'Create or Join group'}
        subTitle={''}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
        rightIcon={isThemeDark ? <IconScan /> : <IconScanLight />}
        onSettingsPress={handleScan}
      />
      <View style={styles.bodyWrapper}>
        <AppText variant="body2" style={styles.textInputTitle}>
          {'Group Name'}
        </AppText>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder={'Enter group name'}
          maxLength={32}
          style={styles.input}
          autoCapitalize="words"
          //   onSubmitEditing={handleAssetNameSubmit}
          blurOnSubmit={false}
          returnKeyType="next"
          //   error={assetNameValidationError}
        />

        <AppText variant="body2" style={styles.textInputTitle}>
          {'Group description'}
        </AppText>
        <TextField
          ref={descriptionInputRef}
          value={desc}
          onChangeText={setDesc}
          placeholder={'Enter a group description'} // !
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          keyboardType={'default'}
          returnKeyType="next"
          maxLength={100}
          multiline={true}
          numberOfLines={2}
          style={[styles.input, desc && styles.descInput]}
          //   onSubmitEditing={() => totalSupplyInputRef.current?.focus()}
          blurOnSubmit={false}
          //   error={assetDescValidationError}
        />

        <AppText
          variant="body2"
          style={[styles.textInputTitle, { marginTop: 10 }]}>
          Profile Picture
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
            style={styles.addMediafileIconWrapper}>
            {isThemeDark ? <AddMediaFile /> : <AddMediaFileLight />}
          </AppTouchable>
        )}
        <AppText
          variant="caption"
          style={[styles.textInputTitle, { marginTop: 10 }]}>
          Upload a picture for your group profile photo (e.g., logo or artwork)
        </AppText>

        <AppText variant="body2" style={styles.textInputTitle}>
          {'Connect with Group Id'}
        </AppText>
        <TextField
          value={groupId}
          onChangeText={setGroupId}
          placeholder={'Submit to connect'}
          maxLength={32}
          style={styles.input}
          autoCapitalize="words"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            console.log('Connect to group with id ', groupId);
          }}
          blurOnSubmit={false}
          returnKeyType="next"
          //   error={assetNameValidationError}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={'Create'}
          primaryOnPress={() => navigation.dispatch(CommonActions.navigate(NavigationRoutes.GROUPINFO))}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          // disabled={isButtonDisabled || createUtxos.isLoading || loading}
          width={windowWidth / 2.3}
          secondaryCTAWidth={windowWidth / 2.3}
          // primaryLoading={createUtxos.isLoading || loading}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, inputHeight) =>
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
    textInputTitle: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(5),
      marginBottom: hp(3),
    },
    input: {
      marginVertical: hp(5),
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    imageWrapper: {},
    imageStyle: {
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    addMediafileIconWrapper: {
      marginVertical: hp(5),
    },
    buttonWrapper: {
      marginTop: hp(30),
    },
  });
