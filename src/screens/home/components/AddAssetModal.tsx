import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import SelectOption from 'src/components/SelectOption';
import { AppTheme } from 'src/theme';

function AddAssetModal() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View>
      <SelectOption
        title="Issue new"
        icon={<AddNewIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
      />
      <SelectOption
        title="Receive"
        icon={<ReceiveIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    optionStyle: {
      marginVertical: 10,
      paddingHorizontal: 15,
    },
  });
export default AddAssetModal;
