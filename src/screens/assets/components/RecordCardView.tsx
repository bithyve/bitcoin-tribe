import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import IconCopy from 'src/assets/images/icon_copy1.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';

interface Props {
  index: number;
  recordType: string;
  domain: string;
  value: string;
}

function RecordCardView(props: Props) {
  const { index, recordType, domain, value } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <GradientView
      style={styles.gradientContainer}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
      <View style={styles.cardTitleView}>
        <AppText variant="heading3" style={styles.cardTitle}>
          {assets.recordCard} {index}
        </AppText>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          <AppText variant="body2" style={styles.labelText}>
            {assets.recordType}
          </AppText>
          <AppText variant="body2" style={styles.valueText}>
            {recordType}
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText variant="body2" style={styles.labelText}>
            {assets.domain}
          </AppText>
          <AppText variant="body2" style={styles.valueText}>
            {domain}
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText variant="body2" style={styles.labelText}>
            {assets.value}
          </AppText>
          <AppTouchable style={styles.copiableView}>
            <AppText variant="body2" style={styles.valueText}>
              {value}
            </AppText>
            <View>{isThemeDark ? <IconCopy /> : <IconCopyLight />}</View>
          </AppTouchable>
        </View>
      </View>
    </GradientView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    gradientContainer: {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      marginVertical: hp(10),
    },
    cardTitleView: {
      height: hp(60),
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
      paddingHorizontal: hp(15),
    },
    cardTitle: {
      color: theme.colors.headingColor,
    },
    contentContainer: {
      padding: hp(15),
    },
    contentWrapper: {
      flexDirection: 'row',
      marginVertical: hp(5),
      justifyContent: 'space-between',
      width: '100%',
    },
    labelText: {
      color: theme.colors.secondaryHeadingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
      textAlign: 'right',
    },
    copiableView: {
      flexDirection: 'row',
    },
  });
export default RecordCardView;
