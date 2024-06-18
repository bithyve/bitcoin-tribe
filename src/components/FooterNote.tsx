import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';

type FooterNoteProps = {
  title: string;
  subTitle: string;
  customStyle?: StyleProp<ViewStyle>;
};

function FooterNote(props: FooterNoteProps) {
  const { title, subTitle, customStyle } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={[styles.container, customStyle]}>
      <View>
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText style={styles.menuCardTitle}>{title}</AppText>
            <AppText style={styles.menuCardSubTitle}>{subTitle}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: hp(15),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '96%',
      marginTop: hp(10),
    },
    menuCardTitle: {
      color: theme.colors.accent3,
    },
    menuCardSubTitle: {
      color: theme.colors.bodyColor,
    },
    iconWrapper: {
      width: '10%',
      justifyContent: 'center',
    },
  });
export default FooterNote;
