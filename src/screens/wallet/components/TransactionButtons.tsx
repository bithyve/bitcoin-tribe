import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import RoundedCTA from 'src/components/RoundedCTA';
import IconSend from 'src/assets/images/icon_send.svg';
import IconSendLight from 'src/assets/images/icon_send_light.svg';
import IconReceive from 'src/assets/images/icon_recieve.svg';
import IconReceiveLight from 'src/assets/images/icon_recieve_light.svg';
import IconBuy from 'src/assets/images/buyIcon.svg';
import IconBuyLight from 'src/assets/images/buyIcon_light.svg';
import IconRequest from 'src/assets/images/satsRequestIcon.svg';
import IconRequestLight from 'src/assets/images/satsRequestIcon_light.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { NetworkType } from 'src/services/wallets/enums';
import config from 'src/utils/config';

type transButtonProps = {
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
};
const TransactionButtons = (props: transButtonProps) => {
  const { onPressSend, onPressRecieve, onPressBuy } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          colors={[
            theme.colors.inputBackground,
            theme.colors.inputBackground,
            theme.colors.inputBackground,
          ]}
          textColor={theme.colors.roundSendCTATitle}
          icon={isThemeDark ? <IconSend /> : <IconSendLight />}
          buttonColor={theme.colors.sendCtaBorderColor}
          title={common.send}
          width={wp(105)}
          onPress={onPressSend}
        />
      </View>
      {onPressBuy && (
        <View style={styles.buttonWrapper}>
          <RoundedCTA
            colors={[
              theme.colors.inputBackground,
              theme.colors.inputBackground,
              theme.colors.inputBackground,
            ]}
            icon={
              config.NETWORK_TYPE === NetworkType.TESTNET ||
              config.NETWORK_TYPE === NetworkType.REGTEST ? (
                isThemeDark ? (
                  <IconRequest />
                ) : (
                  <IconRequestLight />
                )
              ) : isThemeDark ? (
                <IconBuy />
              ) : (
                <IconBuyLight />
              )
            }
            textColor={theme.colors.roundBuyCTATitle}
            buttonColor={theme.colors.buyCtaBorderColor}
            title={
              config.NETWORK_TYPE === NetworkType.TESTNET ||
              config.NETWORK_TYPE === NetworkType.REGTEST
                ? common.request
                : common.buy
            }
            width={wp(105)}
            onPress={onPressBuy}
          />
        </View>
      )}
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          colors={[
            theme.colors.inputBackground,
            theme.colors.inputBackground,
            theme.colors.inputBackground,
          ]}
          textColor={theme.colors.roundReceiveCTATitle}
          icon={isThemeDark ? <IconReceive /> : <IconReceiveLight />}
          buttonColor={theme.colors.recieveCtaBorderColor}
          title={common.receive}
          width={wp(105)}
          onPress={onPressRecieve}
        />
      </View>
    </View>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonWrapper: {
      marginHorizontal: wp(5),
      paddingBottom: windowHeight < 650 ? hp(15) : 0,
    },
  });
export default TransactionButtons;
