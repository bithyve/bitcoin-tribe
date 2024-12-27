import React, { useContext, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import AppText from './AppText';
import PrimaryCTA from './PrimaryCTA';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const SwipeToAction = ({ onSwipeComplete }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const [swiped, setSwiped] = useState(false);
  const translateX = new Animated.Value(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > 180) {
        setSwiped(true);
        onSwipeComplete();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      {!swiped ? (
        <View style={styles.track}>
          <AppText variant="body1" style={styles.trackText}>
            {sendScreen.swipeToBroadcast}
          </AppText>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                styles.thumb,
                { transform: [{ translateX: translateX }] },
              ]}>
              <AppText variant="body1" style={styles.thumbText}>
                »
              </AppText>
            </Animated.View>
          </PanGestureHandler>
        </View>
      ) : (
        <PrimaryCTA
          title={sendScreen.broadcastingTXN}
          onPress={()=> {}}
          width={'100%'}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.accent1}
          height={hp(18)}
        />
      )}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    track: {
      width: '100%',
      height: 70,
      backgroundColor: '#fff',
      borderRadius: 18,
      justifyContent: 'center',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    trackText: {
      position: 'absolute',
      alignSelf: 'center',
      color: theme.colors.popupCTATitleColor,
    },
    thumb: {
      width: 60,
      height: 60,
      backgroundColor: theme.colors.accent1,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 5,
    },
    thumbText: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
    },
    successText: {
      fontSize: 24,
      color: '#FFD700',
      fontWeight: 'bold',
    },
  });

export default SwipeToAction;
