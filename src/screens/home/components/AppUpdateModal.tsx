import React, { useContext, useMemo, useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import Buttons from 'src/components/Buttons';
import { SizedBox } from 'src/components/SizedBox';
import Fonts from 'src/constants/Fonts';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

export const AppUpdateModal = () => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const [showModal, setShowModal] = useState(true);

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View>
            <FastImage
              source={
                theme.dark
                  ? require('src/assets/images/appUpdate.png')
                  : require('src/assets/images/appUpdateLight.png')
              }
              style={styles.illustration}
            />
          </View>
          <SizedBox height={20} />
          <AppText style={styles.title}>{home.appUpdateTitle}</AppText>
          <SizedBox height={6} />
          <AppText variant="caption" style={styles.subTitle}>
            {home.appUpdateSubTitle}
          </AppText>
          <SizedBox height={25} />
          <View style={{ alignItems: 'center' }}>
            <Buttons
              primaryTitle={home.appUpdateButton}
              primaryOnPress={() => {}}
              height={hp(15)}
              width={'70%'}
            />
            <SizedBox height={hp(15)} />
            <AppTouchable onPress={() => setShowModal(false)}>
              <AppText style={styles.skipText}>{home.appUpdateSkip}</AppText>
            </AppTouchable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.cardGradient1,
      borderRadius: wp(20),
      paddingVertical: wp(20),
      width: wp(320),
      alignItems: 'center',
    },
    modalActionButtons: {
      gap: wp(12),
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      fontFamily: Fonts.LufgaSemiBold,
    },
    subTitle: {
      textAlign: 'center',
      maxWidth: '70%',
      color: theme.colors.secondaryHeadingColor,
    },
    modalActionButton: {
      paddingVertical: hp(12),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustration: { width: wp(320), height: wp(256), resizeMode: 'cover' },
    skipText: {
      textDecorationLine: 'underline',
      color: theme.colors.secondaryHeadingColor,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: Fonts.LufgaMedium,
    },
  });
