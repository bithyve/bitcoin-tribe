import React, { useContext} from 'react';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SelectOption from 'src/components/SelectOption';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import config from 'src/utils/config';

export const CollectionVerificationScreen = ({navigation}) => {
  const { assets } = useContext(LocalizationContext).translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  const verifyXNavigation = () => {
    navigation.navigate(
      CommonActions.navigate(NavigationRoutes.VERIFYX, {
        assetId: 'assetId',
        schema: 'schema',
        savedTwitterHandle: '',
      }),
    );
  };

    const handleVerifyWithDomain = () => {
      navigation.navigate(NavigationRoutes.REGISTERDOMAIN, {
        assetId: "assetId",
        schema: "schema",
        savedDomainName: '',
      });
    };

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.collectionVerificationTitle}
        subTitle={assets.collectionVerificationSubTitle}
      />
      <View style={styles.container}>
        <SelectOption
          title={assets.viewInRegistry}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate(NavigationRoutes.WEBVIEWSCREEN, {
                url: `${config.REGISTRY_URL}`,
                title: 'Registry',
              }),
            )
          }
        />
        <SelectOption
          title={assets.connectVerifyTwitter}
          onPress={verifyXNavigation}
        />
        <SelectOption
          title={assets.verifyDomain}
          onPress={handleVerifyWithDomain}
        />
        <SelectOption
          title={assets.sharePostTitle}
          onPress={() => {
          }}
        />
      </View>
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
