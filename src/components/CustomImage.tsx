import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import ImageError from 'src/assets/images/ImageError.svg';
import Colors from 'src/theme/Colors';

type CustomImageProps = {
  uri: string;
  imageStyle: FastImageProps['style'];
  size?: number;
  hideOnError?: boolean;
};

export const CustomImage = ({
  uri,
  imageStyle,
  size = 80,
  hideOnError = false,
}: CustomImageProps) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);
  return (
    <>
      {!error ? (
        <FastImage
          source={{ uri }}
          style={imageStyle}
          onLoadStart={() => {
            setError(false);
            setImageLoading(true);
          }}
          onLoadEnd={() => {
            setImageLoading(false);
          }}
          onError={() => {
            setError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <View style={[styles.errorCtr, imageStyle]}>
          {hideOnError ? null : <ImageError />}
        </View>
      )}

      {imageLoading && (
        <View style={styles.loaderOverlay}>
          <LottieView
            source={require('../assets/images/jsons/imageLoader.json')}
            style={{
              height: size,
              width: size,
            }}
            autoPlay
            loop
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCtr: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.CharcoalGray,
    overflow: 'hidden',
  },
});
