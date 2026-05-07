import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';

type AccordionSectionProps = {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
};

const AccordionSection = ({
  title,
  children,
  initiallyOpen = false,
}: AccordionSectionProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [open, setOpen] = useState(initiallyOpen);
  const rotation = useRef(
    new Animated.Value(initiallyOpen ? 1 : 0),
  ).current;

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1;
    Animated.timing(rotation, {
      toValue,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setOpen(prev => !prev);
  }, [open, rotation]);

  const chevronRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <AppTouchable onPress={toggle} style={styles.header} activeOpacity={0.7}>
        <AppText variant="body1" style={styles.title}>
          {title}
        </AppText>
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}
          accessibilityLabel={open ? 'Collapse section' : 'Expand section'}>
          {'▼'}
        </Animated.Text>
      </AppTouchable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
      marginHorizontal: wp(16),
      marginTop: hp(4),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(12),
    },
    title: {
      color: theme.colors.headingColor,
      fontWeight: '600',
      flex: 1,
    },
    chevron: {
      color: theme.colors.secondaryHeadingColor,
      fontSize: 12,
      marginLeft: wp(8),
    },
    body: {
      paddingBottom: hp(12),
    },
  });

export default AccordionSection;
