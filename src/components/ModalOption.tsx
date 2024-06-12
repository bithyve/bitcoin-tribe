import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import AppText from './AppText';
import AppTouchable from './AppTouchable';

type ModalOptionProps = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
};
const ModalOption = (props: ModalOptionProps) => {
  const theme = useTheme();
  const { icon, title, onPress } = props;
  const styles = getStyles(theme);
  return (
    <AppTouchable onPress={onPress} style={styles.touchableWrapper}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          {icon}
          <AppText
            variant="body1"
            testID="text_modalOptionTitle"
            style={styles.titleStyle}>
            {title}
          </AppText>
        </View>
        <View>
          <IconArrow />
        </View>
      </View>
    </AppTouchable>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
    },
    touchableWrapper: {
      borderRadius: 10,
      marginVertical: 10,
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleStyle: {
      color: theme.colors.bodyColor,
      marginLeft: 10,
    },
  });
export default ModalOption;
