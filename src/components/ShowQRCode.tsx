import React from 'react'
import { StyleSheet,View,Image,Text } from 'react-native'
import { useTheme } from 'react-native-paper'
import CommonStyles from 'src/common/styles/CommonStyles'
import { wp } from 'src/constants/responsive'

type ShowQRCodeProps = {
    icon: any;
    title: string;
};

const ShowQRCode = (props:ShowQRCodeProps) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { icon, title} = props;
  return (
    <View style={styles.qrViewWrapper}>
        <View style={styles.qrImageWrapper}>
           <Image source={icon} style={styles.qrImageContainer} />
        </View>
        <Text style={styles.qrFooterText}>{title}</Text>
    </View>
  )
}

const getStyles = theme =>StyleSheet.create({
    qrViewWrapper: {
        alignSelf:'center',
        backgroundColor: theme.colors.cardBackground,
        alignItems: 'center',
        marginTop:wp(55),
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: 200,
      },
      qrImageContainer:{
         width: 200,
         height: 180
      },
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
})

export default ShowQRCode