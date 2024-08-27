import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import * as bip39 from 'bip39';
import { TextInput as RNTextInput } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { getPlaceholderSuperScripted } from 'src/utils/placeholderUtils';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import Toast from 'src/components/Toast';
import RecoverRGBStatModal from './RecoverRGBStatModal';
import CommonStyles from 'src/common/styles/CommonStyles';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import PinMethod from 'src/models/enums/PinMethod';
import ModalLoading from 'src/components/ModalLoading';
import { decrypt, hash512 } from 'src/utils/encryption';
import config from 'src/utils/config';
import * as SecureStore from 'src/storage/secure-store';
import { AppContext } from 'src/contexts/AppContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type seedWordItem = {
  id: number;
  name: string;
  invalid: boolean;
};

function EnterSeedContainer() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const ref = useRef<FlatList>(null);
  const { setKey } = useContext(AppContext);
  const inputRef = useRef<RNTextInput[]>([]);
  const [seedData, setSeedData] = useState<seedWordItem[]>();
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [visible, setVisible] = useState(false);
  const [onChangeIndex, setOnChangeIndex] = useState(-1);
  const [activePage, setActivePage] = useState(0);
  const { isLoading, mutate, status } = useMutation(ApiHandler.setupNewApp);
  const restoreFromCloudMutation = useMutation(ApiHandler.restoreRgbFromCloud);

  useEffect(() => {
    if (restoreFromCloudMutation.isSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 400);
    }
  }, [restoreFromCloudMutation.isSuccess]);

  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => {
        setVisible(true);
      }, 400);
    }
  }, [status]);

  const generateSeedWordsArray = useCallback(() => {
    const seedArray = [];
    for (let i = 1; i <= 12; i++) {
      seedArray.push({
        id: i,
        name: '',
        invalid: true,
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
    // if (
    //   activePage === 3
    //     ? index >= 18 && index < 24
    //     : activePage === 2
    //     ? index >= 12 && index < 18
    //     : activePage === 1
    //     ? index >= 6 && index < 12
    //     : index < 6
    // ) {
    return (
      <View removeClippedSubviews style={styles.inputListWrapper}>
        <TextInput
          ref={ref => {
            if (ref) {
              inputRef.current[index] = ref as unknown as RNTextInput;
            }
          }}
          mode="outlined"
          outlineColor={theme.colors.inputBackground}
          activeOutlineColor={theme.colors.accent1}
          contextMenuHidden
          outlineStyle={styles.outlineStyle}
          style={styles.input}
          underlineStyle={styles.underlineStyle}
          contentStyle={[CommonStyles.textFieldLabel, styles.textStyles]}
          placeholder={`Enter ${getPlaceholderSuperScripted(index)} word`}
          value={item?.name}
          returnKeyType={isSeedFilled(12) ? 'done' : 'next'}
          autoCapitalize="none"
          //             blurOnSubmit={false}
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
          //             testID={`input_seedWord${getPlaceholder(index)}`}
        />
      </View>
    );
    // } else {
    //   return null;
    // }
  };
  const onPressHandleNext = async () => {
    if (activePage === 0) {
      if (isSeedFilled(6)) {
        setActivePage(1);
      } else {
        Toast('error', false, true);
      }
    }
    if (activePage === 1) {
      if (isSeedFilled(12)) {
        //setVisible(true);
        let seedWord = '';
        for (let i = 0; i < seedData.length; i++) {
          seedWord += `${seedData[i].name} `;
        }
        const mnemonic = seedWord.trim();
        if (bip39.validateMnemonic(mnemonic)) {
          mutate({
            appName: '',
            walletImage: '',
            passcode: '',
            pinMethod: PinMethod.DEFAULT,
            mnemonic,
          });
        } else {
          Toast('Invalid Mnemonic', false, true);
        }
      } else {
        Toast('error', false, true);
      }
    }
  };

  const onSuccess = async () => {
    const hash = hash512(config.ENC_KEY_STORAGE_IDENTIFIER);
    const key = decrypt(hash, await SecureStore.fetch(hash));
    setKey(key);
    navigation.replace(NavigationRoutes.APPSTACK);
  };

  return (
    <View style={{ flex: 1 }}>
      <ModalLoading visible={isLoading || restoreFromCloudMutation.isLoading} />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={150}
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
                <AppText variant="body2">{word}</AppText>
              </AppTouchable>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <Buttons
        primaryOnPress={onPressHandleNext}
        primaryTitle={common.next}
        secondaryTitle={common.needHelp}
        secondaryCTAWidth={hp(160)}
        secondaryOnPress={() => {
          console.log('');
        }}
      />
      <RecoverRGBStatModal
        visible={visible}
        primaryOnPress={() => restoreFromCloudMutation.mutate()}
        secondaryOnPress={onSuccess}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
      // height: '67%',
      // flexDirection: 'row',
      // flexWrap: 'wrap',
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
    },
    underlineStyle: {
      backgroundColor: 'transparent',
    },
  });

export default EnterSeedContainer;
