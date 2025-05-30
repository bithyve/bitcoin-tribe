import { StyleSheet, View } from 'react-native';
import React, { useCallback, useContext } from 'react';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const getStyles = (theme: AppTheme, verified) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: verified
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
      color: verified
        ? theme.colors.backupDoneBorder
        : theme.colors.headingColor,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

interface IssuerDomainVerifiedProps {
  domain: string;
  verified?: boolean;
  onPress?: () => void;
}

const IssuerDomainVerified: React.FC<IssuerDomainVerifiedProps> = (
  props: IssuerDomainVerifiedProps,
) => {
  const { domain, verified, onPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, verified);

  if (!domain && !verified) {
    return null;
  }

  return (
    <AppTouchable style={styles.container} onPress={onPress}>
      <View style={styles.rowWrapper}>
        <View>
          <AppText variant="body2" style={styles.title}>
            {verified ? assets.domainVerified : assets.domainName}
          </AppText>
          <View style={styles.iconWrapper}>
            <View>
              <AppText variant="body2">{domain}</AppText>
            </View>
          </View>
        </View>
        {verified && <IconVerified />}
      </View>
    </AppTouchable>
  );
};

export default IssuerDomainVerified;
