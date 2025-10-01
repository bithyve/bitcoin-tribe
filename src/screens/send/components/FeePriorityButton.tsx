import React from 'react';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
type feePriorityButtonProps = {
  title: string;
  priority: string;
  selectedPriority: string;
  setSelectedPriority: () => void;
  feeRateByPriority: number;
  estimatedBlocksByPriority: number;
  disabled?: boolean;
};
const FeePriorityButton = ({
  title,
  priority,
  selectedPriority,
  setSelectedPriority,
  feeRateByPriority,
  estimatedBlocksByPriority,
  disabled,
}: feePriorityButtonProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const isSelected = selectedPriority === priority;
  return (
    <AppTouchable
      disabled={disabled}
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
            color: isSelected
              ? theme.colors.popupSentCTATitleColor
              : theme.colors.headingColor,
          },
        ]}>
        {title}
      </AppText>
      {feeRateByPriority ? (
        <AppText
          variant="body2"
          style={[
            styles.priorityValue,
            {
              color: isSelected
                ? theme.colors.popupSentCTATitleColor
                : theme.colors.headingColor,
            },
          ]}>
          {feeRateByPriority} sat/vB
        </AppText>
      ) : null}
      <AppText
        variant="body2"
        style={[
          styles.priorityTimeValue,
          {
            color: isSelected
              ? theme.colors.popupSentCTATitleColor
              : theme.colors.secondaryHeadingColor,
          },
        ]}>
        ~ {estimatedBlocksByPriority * 10} {'min'}
      </AppText>
    </AppTouchable>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    feeWrapper: {
      height: hp(100),
      padding: 5,
      borderWidth: 2,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: hp(5),
      flex: 1
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
