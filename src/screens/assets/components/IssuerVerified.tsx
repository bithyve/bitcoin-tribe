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
}

const IssuerVerified: React.FC<IssuerVerifiedProps> = (
  props: IssuerVerifiedProps,
) => {
  const { id, name, username } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const styles = getStyles(theme);

  const onPress = useCallback(() => {
    openLink(`https://twitter.com/i/user/${id}`);
  }, [id]);

  if (!id && !name && !username) {
    return null;
  }

  return (
    <AppTouchable style={styles.container} onPress={onPress}>
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
