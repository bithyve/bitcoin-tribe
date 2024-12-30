import React, { useContext, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import BtcBackedAsset from 'src/assets/images/BtcBackedAsset.svg';
import BackupAlertIllustration from 'src/assets/images/backupAlertIllustration.svg';
import BackupAlertIllustrationLight from 'src/assets/images/backupAlertIllustration_light.svg';
import OnboardingSlideComponent from './components/OnboardingSlideComponent';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys } from 'src/storage';
import PrimaryCTA from 'src/components/PrimaryCTA';

function OnboardingSlides() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const onboardingSlideRef = useRef(null);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding, home } = translations;
  const styles = getStyles(theme);
  const [currentPosition, setCurrentPosition] = useState(0);
  const onViewRef = React.useRef(viewableItems => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 100 });

  const [items] = useState([
    {
      id: 1,
      title: onBoarding.btcBackedAssetTitle,
      subTitle: onBoarding.btcBackedAssetSubTitle,
      paragraph: onBoarding.btcBackedAssetInfo,
      illustration: <BtcBackedAsset />,
    },
    {
      id: 2,
      title: home.backupAlertTitle,
      subTitle: home.backupAlertSubTitle,
      paragraph: '',
      illustration: isThemeDark ? (
        <BackupAlertIllustration />
      ) : (
        <BackupAlertIllustrationLight />
      ),
    },
  ]);

  return (
    <ScreenContainer>
      {/* <View style={styles.skipWrapperView}>
        {currentPosition === 0 && (
          <AppTouchable
            onPress={() => navigation.replace(NavigationRoutes.APPSTACK)}
            style={styles.skipTextWrapper}>
            <AppText variant="heading3" style={styles.skipText}>
              {common.skip}
            </AppText>
          </AppTouchable>
        )}
      </View> */}
      <View style={styles.wrapper}>
        <FlatList
          style={{
            width: windowWidth, // Use full device width
          }}
          ref={onboardingSlideRef}
          data={items}
          horizontal
          snapToInterval={windowWidth}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          disableIntervalMomentum
          decelerationRate="fast"
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OnboardingSlideComponent
              title={item.title}
              subTitle={item.subTitle}
              illustration={item.illustration}
              paragraph={item.paragraph}
              currentPosition={currentPosition}
              navigation={navigation}
            />
          )}
        />
        <View style={styles.pageIndicatorWrapper}>
          {items.map((item, index) => (
            <View
              key={item.id.toString()}
              style={
                currentPosition === index
                  ? styles.selectedDot
                  : styles.unSelectedDot
              }
            />
          ))}
        </View>
      </View>
      <View style={styles.footerBtnView}>
        <PrimaryCTA
          title={common.next}
          onPress={() => {
            if (currentPosition < items.length - 1) {
              onboardingSlideRef.current.scrollToIndex({
                animated: true,
                index: currentPosition + 1,
              });
            } else {
              navigation.replace(NavigationRoutes.APPSTACK);
            }
          }}
          width={hp(120)}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    skipWrapperView: {
      height: '6%',
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingHorizontal: wp(4),
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    footerBtnView: {
      height: '15%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    pageIndicatorWrapper: {
      flexDirection: 'row',
    },
    skipTextWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    skipText: {
      letterSpacing: 0.42,
      textAlign: 'center',
      color: theme.colors.accent1,
    },
    selectedDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.accent1,
      marginEnd: 5,
    },
    unSelectedDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.accent3,
      marginEnd: 5,
    },
  });
export default OnboardingSlides;
