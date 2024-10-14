import React, { useContext } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { StyleSheet, View } from 'react-native';

import ShowQRCode from 'src/components/ShowQRCode';
import OptionCard from 'src/components/OptionCard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
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
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={styles.container}>
      <ShowQRCode
        value={receivingAddress}
        title={receciveScreen.bitcoinAddress}
      />

      <ReceiveQrClipBoard
        qrCodeValue={receivingAddress}
        icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
      />
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
  },
});

export default ReceiveQrDetails;
