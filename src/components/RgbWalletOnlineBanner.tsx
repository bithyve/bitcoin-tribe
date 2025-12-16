import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import AppTouchable from './AppTouchable';
import AppText from './AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';

type RgbWalletOnlineBannerProps = {};

export const RgbWalletOnlineBanner = (props: RgbWalletOnlineBannerProps) => {
  const { common } = useContext(LocalizationContext).translations;
  const { walletWentOnline } = useContext(AppContext);

  if (!walletWentOnline) return null;

  return (
    <AppTouchable style={styles.onlineContainer} disabled>
      <AppText style={styles.text}>
        {common.walletWentOnline}
      </AppText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  onlineContainer: {
    backgroundColor: Colors.GOGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    width: windowWidth,
    height: hp(25),
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
});
