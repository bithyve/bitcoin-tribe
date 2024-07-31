import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// import AddNewIcon from 'src/assets/images/icon_addnew.svg';
// import ReceiveIcon from 'src/assets/images/icon_recievedtxn.svg';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';

function AddAsset() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <ScreenContainer>
      <AppHeader title={home.addAssets} subTitle={home.addAssetSubTitle} />
      <View style={styles.container}>
        <SelectOption
          title={home.issueNew}
          // icon={<AddNewIcon />}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            navigation.navigate(NavigationRoutes.ISSUESCREEN);
          }}
          testID="issue_new"
        />
        <SelectOption
          title={common.receive}
          // icon={<ReceiveIcon />}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            navigation.navigate(NavigationRoutes.RECEIVEASSET);
          }}
          testID="receive"
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: hp(25),
    },
    optionStyle: {
      marginVertical: hp(10),
      paddingHorizontal: 20,
      paddingVertical: windowHeight > 650 ? 25 : 20,
    },
  });
export default AddAsset;
