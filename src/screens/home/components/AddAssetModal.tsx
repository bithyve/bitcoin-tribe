import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import SelectOption from 'src/components/SelectOption';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';

function AddAssetModal({ onDismiss }) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <SelectOption
        title={home.issueNew}
        icon={<AddNewIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => {
          onDismiss();
          navigation.navigate(NavigationRoutes.ISSUESCREEN);
        }}
        testID="issue_new"
      />
      <SelectOption
        title={common.receive}
        icon={<ReceiveIcon />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => {
          onDismiss();
          navigation.navigate(NavigationRoutes.RECEIVEASSET);
        }}
        testID="receive"
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: hp(25),
      paddingBottom: hp(40),
    },
    optionStyle: {
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: windowHeight > 650 ? 25 : 20,
    },
  });
export default AddAssetModal;
