import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { windowWidth, wp } from 'src/constants/responsive';
import AppText from './AppText';
import Fonts from 'src/constants/Fonts';
import Colors from 'src/theme/Colors';

type ShowQRCodeProps = {
  value: string;
  title: string;
};

const ShowQRCode = (props: ShowQRCodeProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { value, title } = props;
  const qrSize = (windowWidth * 65) / 100;
  return (
    <>
      <View style={styles.qrViewWrapper}>
        <View style={styles.qrImageWrapper}>
          <QRCode value={value} size={qrSize} />
        </View>
      </View>
      <AppText variant="heading3" style={styles.qrFooterText}>
        {title}
      </AppText>
    </>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    qrViewWrapper: {
      alignSelf: 'center',
      backgroundColor: Colors.White,
      alignItems: 'center',
      justifyContent: 'center',
      // marginTop: wp(35),
      padding: 10,
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      height: (windowWidth * 70) / 100,
      width: (windowWidth * 70) / 100,
    },
    qrImageWrapper: {
      width: (windowWidth * 70) / 100,
      height: (windowWidth * 70) / 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrFooterText: {
      textAlign: 'center',
      color: theme.colors.accent1,
      paddingVertical: wp(10),
      fontFamily: Fonts.LufgaRegular,
    },
  });

export default ShowQRCode;
