import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OpenRgbChannel = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, node } = translations;
  const [pubkeyAddress, setPubkeyAddress] = useState('');
  const [capacity, setCapacity] = useState('4000000');
  const [pushMsats, setPushMsats] = useState('400000');
  const [assetId, setAssetId] = useState('');
  const [assetAmt, setAssetAmt] = useState('');
  const [baseFeeRate, setBaseFeeRate] = useState('1');
  const [tmpChannelId, setTmpChannelId] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [inputAssetIDHeight, setInputAssetIDHeight] = useState(50);
  const openChannelMutation = useMutation(ApiHandler.openChannel);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, inputHeight, inputAssetIDHeight);

  useEffect(() => {
    if (openChannelMutation.isSuccess) {
      navigation.goBack();
    } else if (openChannelMutation.isError) {
      Toast(`${openChannelMutation.error}`, true);
    }
  }, [openChannelMutation.isError, openChannelMutation.isSuccess]);

  return (
    <ScreenContainer>
      <AppHeader title={node.openChannelTitle} />
      <ModalLoading visible={openChannelMutation.isLoading} />
      <KeyboardAwareScrollView>
        <TextField
          value={pubkeyAddress}
          onChangeText={text => {
            const trimmedText = text.trim();
            setPubkeyAddress(trimmedText);
          }}
          placeholder={node.peerPubAndAddress}
          style={[styles.input, pubkeyAddress && styles.multilinePubKeyInput]}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height);
          }}
          keyboardType={'default'}
          returnKeyType={'Enter'}
          multiline={true}
          numberOfLines={2}
        />

        <AppText variant="caption" style={styles.textHint}>
          {node.peerPubAndAddressNote}
        </AppText>

        <TextField
          value={capacity}
          onChangeText={text => setCapacity(text)}
          placeholder={node.capacity}
          style={styles.input}
          keyboardType="numeric"
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.capacityNote}
        </AppText>

        <TextField
          value={pushMsats}
          onChangeText={text => setPushMsats(text)}
          placeholder={node.pushMsats}
          style={styles.input}
          keyboardType="numeric"
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.pushMsatsNote}
        </AppText>
        <TextField
          value={assetId}
          onChangeText={text => {
            const trimmedText = text.trim();
            setAssetId(trimmedText);
          }}
          placeholder={node.assetID}
          style={[styles.input, assetId && styles.multilineAssetIDInput]}
          onContentSizeChange={event => {
            setInputAssetIDHeight(event.nativeEvent.contentSize.height);
          }}
          keyboardType={'default'}
          returnKeyType={'Enter'}
          multiline={true}
          numberOfLines={2}
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.assetIDNote}
        </AppText>
        <TextField
          value={assetAmt}
          onChangeText={text => setAssetAmt(text)}
          placeholder={node.assetAmount}
          style={styles.input}
          keyboardType="numeric"
        />
        <AppText variant="caption" style={styles.textHint}>
          {node.assetAmountNote}
        </AppText>
        {/* <TextField
        value={baseFeeRate}
        onChangeText={text => setBaseFeeRate(text)}
        placeholder={'Base Fee Rate'}
        style={styles.input}
        keyboardType="numeric"
      /> */}

        {/* <TextField
        value={tmpChannelId}
        onChangeText={text => setTmpChannelId(text)}
        placeholder={'Temporary Channel ID'}
        style={styles.input}
      /> */}

        <View style={styles.buttonWrapper}>
          <Buttons
            primaryTitle={common.proceed}
            primaryOnPress={() => {
              openChannelMutation.mutate({
                peerPubkeyAndOptAddr: pubkeyAddress,
                capacitySat: Number(capacity),
                pushMsat: Number(pushMsats),
                assetId: assetId,
                assetAmount: Number(assetAmt),
                feeBaseMsat: Number(baseFeeRate),
                isPublic: true,
                feeProportionalMillionths: 0,
                temporaryChannelId: tmpChannelId,
                withAnchors: true,
              });
            }}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => navigation.goBack()}
            disabled={false}
            width={wp(120)}
            primaryLoading={false}
          />
        </View>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default OpenRgbChannel;

const getStyles = (theme: AppTheme, inputHeight, inputAssetIDHeight) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    multilinePubKeyInput: {
      borderRadius: hp(20),
      height: Math.max(50, inputHeight),
    },
    multilineAssetIDInput: {
      borderRadius: hp(20),
      height: Math.max(50, inputAssetIDHeight),
    },

    buttonWrapper: {
      marginTop: hp(20),
    },
    textHint: {
      marginTop: hp(5),
      marginBottom: hp(20),
      marginHorizontal: wp(20),
      color: theme.colors.secondaryHeadingColor,
    },
  });
