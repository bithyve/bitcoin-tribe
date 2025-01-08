import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme, Provider as PaperProvider } from 'react-native-paper';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppText from './AppText';

const SegmentedButtons = ({ value, onValueChange, buttons }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.buttonContainer}>
      {buttons.map(button => {
        const isSelected = button.value === value;
        return (
          <TouchableOpacity
            key={button.value}
            onPress={() => onValueChange(button.value)}
            style={[
              styles.button,
              {
                borderBottomColor: isSelected
                  ? theme.colors.segmentSelectTitle
                  : theme.colors.secondaryHeadingColor,
                borderBottomWidth: isSelected ? 1 : 0.4,
              },
            ]}>
            <AppText
              variant="heading2"
              style={[
                styles.buttonText,
                {
                  color: isSelected
                    ? theme.colors.segmentSelectTitle
                    : theme.colors.secondaryHeadingColor,
                },
              ]}>
              {button.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    buttonContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.primaryBackground,
      marginBottom: hp(25),
    },
    button: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(10),
      borderBottomColor: theme.colors.headingColor,
      borderBottomWidth: 1,
      borderRadius: 5,
    },
    buttonText: {
      color: theme.colors.headingColor,
      fontWeight: '400',
    },
  });
export default SegmentedButtons;
