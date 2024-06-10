import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, wp } from '../constants/responsive';
import AppText from './AppText';
import AddNewIcon from '../assets/images/icon_addnew.svg';

type AddNewTileProps = {
  title: string;
};

const AddNewTile = (props: AddNewTileProps) => {
  const { title } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <AddNewIcon />
      <AppText variant="subtitle2" style={styles.titleStyle}>
        {title}
      </AppText>
    </View>
  );
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: hp(150),
      width: wp(160),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
    },
    titleStyle: {
      color: theme.colors.primaryCTA,
      marginTop: hp(10),
    },
  });
export default AddNewTile;
