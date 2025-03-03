import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import * as bip39 from 'bip39';
import { TextInput as RNTextInput } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { hp, windowHeight, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { getPlaceholderSuperScripted } from 'src/utils/placeholderUtils';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import Toast from 'src/components/Toast';
import RecoverRGBStatModal from './RecoverRGBStatModal';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import { decrypt, hash512 } from 'src/utils/encryption';
import config from 'src/utils/config';
import * as SecureStore from 'src/storage/secure-store';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Fonts from 'src/constants/Fonts';
import AppType from 'src/models/enums/AppType';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import InProgessPopupContainer from 'src/components/InProgessPopupContainer';
import { Keys } from 'src/storage';

type seedWordItem = {
  id: number;
  name: string;
  invalid: boolean;
};

function EnterSeedContainer() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding } = translations;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const ref = useRef<FlatList>(null);
  const { setKey } = useContext(AppContext);
  const inputRef = useRef<RNTextInput[]>([]);
  const [seedData, setSeedData] = useState<seedWordItem[]>();
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visibleLoader, setVisibleLoader] = useState(false);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);
  const { mutateAsync, status, isLoading } = useMutation(ApiHandler.restoreApp);
  const setupNewAppMutation = useMutation(ApiHandler.setupNewApp);

  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => {
        onSuccess();
      }, 200);
    }
  }, [status]);

  useEffect(() => {
    if (setupNewAppMutation.isSuccess) {
      onSuccess();
    } else if (setupNewAppMutation.isError) {
      Toast(`${setupNewAppMutation.error}`, true);
    }
  }, [setupNewAppMutation.isError, setupNewAppMutation.isSuccess]);

  const generateSeedWordsArray = useCallback(() => {
    const seedArray = [];
    for (let i = 1; i <= 12; i++) {
      seedArray.push({
        id: i,
        name: '',
        invalid: false,
      });
    }
    return seedArray;
  }, []);

  useEffect(() => {
    setSeedData(generateSeedWordsArray());
  }, []);

  const getSuggestedWords = text => {
    const filteredData = bip39.wordlists.english.filter(data =>
      data.toLowerCase().startsWith(text),
    );
    setSuggestedWords(filteredData);
  };

  const isSeedFilled = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (seedData[i].invalid) {
        return false;
      }
    }
    return true;
  };
  const getPosition = (index: number) => {
    switch (index) {
      case 0:
      case 1:
        return 1;
      case 2:
      case 3:
        return 2;
      case 4:
      case 5:
        return 3;
      default:
        return 1;
    }
  };
  const seedItem = (item: seedWordItem, index: number) => {
    return (
      <View removeClippedSubviews style={styles.inputListWrapper}>
        <TextInput
          ref={ref => {
            if (ref) {
              inputRef.current[index] = ref as unknown as RNTextInput;
            }
          }}
          mode="outlined"
          outlineColor={
            item.invalid && item.name !== ''
              ? 'red'
              : theme.colors.inputBackground
          }
          activeOutlineColor={theme.colors.accent1}
          contextMenuHidden
          outlineStyle={styles.outlineStyle}
          style={[styles.input]}
          underlineStyle={styles.underlineStyle}
          contentStyle={[
            styles.textStyles,
            { fontFamily: item?.name ? Fonts.LufgaRegular : 'Arial' },
          ]}
          placeholder={`Enter ${getPlaceholderSuperScripted(index)} word`}
          value={item?.name}
          returnKeyType={isSeedFilled(12) ? 'done' : 'next'}
          autoCapitalize="none"
          keyboardType={'default'}
          onChangeText={text => {
            const data = [...seedData];
            data[index].name = text.trim();
            setSeedData(data);
            if (text.length > 1) {
              setOnChangeIndex(index);
              getSuggestedWords(text.toLowerCase());
            } else {
              setSuggestedWords([]);
            }
          }}
          onBlur={() => {
            if (!bip39.wordlists.english.includes(seedData[index].name)) {
              const data = [...seedData];
              data[index].invalid = true;
              setSeedData(data);
            }
          }}
          onFocus={() => {
            const data = [...seedData];
            data[index].invalid = false;
            setSeedData(data);
            setSuggestedWords([]);
            setOnChangeIndex(index);
          }}
          onSubmitEditing={() => {
            setSuggestedWords([]);
            Keyboard.dismiss();
          }}
        />
      </View>
    );
  };

  const onPressHandleNext = async () => {
    if (isSeedFilled(12)) {
      let seedWord = '';
      for (let i = 0; i < seedData.length; i++) {
        seedWord += `${seedData[i].name} `;
      }
      const mnemonic = seedWord.trim();
      if (bip39.validateMnemonic(mnemonic)) {
        try {
          await mutateAsync(mnemonic);
        } catch (error) {
          if (error instanceof Error && error.message === 'No backup found') {
            setVisibleLoader(false);
            navigation.navigate(NavigationRoutes.IMPORTRGBBACKUP, { mnemonic });
          } else {
            setVisibleLoader(false);
            Toast(`${error.message}`, true);
          }
        }
      } else {
        setVisibleLoader(false);
        Toast(onBoarding.invalidMnemonic, true);
      }
    } else {
      setVisibleLoader(false);
      Toast(onBoarding.enterRecoveryPhrase, true);
    }
  };

  const onSuccess = async () => {
    setVisibleLoader(false);
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    setKey(key);
    Toast(onBoarding.appRecoveryMsg);
    setTimeout(() => {
      navigation.replace(NavigationRoutes.APPSTACK);
    }, 400);
  };

  const createNewOnchainApp = () => {
    setVisibleLoader(true);
    let seedWord = '';
    for (let i = 0; i < seedData.length; i++) {
      seedWord += `${seedData[i].name} `;
    }
    const mnemonic = seedWord.trim();
    setTimeout(() => {
      setupNewAppMutation.mutate({
        appName: '',
        pinMethod: PinMethod.DEFAULT,
        passcode: '',
        walletImage: '',
        appType: AppType.ON_CHAIN,
        rgbNodeConnectParams: null,
        rgbNodeInfo: null,
        mnemonic,
      });
    }, 200);
  };

  return (
    <View style={styles.container}>
      <View>
        <ResponsePopupContainer
          visible={visibleLoader}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <InProgessPopupContainer
            title={onBoarding.recoverLoadingTitle}
            subTitle={onBoarding.recoverLoadingSubTitle}
            illustrationPath={
              isThemeDark
                ? require('src/assets/images/jsons/backupAndRecovery.json')
                : require('src/assets/images/jsons/backupAndRecovery_light.json')
            }
          />
        </ResponsePopupContainer>
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={windowHeight > 670 ? 200 : 150}
        keyboardOpeningTime={0}>
        <FlatList
          keyboardShouldPersistTaps="handled"
          ref={ref}
          keyExtractor={item => item.id}
          data={seedData}
          extraData={seedData}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.contentWrapper}
          pagingEnabled
          renderItem={({ item, index }) => seedItem(item, index)}
        />
      </KeyboardAwareScrollView>
      {suggestedWords?.length > 0 ? (
        <ScrollView
          style={[
            styles.suggestionScrollView,
            {
              marginTop: getPosition(onChangeIndex) * hp(60),
              height:
                onChangeIndex === 4 || onChangeIndex === 5 ? hp(90) : null,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          testID="view_suggestionView">
          <View style={styles.suggestionWrapper}>
            {suggestedWords.map((word, wordIndex) => (
              <AppTouchable
                testID={`btn_suggested_${word}`}
                key={word ? `${word + wordIndex}` : wordIndex}
                style={styles.suggestionTouchView}
                onPress={() => {
                  Keyboard.dismiss();
                  const data = [...seedData];
                  data[onChangeIndex].name = word.trim();
                  setSeedData(data);
                  setSuggestedWords([]);
                  if (onChangeIndex < 11) {
                    inputRef.current[onChangeIndex + 1].focus();
                  }
                }}>
                <AppText style={styles.suggestedWordStyle} variant="body2">
                  {word}
                </AppText>
              </AppTouchable>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <Buttons
        primaryOnPress={() => {
          setVisibleLoader(true);
          setTimeout(() => {
            onPressHandleNext();
          }, 500);
        }}
        width={'100%'}
        primaryTitle={common.next}
        primaryLoading={isLoading || setupNewAppMutation.isLoading}
      />
      <RecoverRGBStatModal
        visible={visible}
        primaryOnPress={() => {
          setVisible(false);
          setTimeout(() => {
            createNewOnchainApp();
          }, 400);
        }}
        secondaryOnPress={() => {
          setVisible(false);
        }}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: hp(20),
    },
    input: {
      borderRadius: 15,
      fontSize: 13,
      lineHeight: 25,
      letterSpacing: 0.39,
      height: hp(60),
      width: wp(165),
      // zIndex: 1,
      backgroundColor: theme.colors.inputBackground,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    outlineStyle: {
      borderRadius: 15,
    },
    inputListWrapper: {
      width: '50%',
    },
    contentWrapper: {
      gap: 10,
    },
    suggestionWrapper: {
      backgroundColor: theme.colors.cardBackground,
      flexDirection: 'row',
      padding: 15,
      borderRadius: 10,
      flexWrap: 'wrap',
      overflow: 'hidden',
      borderColor: theme.colors.borderColor,
      borderWidth: 2,
    },
    suggestionTouchView: {
      backgroundColor: theme.colors.accent1,
      padding: 5,
      borderRadius: 5,
      margin: 5,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    suggestionScrollView: {
      zIndex: 999,
      position: 'absolute',
      height: hp(150),
      width: '100%',
      alignSelf: 'center',
    },
    textStyles: {
      color: theme.colors.headingColor,
      fontSize: 16,
      fontWeight: '400',
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
    suggestedWordStyle: {
      color: theme.colors.suggestedText,
    },
  });

export default EnterSeedContainer;
