import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SelectWalletTypeOption from './SelectWalletTypeOption';
import SelfCustodyIcon from 'src/assets/images/selfcustodyIcon.svg';
import MainnetIcon from 'src/assets/images/mainnetIcon.svg';
import LightningIcon from 'src/assets/images/lightningIcon.svg';
import DownArrowIcon from 'src/assets/images/icon_chevron_down.svg';
import IconSettingArrow from 'src/assets/images/icon_arrowr2.svg';
import IconSettingArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import { hp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';

function SelectWalletCollapse() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding } = translations;
  const styles = getStyles(theme);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View>
      <View>
        <SelectWalletTypeOption
          icon={<SelfCustodyIcon />}
          title={onBoarding.selfCustody}
          onPress={() => setIsCollapsed(!isCollapsed)}
          rightIcon={<DownArrowIcon />}
          style={{
            borderColor: isCollapsed
              ? theme.colors.accent1
              : theme.colors.borderColor,
          }}
        />
      </View>
      {isCollapsed && (
        <View style={styles.collapseViewWrapper}>
          <SelectWalletTypeOption
            title={onBoarding.mainnet}
            icon={<MainnetIcon />}
            rightIcon={
              !isThemeDark ? <IconSettingArrow /> : <IconSettingArrowLight />
            }
            onPress={() => navigation.navigate(NavigationRoutes.PROFILESETUP)}
          />
          {/* <SelectWalletTypeOption
            title={onBoarding.mainnetAndLightning}
            icon={<LightningIcon />}
            rightIcon={
              !isThemeDark ? <IconSettingArrow /> : <IconSettingArrowLight />
            }
            onPress={() =>
              navigation.navigate(NavigationRoutes.RGBLIGHTNINGNODECONNECT)
            }
          /> */}
        </View>
      )}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    collapseViewWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      padding: hp(10),
      borderRadius: hp(15),
      marginBottom: hp(20),
      marginTop: hp(10),
    },
  });
export default SelectWalletCollapse;
