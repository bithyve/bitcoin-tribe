import { View } from 'react-native';
import React, { useContext } from 'react';
import { wp } from 'src/constants/responsive';
import Buttons from './Buttons';
import ModalContainer from './ModalContainer';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
}

const CreateUtxosModal: React.FC<Props> = ({ visible, primaryOnPress }) => {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  return (
    <ModalContainer
      title={'Insufficient sats for RGB'}
      subTitle={
        'Your RGB wallet’s Bitcoin balance is low to create new UTXOs.\nYou need to transfer 9000 sats + transaction fee from the main Wallet.'
      }
      visible={visible}
      onDismiss={() => navigation.goBack()}>
      <View>
        <View>
          <Buttons
            primaryTitle={common.proceed}
            primaryOnPress={primaryOnPress}
            secondaryTitle={common.cancel}
            secondaryOnPress={() => navigation.goBack()}
            width={wp(120)}
          />
        </View>
      </View>
    </ModalContainer>
  );
};

export default CreateUtxosModal;
