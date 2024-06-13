import * as React from 'react';
import { StyleSheet, View,Image,ScrollView } from 'react-native';

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
import ShowQRCode from 'src/components/ShowQRCode';

function ReceiveScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Toast('Address Copied Successfully!', true);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Receive"
          subTitle="Scan QR Lorem ipsum dolor sit amet,"
          enableBack={true}
        />
        <ShowQRCode 
          icon={require('../../assets/images/icon_qr_code.png')}
          title={"Invoice Address"}
        />
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
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    advanceOptionStyle: {
      flex: 1,
      marginHorizontal: hp(2),
      backgroundColor: 'none',
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
