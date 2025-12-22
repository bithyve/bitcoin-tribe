import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import UDADetailsScreen from './UDADetailsScreen';
import AppHeader from 'src/components/AppHeader';
import { hp, wp } from 'src/constants/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import SendIcon from 'src/assets/images/sendIcon.svg';
import SendIconLight from 'src/assets/images/icon_send_light.svg';
import DownloadIcon from 'src/assets/images/downloadOutline.svg';
import DownloadIconLight from 'src/assets/images/downloadOutlineLight.svg';
import CopyIcon from 'src/assets/images/copyOutline.svg';
import CopyIconLight from 'src/assets/images/copyOutlineLight.svg';
import InfoIcon from 'src/assets/images/infoOutline.svg';
import InfoIconLight from 'src/assets/images/infoOutlineLight.svg';
import ShareIcon from 'src/assets/images/shareOutline.svg';
import ShareIconLight from 'src/assets/images/shareOutlineLight.svg';
import Share from 'react-native-share';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';
import AppTouchable from 'src/components/AppTouchable';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { isWebUrl } from 'src/utils/url';
import Colors from 'src/theme/Colors';
import { SizedBox } from 'src/components/SizedBox';
import { CustomImage } from 'src/components/CustomImage';

const { width, height } = Dimensions.get('window');

export const CollectionUdaSwiper = ({ route }) => {
  const { assets, index } = route.params;
  const sliderRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const scrollToIndex = index => {
    setTimeout(() => {
      sliderRef.current?.scrollToIndex({
        index: index,
        animated: false,
      });
    }, 100);
  };

  return (
    <>
      <AppHeader
        title={''}
        style={{
          position: 'absolute',
          left: wp(16),
          right: wp(16),
          top: insets.top * 0.8,
          zIndex: 100,
        }}
      />
      <FlatList
        data={assets}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        ref={sliderRef}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => {
          return (
            <View style={{ height, width }} key={item.assetId}>
              <UDADetailsScreen
                data={{
                  assetId: item.assetId,
                  askReview: false,
                  askVerify: false,
                  showHeader: false,
                  showFooter: false,
                  showInfo,
                }}
                route={null}
              />
            </View>
          );
        }}
      />
      <View>
        <FooterActionItems
          assets={assets}
          activeIndex={activeIndex}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          scrollToIndex={scrollToIndex}
        />
      </View>
    </>
  );
};

