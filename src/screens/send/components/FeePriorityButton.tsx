import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from 'src/theme/Colors';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';

const FeePriorityButton = ({
  title,
  priority,
  selectedPriority,
  setSelectedPriority,
  getFeeRateByPriority,
  getEstimatedBlocksByPriority,
}) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const isSelected = selectedPriority === priority;

  return (
    <AppTouchable
      onPress={setSelectedPriority}
      style={[
        styles.feeWrapper,
        {
          borderColor: isSelected ? 'transparent' : theme.colors.borderColor,
          backgroundColor: isSelected ? theme.colors.accent1 : 'transparent',
        },
      ]}>
      <AppText
        variant="body2"
        style={[
          styles.priorityValue,
          {
            color: isSelected ? Colors.Black : theme.colors.headingColor,
          },
        ]}>
        {title}
      </AppText>
      <AppText
        variant="body2"
        style={[
          styles.priorityValue,
          {
            color: isSelected ? Colors.Black : theme.colors.headingColor,
          },
        ]}>
        {getFeeRateByPriority} sat/vB
      </AppText>
      <AppText
        variant="body2"
        style={[
          styles.priorityTimeValue,
          {
            color: isSelected
              ? Colors.Black
              : theme.colors.secondaryHeadingColor,
          },
        ]}>
        ~{getEstimatedBlocksByPriority} hr
      </AppText>
    </AppTouchable>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    feeWrapper: {
      padding: 15,
      borderWidth: 1,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: hp(5),
    },
    priorityValue: {
      color: theme.colors.headingColor,
    },
    priorityTimeValue: {
      marginTop: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
  });

export default FeePriorityButton;
