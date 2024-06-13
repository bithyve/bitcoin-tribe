import React from 'react'
import { Linking, View} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { wp } from 'src/constants/responsive';

const QRScanner = () => {

  return (
    <View style={{
       marginTop:wp(65), 
       width:wp(300),height:wp(300),
       justifyContent:'center',alignSelf:'center'}}>
      <QRCodeScanner
          containerStyle={{ alignSelf:'center', marginTop: wp(0), borderRadius:wp(10)}}
          cameraStyle={{ 
            height: 200, marginTop: wp(0),
            borderRadius:wp(10), width: 280, alignSelf: 'center', justifyContent: 'center' }}
          cameraType='front'

          onRead={(e)=>{
              console.log("QR code ",e)
              Linking.openURL(e.data).catch(err =>
                console.error('An error occured', err)
              );
          }}
          showMarker={true}
          markerStyle={{ borderColor: 'white' }}
      ></QRCodeScanner>
    </View>
  )
}

export default QRScanner
