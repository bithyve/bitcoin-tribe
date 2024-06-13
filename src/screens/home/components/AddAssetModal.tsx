import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

function AddAssetModal() {
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <SelectOption
        title={home.issueNew}
        icon={<AddNewIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
        testID="issue_new"
      />
      <SelectOption
        title={common.receive}
        icon={<ReceiveIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
        testID="receive"
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
