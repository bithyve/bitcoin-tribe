import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import CommonStyles from 'src/common/styles/CommonStyles';
import { windowWidth, wp } from 'src/constants/responsive';

type ShowQRCodeProps = {
  value: string;
  title: string;
};

const ShowQRCode = (props: ShowQRCodeProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { value, title } = props;
  const qrSize = (windowWidth * 50) / 100;
  return (
    <View style={styles.qrViewWrapper}>
      <View style={styles.qrImageWrapper}>
        <QRCode value={value} size={qrSize} />
      </View>
      <Text style={styles.qrFooterText}>{title}</Text>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    qrViewWrapper: {
      alignSelf: 'center',
      backgroundColor: theme.colors.cardBackground,
      alignItems: 'center',
      marginTop: wp(35),
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      width: (windowWidth * 50) / 100,
    },
    qrImageWrapper: {
      width: (windowWidth * 50) / 100,
      height: (windowWidth * 50) / 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrFooterText: {
      textAlign: 'center',
      color: theme.colors.accent1,
      fontSize: CommonStyles.body2.fontSize,
      paddingVertical: wp(5),
      fontFamily: '',
    },
  });

export default ShowQRCode;
