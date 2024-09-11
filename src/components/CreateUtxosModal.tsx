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
  const { common, assets } = translations;
  const navigation = useNavigation();
  return (
    <ModalContainer
      title={assets.insufficientSatsRGB}
      subTitle={assets.insufficientSatsRGBSubTitle}
      visible={visible}
      enableCloseIcon={false}
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
