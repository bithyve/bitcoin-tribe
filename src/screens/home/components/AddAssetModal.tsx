import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

function AddAssetModal() {
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View>
      <SelectOption
        title={home.issueNew}
        icon={<AddNewIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
      />
      <SelectOption
        title={common.receive}
        icon={<ReceiveIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
      />
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    optionStyle: {
      marginVertical: 10,
      paddingHorizontal: 15,
    },
  });
export default AddAssetModal;
