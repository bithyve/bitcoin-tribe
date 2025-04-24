import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';

import { verifyIssuerOnTwitter } from './VerifyIssuer';
import { RealmSchema } from 'src/storage/enum';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import AssetVerifyIllustration from 'src/assets/images/assetVerifyIllustration.svg';

interface VerifyIssuerModalProps {
  assetId: string;
  isVisible: boolean;
  onDismiss: () => void;
  schema: RealmSchema;
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(10),
    },
    contentContainer: {},
    contentWrapper: {
      marginTop: hp(5),
      marginBottom: hp(20),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
    },
    illustrationWrapper: {
      marginVertical: hp(25),
      alignSelf: 'center',
    },
  });

const VerifyIssuerModal = ({
  assetId,
  isVisible,
  onDismiss,
  schema,
}: VerifyIssuerModalProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { assets, common } = translations;
  const { setCompleteVerification } = useContext(AppContext);
  return (
    <ResponsePopupContainer
      visible={isVisible}
      enableClose={true}
      backColor={theme.colors.modalBackColor}
      borderColor={theme.colors.modalBackColor}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.contentWrapper}>
            <AppText variant="heading2" style={styles.titleText}>
              {assets.verifyYourIdentityTitle}
            </AppText>
            <AppText variant="body2" style={styles.subTitleText}>
              {assets.verifyYourIdentitySubTitle}
            </AppText>
          </View>
          <View style={styles.illustrationWrapper}>
            <AssetVerifyIllustration />
          </View>
          {/* <View> */}
          <Buttons
            primaryTitle={common.verify}
            primaryOnPress={async () => {
              await verifyIssuerOnTwitter(assetId, schema);
              onDismiss();
              setCompleteVerification(true);
            }}
            secondaryTitle={common.skip}
            secondaryOnPress={onDismiss}
            width={windowWidth / 2.7}
            secondaryCTAWidth={windowWidth / 2.9}
          />
          {/* </View> */}
        </View>
      </View>
    </ResponsePopupContainer>
  );
};

export default VerifyIssuerModal;
