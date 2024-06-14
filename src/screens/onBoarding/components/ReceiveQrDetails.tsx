import React from 'react';

import { StyleSheet, View } from 'react-native';
import CardBox from 'src/components/CardBox';
import ShowQRCode from 'src/components/ShowQRCode';
import OptionCard from './OptionCard';
import { wp } from 'src/constants/responsive';
import IconCopy from 'src/assets/images/icon_copy.svg';
import ReceiveQrClipBoard from './ReceiveQrClipBoard';

const ReceiveQrDetails = () => {
  return (
    <>
      <ShowQRCode
        icon={require('../../../assets/images/icon_qr_code.png')}
        title={'Invoice Address'}
      />

      <View style={styles.cardWrapper}>
        <CardBox>
          <ReceiveQrClipBoard
            qrCodeValue={'iklhj-safas-435fs453df-897897dfs-87875656'}
            icon={<IconCopy />}
          />
        </CardBox>
      </View>

      <OptionCard
        style={styles.optionCardWrapper}
        title="Add amount"
        subTitle="Lorem ipsum dolor sit amet, consec"
        onPress={() => {}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginTop: wp(8),
  },
  optionCardWrapper: {
    marginTop: wp(30),
  },
});

export default ReceiveQrDetails;
