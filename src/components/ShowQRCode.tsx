import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
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
        <QRCode value={value} size={wp(180)} />
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
      width: Platform.OS === 'ios' ? wp(190) : wp(180),
    },
    qrImageWrapper: {
      width: Platform.OS === 'ios' ? wp(190) : wp(180),
      height: wp(180),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.headingColor,
    },
    qrFooterText: {
      textAlign: 'center',
      color: theme.colors.accent1,
      fontSize: CommonStyles.body2.fontSize,
      paddingVertical: 4,
    },
  });

export default ShowQRCode;
