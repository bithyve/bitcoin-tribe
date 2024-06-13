import * as React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import Toast from 'src/components/Toast';
import { TouchableRipple, useTheme } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';
import CardBox from 'src/components/CardBox';
import IconCopy from 'src/assets/images/icon_copy.svg';
import FooterNote from 'src/components/FooterNote';
import Clipboard from '@react-native-clipboard/clipboard';

function ReceiveScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Toast('Address Copied Successfully!', true);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Receive"
        subTitle="Scan QR Lorem ipsum dolor sit amet,"
        enableBack={true}
      />
      <View style={styles.qrViewWrapper}>
        <View style={styles.qrImageWrapper}>
          <Image
            source={require('../../assets/images/icon_qr_code.png')}
            style={styles.qrImageContainer}
          />
        </View>
        <Text style={styles.qrFooterText}>Invoice Address</Text>
      </View>
      <View style={styles.cardWrapper}>
        <CardBox>
          <View>
            <View style={styles.detailsWrapper}>
              <View style={styles.contentWrapper}>
                <Text
                  style={[styles.menuCardTitle, CommonStyles.body1]}
                  numberOfLines={1}>
                  iklhj-safas-435fs453df-897897dfs-87875656
                </Text>
              </View>
              <TouchableRipple
                onPress={() =>
                  handleCopyText('iklhj-safas-435fs453df-897897dfs-87875656')
                }
                style={styles.iconWrapper}>
                <IconCopy />
              </TouchableRipple>
            </View>
          </View>
        </CardBox>
      </View>

      <OptionCard
        style={styles.optionCardWrapper}
        title="Add amount"
        subTitle="Lorem ipsum dolor sit amet, consec"
        onPress={() => {}}
      />
      <FooterNote
        title="Note"
        subTitle="The blinded UTXO in this invoice will expire in 24 hours after its creation."
        customStyle={styles.advanceOptionStyle}
      />
    </ScreenContainer>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    advanceOptionStyle: {
      flex: 1,
      position: 'absolute',
      bottom: 10,
      margin: hp(20),
      backgroundColor: 'none',
    },
    qrViewWrapper: {
      backgroundColor: theme.colors.cardBackground,
      alignItems: 'center',
      marginHorizontal: '25%',
      marginTop: wp(55),
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      width: 200,
    },
    qrImageContainer: { width: 200, height: 180 },
    qrImageWrapper: {
      width: 200,
      height: 180,
      backgroundColor: '#fff',
    },
    qrFooterText: {
      textAlign: 'center',
      color: '#FFBA00',
      fontSize: CommonStyles.body2.fontSize,
      paddingVertical: 4,
    },
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
    cardWrapper: {
      marginTop: wp(8),
    },
    optionCardWrapper: {
      marginTop: wp(30),
    },
  });
export default ReceiveScreen;
