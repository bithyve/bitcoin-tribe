import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';

import ModalContainer from 'src/components/ModalContainer';
import { verifyIssuerOnTwitter } from './VerifyIssuer';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { RealmSchema } from 'src/storage/enum';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import SkipButton from 'src/components/SkipButton';
import { hp, wp } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';

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
    paddingHorizontal: hp(20),
    marginVertical: hp(10),
  },
});

const VerifyIssuerModal = ({
  assetId,
  isVisible,
  onDismiss,
  schema,
}: VerifyIssuerModalProps) => {
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const { setCompleteVerification } = useContext(AppContext);
  return (
    <ModalContainer
      title={assets.verifyYourIdentityTitle}
      subTitle={assets.verifyYourIdentitySubTitle}
      visible={isVisible}
      enableCloseIcon={false}
      onDismiss={onDismiss}>
      <View style={styles.container}>
        <SkipButton onPress={onDismiss} title={assets.skipForNow} />
        <PrimaryCTA
          title={assets.verifyNow}
          onPress={async () => {
            await verifyIssuerOnTwitter(assetId, schema);
            onDismiss();
            setCompleteVerification(true);
          }}
          width={wp(180)}
        />
      </View>
    </ModalContainer>
  );
};

export default VerifyIssuerModal;
