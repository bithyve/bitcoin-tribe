import React, { useContext, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import TextField from 'src/components/TextField';
import pickImage from 'src/utils/imagePicker';
import PrimaryCTA from 'src/components/PrimaryCTA';
import AddMediaFile from 'src/assets/images/addMediaFile.svg';
import AddMediaFileLight from 'src/assets/images/addMediaFileLight.svg';

export const EditGroup = ({ route }) => {
  const theme: AppTheme = useTheme();
  const params = useRoute<any>().params;
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [name, setName] = useState(params?.groupName ?? '');
  const [desc, setDesc] = useState(params?.groupDesc ?? '');
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const navigation = useNavigation();
  const [image, setImage] = useState(params?.groupImage ?? null);

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
    <ScreenContainer>
      <AppHeader
        title={'Edit Group'}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
      />
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
                    Platform.OS === 'ios'
                      ? image.replace('file://', '')
                      : image,
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
            title={common.save}
            disabled={isButtonDisabled}
            width={'100%'}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, inputHeight = 0) =>
  StyleSheet.create({
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
  });