const FooterActionItems = ({
  assets,
  activeIndex,
  showInfo,
  setShowInfo,
  scrollToIndex,
}) => {
  const uda = assets[activeIndex];
  const theme: AppTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { common } = useContext(LocalizationContext).translations;
  const navigation = useNavigation();
  const styles = getStyles(theme, insets);
  const bottomSliderRef = useRef(null);
  const extraPadding =  (width/2) - wp(40) - 5 

  useEffect(() => {
  if (!bottomSliderRef.current || activeIndex == null) return;
  requestAnimationFrame(() => {
    try {
      bottomSliderRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5, // keep it centered
      });
    } catch (error) {
      console.warn('scrollToIndex failed:', error);
    }
  });
}, [activeIndex]);
  

  const onShareAssetId = async () => {
    try {
      const shareOptions = { message: uda.assetId };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing asset ID:', error);
    }
  };

  const onCopyAssetId = async () => {
    await Clipboard.setString(uda?.assetId);
    Toast(common.assetIDCopySuccessfully);
  };

  const onShareImage = async () => {
    const filePath = Platform.select({
      android: `file://${uda?.token?.media.filePath}`,
      ios: `${uda?.token?.media.filePath}`,
    });
    try {
      const options = {
        url: filePath,
      };
      await Share.open(options);
    } catch (error) {
      console.log('Error sharing file:', error);
    }
  };

  const getMediaPath = uda => {
    const media = uda?.media?.filePath || uda?.token?.media?.filePath;
    if (media) {
      if (isWebUrl(media)) {
        return media;
      }
      return Platform.select({
        android: `file://${media}`,
        ios: media,
      });
    }
    return null;
  };

  return (
    <View style={styles.bottomContainer}>
      {!showInfo && (
        <FlatList
          ref={bottomSliderRef}
          style={styles.imagesFlatList}
          contentContainerStyle={{ gap: 2 }}
          data={assets}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={()=><SizedBox width={extraPadding}/>}
          ListFooterComponent={()=><SizedBox width={extraPadding}/>}
          renderItem={({ item, index }) => {
            return (
              <Pressable onPress={() => scrollToIndex(index)}>
                <CustomImage uri={getMediaPath(item)}
                imageStyle={[
                    styles.bottomImages,
                    index == activeIndex && styles.activeBottomImage,
                  ]}
                  size={15}
                  hideOnError
                />
              </Pressable>
            );
          }}
        />
      )}
      <View style={styles.actionContainer}>
        <AppTouchable
          disabled={uda?.balance?.spendable < 1}
          style={[
            styles.roundCtaCtr,
            uda?.balance?.spendable < 1 && { opacity: 0 },
          ]}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate(NavigationRoutes.SCANASSET, {
                assetId: uda?.assetId,
                rgbInvoice: '',
                isUDA: true,
              }),
            )
          }>
          {theme.dark ? (
            <SendIcon height={22} width={22} />
          ) : (
            <SendIconLight height={22} width={22} />
          )}
        </AppTouchable>
        <View style={styles.bottomCenterCta}>
          <AppTouchable hitSlop={10} onPress={onShareAssetId}>
            {theme.dark ? (
              <ShareIcon height={22} width={22} />
            ) : (
              <ShareIconLight height={22} width={22} />
            )}
          </AppTouchable>
          <AppTouchable
            hitSlop={10}
            onPress={() => {
              setShowInfo(!showInfo);
            }}>
            {theme.dark ? (
              <InfoIcon height={22} width={22} />
            ) : (
              <InfoIconLight height={22} width={22} />
            )}
          </AppTouchable>
          <AppTouchable hitSlop={10} onPress={onCopyAssetId}>
            {theme.dark ? (
              <CopyIcon height={22} width={22} />
            ) : (
              <CopyIconLight height={22} width={22} />
            )}
          </AppTouchable>
        </View>
        <AppTouchable style={styles.roundCtaCtr} onPress={onShareImage}>
          {theme.dark ? (
            <DownloadIcon height={22} width={22} />
          ) : (
            <DownloadIconLight height={22} width={22} />
          )}
        </AppTouchable>
      </View>
    </View>
  );
};

const getStyles = (theme: AppTheme, insets) =>
  StyleSheet.create({
    // Bottom Container
    bottomContainer: {
      position: 'absolute',
      bottom:
        insets.bottom +
        Platform.select({
          ios: hp(5),
          android: hp(10),
        }),
      width: '100%',
      paddingHorizontal: wp(20),
      zIndex: 1000,
    },
    actionContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: '100%',
    },
    roundCtaCtr: {
      backgroundColor: theme.colors.roundedCtaBg,
      borderRadius: 100,
      padding: wp(13),
    },
    bottomCenterCta: {
      flexDirection: 'row',
      backgroundColor: theme.colors.roundedCtaBg,
      borderRadius: wp(100),
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: wp(23),
      paddingHorizontal: wp(23),
    },

    bottomImages: {
      height: wp(40),
      width: wp(20),
      borderRadius: 6,
      borderWidth:wp(2),
      borderColor:'transparent'
    },
    imagesFlatList: {
      marginBottom: hp(10),
      alignSelf: 'center',
    },
    activeBottomImage: {
      borderWidth: wp(2),
      marginHorizontal: wp(2),
      width: wp(40),
      borderColor: theme.dark ? Colors.White : Colors.Black,
    },
  });
