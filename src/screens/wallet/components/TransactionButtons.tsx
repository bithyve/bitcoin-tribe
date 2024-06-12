import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import RoundedCTA from 'src/components/RoundedCTA';
import IconSend from 'src/assets/images/icon_send.svg';
import IconReceive from 'src/assets/images/icon_recieve.svg';
import IconBuy from 'src/assets/images/icon_buy.svg';
import { wp } from 'src/constants/responsive';
type transButtonProps = {
  onPressSend: () => void;
  onPressRecieve: () => void;
  onPressBuy: () => void;
};
const TransactionButtons = (props: transButtonProps) => {
  const { onPressSend, onPressRecieve, onPressBuy } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          icon={<IconSend />}
          buttonColor={theme.colors.primaryCTA}
          title={'Send'}
          width={wp(80)}
          onPress={onPressSend}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          icon={<IconReceive />}
          buttonColor={theme.colors.accent2}
          title={'Recieve'}
          width={wp(90)}
          onPress={onPressRecieve}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <RoundedCTA
          icon={<IconBuy />}
          buttonColor={theme.colors.accent1}
          title={'Buy'}
          width={wp(60)}
          onPress={onPressBuy}
        />
      </View>
    </View>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonWrapper: {
      marginHorizontal: wp(5),
    },
  });
export default TransactionButtons;
