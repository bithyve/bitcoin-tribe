import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import RoundedCTA from 'src/components/RoundedCTA';
import IconSend from 'src/assets/images/icon_send.svg';
import IconSendLight from 'src/assets/images/icon_send_light.svg';
import IconReceive from 'src/assets/images/icon_recieve.svg';
import IconReceiveLight from 'src/assets/images/icon_recieve_light.svg';
import IconBuy from 'src/assets/images/icon_buy.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';

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
            theme.colors.roundSendCTAGradient1,
            theme.colors.roundSendCTAGradient2,
            theme.colors.roundSendCTAGradient3,
          ]}
          textColor={theme.colors.roundSendCTATitle}
          icon={!isThemeDark ? <IconSend /> : <IconSendLight />}
          buttonColor={theme.colors.sendCtaBorderColor}
          title={common.send}
          width={wp(110)}
          onPress={onPressSend}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          colors={[
            theme.colors.roundReceiveCTAGradient1,
            theme.colors.roundReceiveCTAGradient2,
            theme.colors.roundReceiveCTAGradient3,
          ]}
          textColor={theme.colors.roundReceiveCTATitle}
          icon={!isThemeDark ? <IconReceive /> : <IconReceiveLight />}
          buttonColor={theme.colors.recieveCtaBorderColor}
          title={common.receive}
          width={wp(110)}
          onPress={onPressRecieve}
        />
      </View>
      {onPressBuy && (
        <View style={styles.buttonWrapper}>
          <RoundedCTA
            icon={<IconBuy />}
            buttonColor={theme.colors.accent1}
            title={common.buy}
            width={wp(70)}
            onPress={onPressBuy}
          />
        </View>
      )}
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
