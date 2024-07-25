import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import RoundedCTA from 'src/components/RoundedCTA';
import IconSend from 'src/assets/images/icon_send.svg';
import IconReceive from 'src/assets/images/icon_recieve.svg';
import IconBuy from 'src/assets/images/icon_buy.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
type transButtonProps = {
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy?: () => void;
};
const TransactionButtons = (props: transButtonProps) => {
  const { onPressSend, onPressRecieve, onPressBuy } = props;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          icon={<IconSend />}
          buttonColor={theme.colors.primaryCTA}
          title={common.send}
          width={wp(85)}
          onPress={onPressSend}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          icon={<IconReceive />}
          buttonColor={theme.colors.accent2}
          title={common.recieve}
          width={wp(100)}
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
