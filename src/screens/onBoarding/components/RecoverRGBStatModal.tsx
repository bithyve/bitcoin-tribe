import { View } from 'react-native';
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';

import { wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import ModalContainer from 'src/components/ModalContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  secondaryOnPress: () => void;
}

const RecoverRGBStatModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  secondaryOnPress,
}) => {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  return (
    <ModalContainer
      title={'Would you like to recover your RGB stats from the cloud?'}
      visible={visible}
      onDismiss={() => navigation.goBack()}>
      <View>
        <View>
          <Buttons
            primaryTitle={common.yes}
            primaryOnPress={primaryOnPress}
            secondaryTitle={common.no}
            secondaryOnPress={secondaryOnPress}
            width={wp(120)}
          />
        </View>
      </View>
    </ModalContainer>
  );
};

export default RecoverRGBStatModal;