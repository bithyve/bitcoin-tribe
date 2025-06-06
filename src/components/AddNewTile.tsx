import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import AppText from './AppText';
import AddNewIcon from 'src/assets/images/icon_addnew.svg';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';

type AddNewTileProps = {
  title: string;
  onPress?: () => void;
};

const AddNewTile = (props: AddNewTileProps) => {
  const { title, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppTouchable onPress={onPress} style={styles.container}>
      <View style={styles.wrapper}>
        <AddNewIcon />
        <AppText variant="subtitle2" style={styles.titleStyle}>
          {title}
        </AppText>
      </View>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: hp(150),
      width: wp(160),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      margin: wp(5),
      backgroundColor: theme.colors.cardBackground,
    },
    wrapper: {
      alignItems: 'center',
      backgroundColor: theme.colors.cardBackground,
    },
    titleStyle: {
      color: theme.colors.primaryCTA,
      marginTop: hp(10),
    },
  });
export default AddNewTile;
