import React, { useMemo } from 'react';
import { Image, FlatList, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import { hp } from 'src/constants/responsive';
import { Media } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';

type mediaCarouselProps = {
  images: Media[];
  handleImageSelect: (item: Media) => void;
};

const MediaCarousel = (props: mediaCarouselProps) => {
  const { images, handleImageSelect } = props;
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <FlatList
      data={images}
      horizontal
      renderItem={({ item }) => (
        <>
          <AppTouchable
            style={styles.imageWrapper}
            onPress={() => handleImageSelect(item)}>
            <Image
              source={{
                uri: Platform.select({
                  android: `file://${item.filePath}`,
                  ios: item.filePath,
                }),
              }}
              style={styles.imagesStyle}
            />
          </AppTouchable>
        </>
      )}
    />
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    imagesStyle: {
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
    },
    imageWrapper: {
      height: 100,
      width: 100,
    },
  });

export default MediaCarousel;
