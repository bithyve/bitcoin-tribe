import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import ModalOption from 'src/components/ModalOption';

function AddAssetModal() {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View>
      <ModalOption
        title="Issue new"
        icon={<AddNewIcon />}
        onPress={() => console.log('press')}
      />
      <ModalOption
        title="Receive"
        icon={<ReceiveIcon />}
        onPress={() => console.log('press')}
      />
    </View>
  );
}
const getStyles = theme => StyleSheet.create({});
export default AddAssetModal;
