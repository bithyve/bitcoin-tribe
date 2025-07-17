import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import { verifyIssuerOnTwitter } from './VerifyIssuer';
import { RealmSchema } from 'src/storage/enum';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import AssetVerifyIllustration from 'src/assets/images/assetVerifyIllustration.svg';
import VerifyDomainIcon from 'src/assets/images/icon_domain.svg';
import VerifyDomainIconLight from 'src/assets/images/icon_domain_light.svg';
import VerifyXIcon from 'src/assets/images/icon_verifyx.svg';
import VerifyXIconLight from 'src/assets/images/icon_verifyx_light.svg';
import { Keys } from 'src/storage';
import SkipButton from 'src/components/SkipButton';

interface VerifyIssuerModalProps {
  assetId: string;
  isVisible: boolean;
  onVerify: () => void;
  onDismiss: () => void;
  schema: RealmSchema;
  onVerificationComplete?: () => void;
  primaryLoading?: boolean;
  onDomainVerify?: () => void;
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
    iconStyle: {
      marginRight: hp(5),
    },
    skipWrapper: {
      marginTop: hp(10),
    },
  });

const VerifyIssuerModal = ({
  assetId,
  isVisible,
  onVerify,
  onDismiss,
  schema,
  onVerificationComplete,
  primaryLoading,
  onDomainVerify,
}: VerifyIssuerModalProps) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { assets, common } = translations;
  const { setCompleteVerification } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
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
            primaryTitle={'X'}
            primaryOnPress={async () => {
              setLoading(true);
              await verifyIssuerOnTwitter(
                assetId,
                schema,
                onVerificationComplete,
              );
              onVerify();
              setCompleteVerification(true);
              setLoading(false);
            }}
            secondaryTitle={'Domain'}
            secondaryOnPress={onDomainVerify}
            width={windowWidth / 2.7}
            secondaryCTAWidth={windowWidth / 2.9}
            height={hp(14)}
            primaryLoading={primaryLoading || loading}
            disabled={primaryLoading || loading}
            secondaryCTAIcon={
              isThemeDark ? (
                <VerifyDomainIcon style={styles.iconStyle} />
              ) : (
                <VerifyDomainIconLight style={styles.iconStyle} />
              )
            }
            primaryCTAIcon={
              isThemeDark ? (
                <VerifyXIcon style={styles.iconStyle} />
              ) : (
                <VerifyXIconLight style={styles.iconStyle} />
              )
            }
          />
          {/* </View> */}
        </View>
        <View style={styles.skipWrapper}>
          <SkipButton onPress={onDismiss} title={assets.skipForNow} />
        </View>
      </View>
    </ResponsePopupContainer>
  );
};

export default VerifyIssuerModal;
