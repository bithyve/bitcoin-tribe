import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMMKVBoolean } from 'react-native-mmkv';
import Share from 'react-native-share';

import Toast from 'src/components/Toast';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import IconShare from 'src/assets/images/icon_share.svg';
import IconShareLight from 'src/assets/images/icon_share_light.svg';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';

interface AssetIDContainerProps {
  assetId: string;
}

const AssetIDContainer = ({ assetId }: AssetIDContainerProps) => {
  const { translations } = React.useContext(LocalizationContext);
  const { common, assets } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(common.assetIDCopySuccessfully);
  };

  const onShare = async () => {
    try {
      const shareOptions = {
        message: assetId, // Only share the asset ID
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing asset ID:', error);
    }
  };

  return (
    <View>
      <AppText variant="body2" style={styles.labelText}>
        {assets.assetId}
      </AppText>
      <View style={styles.assetIDWrapper}>
        <GradientView
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}
          style={styles.idTextWrapper}>
          <AppText variant="body2" numberOfLines={1} ellipsizeMode="tail">
            {assetId}
          </AppText>
        </GradientView>
        <AppTouchable style={styles.shareIconWrapper} onPress={onShare}>
          {isThemeDark ? <IconShare /> : <IconShareLight />}
        </AppTouchable>
        <AppTouchable
          style={styles.copyIconWrapper}
          onPress={() => handleCopyText(assetId)}>
          {isThemeDark ? <IconCopy /> : <IconCopyLight />}
        </AppTouchable>
      </View>
    </View>
  );
};

export default AssetIDContainer;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    assetIDWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    idTextWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '70%',
      minHeight: hp(50),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      padding: hp(8),
    },
    shareIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '12%',
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      padding: hp(8),
      backgroundColor: theme.colors.cardGradient1,
    },
    copyIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '12%',
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      padding: hp(8),
      backgroundColor: theme.colors.cardGradient1,
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
      flex: 1,
      textAlign: 'left',
    },
  });
