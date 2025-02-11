import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import AppText from 'src/components/AppText'
import SelectOption from 'src/components/SelectOption'
import { loginWithTwitter } from 'src/services/twitter'
import Relay from 'src/services/relay'
import { IssuerVerificationMethod } from 'src/models/interfaces/RGBWallet'
import dbManager from 'src/storage/realm/dbManager'
import { RealmSchema } from 'src/storage/enum'
import ModalLoading from 'src/components/ModalLoading'
import Toast from 'src/components/Toast';

const styles = StyleSheet.create({
  title: {
    marginBottom: 5,
  },
  subtitle: {
    marginBottom: 5,
    color: '#787878'
  },
  container: {
    marginVertical: 20,
  }
})

interface VerifyIssuerProps {
  assetId: string;
  schema: RealmSchema;
}

const VerifyIssuer: React.FC<VerifyIssuerProps> = (props: VerifyIssuerProps) => {
  const { assetId, schema } = props;
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyWithTwitter = React.useCallback(async () => {
    try {
      const result = await loginWithTwitter();
      console.log('result', result);
      if (result.username) {
        setIsLoading(true);
        const response = await Relay.verifyIssuer("appID", assetId, {
          type: IssuerVerificationMethod.TWITTER,
          id: result.id,
          name: result.name,
          username: result.username,
        });
        setIsLoading(false);
        if (response.status) {
          dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
            issuer: {
              verified: true,
              verifiedBy: [{
                type: IssuerVerificationMethod.TWITTER,
                id: result.id,
                name: result.name,
                username: result.username,
              }]
            }
          })
        }
      }
    } catch (error) {
      Toast(`${error}`, true);
      setIsLoading(false);
      console.log(error);
    }
  }, [assetId, schema]);

  return (
    <View style={styles.container}>
      <ModalLoading visible={isLoading} />
      <AppText variant='heading1' style={styles.title}>Issuer Verification Required</AppText>
      <AppText variant='heading3' style={styles.subtitle}>Verify your identity by connecting your Twitter account.</AppText>

      <SelectOption
        title={'Connect & Verify on Twitter'}
        subTitle={''}
        onPress={handleVerifyWithTwitter}
        testID={'verify-with-twitter'}
      />
    </View>
  )
}

export default VerifyIssuer
