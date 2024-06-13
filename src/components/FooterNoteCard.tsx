import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';

type FooterNoteCardProps = {
  title: string;
  subTitle: string;
  customStyle?: StyleProp<ViewStyle>;
};

function FooterNoteCard(props: FooterNoteCardProps) {
  const { title, subTitle, customStyle } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={[styles.container, customStyle]}>
      <View>
        <View style={styles.detailsWrapper}>
          <View style={styles.contentWrapper}>
            <AppText testID={'footerNodeCardTitle'} style={styles.menuCardTitle}>{title}</AppText>
            <AppText testID={'footerNodeCardSubTitle'} style={styles.menuCardSubTitle}>{subTitle}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      // marginVertical: hp(10),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
    },
    detailsWrapper: {
      flexDirection: 'row',
      width: '100%',
    },
    contentWrapper: {
      width: '90%',
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
export default FooterNoteCard;