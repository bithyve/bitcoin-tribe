import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMMKVBoolean } from 'react-native-mmkv';

import Toast from 'src/components/Toast';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import GradientView from 'src/components/GradientView';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';

interface NodeInfoItemProps {
  title: string;
  value: string;
  isCopiable?: boolean;
  copyMessage?: string;
}

const NodeInfoItem = ({
  title,
  value,
  isCopiable = false,
  copyMessage,
}: NodeInfoItemProps) => {
  const { translations } = React.useContext(LocalizationContext);
  const { common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, isCopiable),
    [theme, isCopiable],
  );

  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(copyMessage);
  };

  return (
    <View>
      <AppText variant="body2" style={styles.labelText}>
        {title}
      </AppText>
      <View style={styles.nodeItemWrapper}>
        <GradientView
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}
          style={styles.gradientViewWrapper}>
          <View style={styles.valueWrapper}>
            <AppText variant="body2">{value}</AppText>
          </View>
        </GradientView>
        {isCopiable && (
          <GradientView
            colors={[
              theme.colors.cardGradient1,
              theme.colors.cardGradient2,
              theme.colors.cardGradient3,
            ]}
            style={styles.gradientViewWrapper1}>
            <AppTouchable
              disabled={!value}
              style={styles.copyIconWrapper}
              onPress={() => handleCopyText(value)}>
              {isThemeDark ? <IconCopy /> : <IconCopyLight />}
            </AppTouchable>
          </GradientView>
        )}
      </View>
    </View>
  );
};

export default NodeInfoItem;

const getStyles = (theme: AppTheme, isCopiable) =>
  StyleSheet.create({
    nodeItemWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    gradientViewWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      paddingVertical: hp(10),
      paddingHorizontal: hp(5),
      minHeight: hp(50),
      justifyContent: 'center',
      width: isCopiable ? '84%' : '100%',
    },
    gradientViewWrapper1: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: '15%',
      minHeight: hp(50),
    },
    valueWrapper: {
      justifyContent: 'center',
      width: isCopiable ? '85%' : '100%',
      paddingHorizontal: hp(8),
    },
    copyIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '15%',
      //       padding: hp(8),
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(5),
      marginTop: hp(20),
      flex: 1,
      textAlign: 'left',
    },
  });
