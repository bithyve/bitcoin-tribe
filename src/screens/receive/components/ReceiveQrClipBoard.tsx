import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';
import AppTouchable from 'src/components/AppTouchable';
import CardBox from 'src/components/CardBox';
import { wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

interface ReceiveQrClipBoardProps {
  qrCodeValue: string;
  icon: React.ReactNode;
}

const ReceiveQrClipBoard = ({ qrCodeValue, icon }: ReceiveQrClipBoardProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Toast('Address Copied Successfully!', true);
  };

  return (
    <CardBox>
      <View>
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <Text
              style={[styles.menuCardTitle, CommonStyles.body1]}
              numberOfLines={1}>
              {qrCodeValue}
            </Text>
          </View>
          <AppTouchable
            onPress={() => handleCopyText(qrCodeValue)}
            style={styles.iconWrapper}>
            {icon}
          </AppTouchable>
        </View>
      </View>
    </CardBox>
  );
};

export default ReceiveQrClipBoard;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
    },
    menuCardTitle: {
      color: theme.colors.bodyColor,
      width: '95%',
    },
    iconWrapper: {
      width: wp(28),
      height: wp(22),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
