import { StyleSheet, View } from 'react-native'
import React from 'react'
import ModalContainer from 'src/components/ModalContainer';
import SecondaryCTA from 'src/components/SecondaryCTA';
import { verifyIssuerOnTwitter } from './VerifyIssuer';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { RealmSchema } from 'src/storage/enum';

interface VerifyIssuerModalProps {
  assetId: string;
  isVisible: boolean;
  onDismiss: () => void;
  schema: RealmSchema;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  }
})

const VerifyIssuerModal = ({ assetId, isVisible, onDismiss, schema }: VerifyIssuerModalProps) => {
  return (
    <ModalContainer
      title={'Verify Your Identity'}
      subTitle={'Secure your assets by verifying your identity on Twitter.'}
      height={'30%'}
      visible={isVisible}
      enableCloseIcon={false}
      onDismiss={onDismiss}>
      <View style={styles.container}>
        <SecondaryCTA
          title={'Skip'}
          onPress={onDismiss}
        />
        <PrimaryCTA
          title={'Verify Now'}
          onPress={async () => {
            await verifyIssuerOnTwitter(assetId, schema);
            onDismiss();
          }}
        />
      </View>
    </ModalContainer>
  )
}

export default VerifyIssuerModal

