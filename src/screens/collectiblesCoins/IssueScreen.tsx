import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import { Keyboard, StyleSheet, View } from 'react-native';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import CreateUtxosModal from 'src/components/CreateUtxosModal';

function IssueScreen() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { home, common, assets } = translations;
  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const createUtxos = useMutation(ApiHandler.createUtxos);
  const [loading, setLoading] = useState(false);

  const issueCoin = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    const response = await ApiHandler.issueNewCoin({
      name: assetName.trim(),
      ticker: assetTicker,
      supply: totalSupplyAmt,
    });
    setLoading(false);
    if (response?.assetId) {
      Toast(assets.assetCreateMsg);
      navigation.goBack();
    } else if (response?.error === 'Insufficient sats for RGB') {
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    } else if (response?.error) {
      Toast(`Failed: ${response?.error}`);
    }
  }, [assetName, assetTicker, navigation, totalSupplyAmt]);

  useEffect(() => {
    if (createUtxos.error) {
      Toast(assets.insufficientSats);
    } else if (createUtxos.isSuccess) {
      setShowErrorModal(false);
      issueCoin();
    }
  }, [createUtxos.error, createUtxos.isSuccess, createUtxos.data, issueCoin]);

  const isButtonDisabled = useMemo(() => {
    return !assetName || !assetTicker || !totalSupplyAmt;
  }, [assetName, assetTicker, totalSupplyAmt]);

  const handleAmtChangeText = text => {
    const positiveNumberRegex = /^\d*[1-9]\d*$/;
    if (positiveNumberRegex.test(text)) {
      setTotalSupplyAmt(text);
    } else {
      setTotalSupplyAmt('');
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={home.issue} subTitle={home.issueSubTitle} />
      <ModalLoading visible={loading || createUtxos.isLoading} />
      <CreateUtxosModal
        visible={showErrorModal}
        primaryOnPress={() => {
          setShowErrorModal(false);
          createUtxos.mutate();
        }}
      />
      <TextField
        value={assetName}
        onChangeText={text => setAssetName(text)}
        placeholder={home.assetName}
        maxLength={32}
        style={styles.input}
        autoCapitalize="words"
      />

      <TextField
        value={assetTicker}
        onChangeText={text => setAssetTicker(text.trim().toUpperCase())}
        placeholder={home.assetTicker}
        maxLength={8}
        style={styles.input}
        autoCapitalize="characters"
      />

      <TextField
        value={totalSupplyAmt}
        onChangeText={handleAmtChangeText}
        placeholder={home.totalSupplyAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={issueCoin}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => navigation.goBack()}
          disabled={isButtonDisabled}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(10),
    },
    buttonWrapper: {
      marginTop: hp(20),
    },
  });
export default IssueScreen;
