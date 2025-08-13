import { StyleSheet, View } from 'react-native';
import React, { useCallback, useContext } from 'react';
import AppText from 'src/components/AppText';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import IconX from 'src/assets/images/icon_x.svg';
import AppTouchable from 'src/components/AppTouchable';
import openLink from 'src/utils/OpenLink';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { verifyIssuerOnTwitter } from './VerifyIssuer';
import { RealmSchema } from 'src/storage/enum';

const getStyles = (theme: AppTheme, id) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: id
        ? theme.colors.backupDoneBorder
        : theme.colors.borderColor,
      borderRadius: 10,
      padding: 16,
      marginVertical: 10,
    },
    rowWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: id ? theme.colors.backupDoneBorder : theme.colors.headingColor,
    },
    textUsername: {
      color: theme.colors.secondaryHeadingColor,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  });

interface IssuerVerifiedProps {
  id: string;
  name: string;
  username: string;
  assetId?: string;
  schema?: RealmSchema;
  onVerificationComplete?: () => void;
  setIsVerifyingIssuer?: React.Dispatch<React.SetStateAction<boolean>>;
  hasIssuanceTransaction?: boolean;
}

const IssuerVerified: React.FC<IssuerVerifiedProps> = (
  props: IssuerVerifiedProps,
) => {
  const {
    id,
    name,
    username,
    assetId,
    schema,
    onVerificationComplete,
    setIsVerifyingIssuer,
    hasIssuanceTransaction,
  } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const styles = getStyles(theme, id);

  const onPress = useCallback(async () => {
    if (id) {
      openLink(`https://twitter.com/i/user/${id}`);
    } else {
      setIsVerifyingIssuer(true);
      await verifyIssuerOnTwitter(assetId, schema, onVerificationComplete);
      setIsVerifyingIssuer(false);
    }
  }, [id]);

  if (!id && !name && !username) {
    return null;
  }

  return (
    <AppTouchable
      style={styles.container}
      onPress={onPress}
      disabled={!hasIssuanceTransaction && !id}>
      <View style={styles.rowWrapper}>
        <View>
          <AppText variant="body2" style={styles.title}>
            {id
              ? assets.issuerVerificationTemplateTitle
              : assets.xHandleTemplateTitle}
          </AppText>
          <View style={styles.iconWrapper}>
            <IconX />
            <View>
              {name && <AppText variant="body2">{name}</AppText>}
              <AppText variant="caption" style={styles.textUsername}>
                @{username}
              </AppText>
            </View>
          </View>
        </View>
        {id && <IconVerified />}
      </View>
    </AppTouchable>
  );
};

export default IssuerVerified;
