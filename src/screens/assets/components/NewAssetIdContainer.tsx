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
import { hp, windowWidth, wp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';
import CopyIcon from 'src/assets/images/copyOutline.svg';
import CopyIconLight from 'src/assets/images/copyOutlineLight.svg';
import ShareIcon from 'src/assets/images/shareOutline.svg';
import ShareIconLight from 'src/assets/images/shareOutlineLight.svg';

interface AssetIDContainerProps {
  assetId: string;
}
const IC_SIZE = 20
export const NewAssetIdContainer = ({ assetId }: AssetIDContainerProps) => {
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
        message: assetId,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing asset ID:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <AppText
          variant="heading2Bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.assetIdTxt}>
          {assetId}
        </AppText>
        <View style={styles.iconsCtr}>
          <AppTouchable style={styles.shareIconWrapper} onPress={onShare}>
            {isThemeDark ? (
              <ShareIcon height={IC_SIZE} width={IC_SIZE} />
            ) : (
              <ShareIconLight height={IC_SIZE} width={IC_SIZE} />
            )}
          </AppTouchable>
          <AppTouchable
            style={styles.copyIconWrapper}
            onPress={() => handleCopyText(assetId)}>
            {isThemeDark ? (
              <CopyIcon height={IC_SIZE} width={IC_SIZE} />
            ) : (
              <CopyIconLight height={IC_SIZE} width={IC_SIZE} />
            )}
          </AppTouchable>
        </View>
      </View>
      <AppText variant="body2" style={styles.labelText}>
        {assets.assetId}
      </AppText>
      <View style={styles.divider} />
    </>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(15),
    },
    assetIdTxt: { maxWidth: windowWidth * 0.6 },
    iconsCtr: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
    shareIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      aspectRatio: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 100,
      padding: wp(6),
      backgroundColor: theme.colors.roundedCtaBg,
    },
    copyIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 100,
      padding: hp(6),
      backgroundColor: theme.colors.roundedCtaBg,
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginTop: hp(8),
      flex: 1,
      textAlign: 'left',
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.separator,
      marginTop: hp(15),
    },
  });
