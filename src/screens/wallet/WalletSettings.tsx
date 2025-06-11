import React, { useContext, useEffect } from 'react';
import { useMutation, UseMutationResult } from 'react-query';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import SelectOption from 'src/components/SelectOption';
import { RgbUnspent } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';

function WalletSettings() {
  const { translations } = useContext(LocalizationContext);
  const strings = translations.wallet;
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();

  const styles = getStyles(theme);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const { mutate: fetchUTXOs }: UseMutationResult<RgbUnspent[]> = useMutation(
    ApiHandler.viewUtxos,
  );

  useEffect(() => {
    fetchUTXOs();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader
        title={strings.xpubAndUtxoTitle}
        subTitle={strings.walletSettingSubTitle}
      />
      <View style={styles.container}>
        {app.appType === AppType.ON_CHAIN ? (
          <SelectOption
            title={strings.showXPub}
            // subTitle={strings.showXPubSubTitle}
            onPress={() =>
              navigation.dispatch(
                CommonActions.navigate(NavigationRoutes.SHOWXPUB),
              )
            }
          />
        ) : null}
        <SelectOption
          title={strings.viewUnspent}
          // subTitle={strings.viewUnspent}
          onPress={() => navigation.navigate(NavigationRoutes.VIEWUNSPENT)}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default WalletSettings;
