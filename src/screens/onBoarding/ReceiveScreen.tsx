import * as React from 'react';
import { StyleSheet, View,Image } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import Toast from 'src/components/Toast';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';
import CommonCardBox from 'src/components/CommonCardBox';
import IconCopy from 'src/assets/images/icon_copy.svg';
import FooterNoteCard from 'src/components/FooterNoteCard';
import Clipboard from '@react-native-clipboard/clipboard';

function ReceiveScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Toast('Address Copied Successfully!', true);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Receive"
        subTitle="Scan QR Lorem ipsum dolor sit amet,"
        navigation={navigation}
      />
      <View style={styles.qrViewWrapper}>
        <View style={styles.qrImageWrapper}>
          <Image
           source={require('../../assets/images/icon_qr_code.png')}
           style={styles.qrImageContainer} />
        </View>
        <Text style={styles.qrFooterText}>Invoice Address</Text>
      </View>
      <View style={{marginTop:wp(8)}}>
        <CommonCardBox>
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
                  rippleColor={"gray"}
                  onPress={() =>
                    handleCopyText('iklhj-safas-435fs453df-897897dfs-87875656')
                  } 
                  style={styles.iconWrapper}>
                <IconCopy/>
              </TouchableRipple>
            </View>
          </View>
        </CommonCardBox>
      </View>
          
      <OptionCard
        style={{marginTop:wp(30)}}
        title="Add amount"
        subTitle="Lorem ipsum dolor sit amet, consec"
        onPress={() => {}}
      />

      <FooterNoteCard
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
      marginTop:wp(55),
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      width: 200,
    },
    qrImageContainer:{width: 200, height: 180},
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
      height:wp(22),
      alignItems:'center',
      justifyContent: 'center',
    },
  });
export default ReceiveScreen;
