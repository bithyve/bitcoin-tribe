import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';
import AppTouchable from 'src/components/AppTouchable';
import CardBox from 'src/components/CardBox';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';

interface ReceiveQrClipBoardProps {
  qrCodeValue: string;
  message?: string;
}

const ReceiveQrClipBoard = ({
  qrCodeValue,
  message,
}: ReceiveQrClipBoardProps) => {
  const { translations } = React.useContext(LocalizationContext);
  const { common } = translations;

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(message || common.addressCopiedSuccessfully);
  };

  return (
    <View>
      <CardBox>
        <AppTouchable
          onPress={() => handleCopyText(qrCodeValue)}
          style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <Text style={[styles.menuCardTitle, CommonStyles.body1]}>
              {qrCodeValue}
            </Text>
          </View>
        </AppTouchable>
      </CardBox>
      <AppText variant="smallCTA" style={styles.tapToCopyText}>
        {common.tapToCopy}
      </AppText>
    </View>
  );
};

export default ReceiveQrClipBoard;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    detailsWrapper: {
      width: '100%',
    },
    contentWrapper: {
      width: '100%',
    },
    menuCardTitle: {
      color: theme.colors.headingColor,
      width: '100%',
    },
    tapToCopyText: {
      color: theme.colors.accent1,
      marginBottom: hp(3),
      textAlign: 'right',
    },
  });
