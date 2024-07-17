import React, { useContext } from 'react';

import { StyleSheet, View } from 'react-native';
import ShowQRCode from 'src/components/ShowQRCode';
import OptionCard from 'src/components/OptionCard';
import { wp } from 'src/constants/responsive';
import IconCopy from 'src/assets/images/icon_copy.svg';
import ReceiveQrClipBoard from './ReceiveQrClipBoard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

type ReceiveQrDetailsProps = {
  addMountModalVisible: () => void;
  receivingAddress?: string;
};

const ReceiveQrDetails = ({
  addMountModalVisible,
  receivingAddress,
}: ReceiveQrDetailsProps) => {
  const { translations } = useContext(LocalizationContext);
  const { receciveScreen } = translations;

  return (
    <View style={styles.container}>
      <ShowQRCode
        value={receivingAddress}
        title={receciveScreen.bitcoinAddress}
      />

      <ReceiveQrClipBoard qrCodeValue={receivingAddress} icon={<IconCopy />} />
      <OptionCard
        title={receciveScreen.addAmountTitle}
        subTitle={receciveScreen.addAmountSubTitle}
        onPress={addMountModalVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: wp(20),
  },
});

export default ReceiveQrDetails;
