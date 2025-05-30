import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import ReceiveQrDetails from '../receive/components/ReceiveQrDetails';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { windowHeight } from 'src/constants/responsive';
import { hp } from 'src/constants/responsive';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import ModalLoading from 'src/components/ModalLoading';
import Relay from 'src/services/relay';


const getStyles = (theme: AppTheme) => StyleSheet.create({
  bodyWrapper: {
    flex: 1,
  },
  qrWrapper: {
    paddingTop: hp(25),
    height: windowHeight < 670 ? '65%' : '73%',
    // justifyContent: 'center',
  },
})

const ContactRequest = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const [qrValue, setQrValue] = useState('');
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();

  const createContactRequest = async () => {
    try {
      const request = await Relay.createContactRequest(app.id, 'test-key', app.publicId);
      setQrValue(`tribecontact://${request.requestId}`);
    } catch (error) {
      console.error('Error creating chat room: ', error);
      navigation.goBack();
    }
  };

  useEffect(() => {
    createContactRequest();
  }, []);

  return qrValue === '' ? <ModalLoading visible={true} />
    : (
      <ScreenContainer>

        <AppHeader
          title={'Contact Request'}
          subTitle={'Ask Your Contact to Scan the QR Code'}
          enableBack={true}
          onBackNavigation={() => navigation.goBack()}
        />
        <View style={styles.bodyWrapper}>
          <View style={styles.qrWrapper}>
            <ReceiveQrDetails
              receivingAddress={qrValue}
              qrTitle={'Contact Request'}
            />
          </View>
          <ReceiveQrClipBoard
            qrCodeValue={qrValue}
            icon={isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />

        </View>
      </ScreenContainer>
    )
}

export default ContactRequest

