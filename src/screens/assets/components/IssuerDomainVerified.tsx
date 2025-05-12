import { StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import IconVerified from 'src/assets/images/issuer_domain_verified.svg';
import AppTouchable from 'src/components/AppTouchable';
import { AppTheme } from 'src/theme';

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.backupDoneBorder,
      borderRadius: 10,
      padding: 16,
      marginVertical: 10,
    },
    rowWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.colors.backupDoneBorder,
    },
    iconWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

interface IssuerDomainVerifiedProps {
  domain: string;
}

const IssuerDomainVerified: React.FC<IssuerDomainVerifiedProps> = (
  props: IssuerDomainVerifiedProps,
) => {
  const { domain } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <AppTouchable style={styles.container}>
      <View style={styles.rowWrapper}>
        <View>
          <AppText variant="body2" style={styles.title}>
            Domain Verified
          </AppText>
          <View style={styles.iconWrapper}>
            <View>
              <AppText variant="heading2">{domain}</AppText>
            </View>
          </View>
        </View>
        <IconVerified />
      </View>
    </AppTouchable>
  );
};

export default IssuerDomainVerified;
