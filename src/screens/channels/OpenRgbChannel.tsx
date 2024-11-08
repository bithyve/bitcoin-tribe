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

const OpenRgbChannel = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [pubkeyAddress, setPubkeyAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pushMsats, setPushMsats] = useState('');
  const [assetId, setAssetId] = useState('');
  const [assetAmt, setAssetAmt] = useState('');
  const [baseFeeRate, setBaseFeeRate] = useState('');
  const [tmpChannelId, setTmpChannelId] = useState('');
  const openChannelMutation = useMutation(ApiHandler.openChannel);

  useEffect(() => {
    if (openChannelMutation.isSuccess) {
      navigation.goBack();
    } else if (openChannelMutation.isError) {
      Toast(`${openChannelMutation.error}`, true);
    }
  }, [openChannelMutation.isError, openChannelMutation.isSuccess]);

  return (
    <ScreenContainer>
      <AppHeader title={'Open Channel'} />

      <ModalLoading visible={openChannelMutation.isLoading} />

      <TextField
        value={pubkeyAddress}
        onChangeText={text => setPubkeyAddress(text)}
        placeholder={'Peer Pubkey and Address'}
        style={styles.input}
      />

      <TextField
        value={capacity}
        onChangeText={text => setCapacity(text)}
        placeholder={'Capacity'}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextField
        value={pushMsats}
        onChangeText={text => setPushMsats(text)}
        placeholder={'Push msats'}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextField
        value={assetId}
        onChangeText={text => setAssetId(text)}
        placeholder={'Asset ID'}
        style={styles.input}
      />

      <TextField
        value={assetAmt}
        onChangeText={text => setAssetAmt(text)}
        placeholder={'Asset Amount'}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextField
        value={baseFeeRate}
        onChangeText={text => setBaseFeeRate(text)}
        placeholder={'Base Fee Rate'}
        style={styles.input}
        keyboardType="numeric"
      />

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
    </ScreenContainer>
  );
};

export default OpenRgbChannel;

const styles = StyleSheet.create({
  input: {
    marginVertical: hp(5),
  },
  buttonWrapper: {
    marginTop: hp(20),
  },
});
