import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import TransactionButtons from '../wallet/components/TransactionButtons';
import { Collectible } from 'src/models/interfaces/RGBWallet';
import Toolbar from './Toolbar';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type CollectibleDetailsHeaderProps = {
  collectible: Collectible;
  onPressSetting: () => void;
  onPressBuy?: () => void;
};

function CollectibleDetailsHeader(props: CollectibleDetailsHeaderProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { collectible, onPressSetting } = props;

  return (
    <View style={styles.container}>
      <Toolbar onPress={onPressSetting} ticker={collectible.name} />
      <Image
        source={{
          uri: `file://${collectible.media?.filePath}`,
        }}
        style={styles.imageStyle}
      />
      <View style={styles.balanceWrapper}>
        <AppText variant="walletBalance" style={styles.balanceText}>
          {numberWithCommas(collectible.balance.spendable)}
        </AppText>
      </View>
      <TransactionButtons
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SENDASSET, {
            assetId: collectible.assetId,
          })
        }
        // onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.navigate(NavigationRoutes.RECEIVEASSET)
        }
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      paddingBottom: 10,
    },
    usernameText: {
      color: theme.colors.accent3,
      textAlign: 'center',
      marginVertical: 10,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    imageStyle: {
      width: 90,
      height: 90,
      borderRadius: 10,
    },
  });
export default CollectibleDetailsHeader;