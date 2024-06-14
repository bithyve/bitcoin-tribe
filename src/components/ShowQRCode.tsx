import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import CommonStyles from 'src/common/styles/CommonStyles';
import { wp } from 'src/constants/responsive';

type ShowQRCodeProps = {
  value: string;
  title: string;
};

const ShowQRCode = (props: ShowQRCodeProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { value, title } = props;
  return (
    <View style={styles.qrViewWrapper}>
      <View style={styles.qrImageWrapper}>
        <QRCode value={value} size={wp(170)} />
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
      marginTop: wp(45),
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      width: 200,
    },
    qrImageContainer: {
      width: wp(200),
      height: wp(200),
    },
    qrImageWrapper: {
      width: wp(170),
      height: wp(170),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
    qrFooterText: {
      textAlign: 'center',
      color: '#FFBA00',
      fontSize: CommonStyles.body2.fontSize,
      paddingVertical: 4,
    },
  });

export default ShowQRCode;
