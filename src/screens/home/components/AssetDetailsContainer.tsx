import React from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import AssetChip from 'src/components/AssetChip';
import { wp, hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import RoundedCTA from 'src/components/RoundedCTA';
import DownloadIcon from 'src/assets/images/icon_buy.svg';

type assetDetailsProps = {
  tag: string;
};

function AssetDetailsContainer(props: assetDetailsProps) {
  const { tag } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.assetContainer}>
        <Image
          resizeMode="contain"
          source={{
            uri: 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x',
          }}
          style={styles.assetStyle}
        />
        <View style={styles.assetChipWrapper}>
          <AssetChip
            tagText={tag}
            backColor={theme.colors.cardBackground}
            tagColor={
              tag === 'COIN' ? theme.colors.accent2 : theme.colors.accent1
            }
          />
        </View>
        <View style={styles.downloadWrapper}>
          <RoundedCTA
            icon={<DownloadIcon />}
            buttonColor={theme.colors.primaryCTA}
            title={'Download'}
            width={wp(110)}
          />
        </View>
      </View>
      <ScrollView style={styles.scrollingContainer}>
        <AppText variant="body1" style={styles.assetDetailsText}>
          The Demogorgan
        </AppText>
        <AppText
          variant="body1"
          style={[styles.assetDetailsText, styles.assetInfoStyle]}>
          Humanoid creature is tall and has a gaping terrifying mouth in place
          of a face. It is shaped like a flower to reveal “petals” lined with
          sharp teeth. Furthermore, it possesses extraordinary supernatural
          abilities, such as telekinesis, superhuman strength, durability, and
          regenerative healing.
        </AppText>
        <View style={styles.contentWrapper}>
          <AppText
            variant="body2"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            Asset Type
          </AppText>
          <AppText
            variant="body1"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            RGB 20
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText
            variant="body2"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            Issued Supply
          </AppText>
          <AppText
            variant="body1"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            20,000,000
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText
            variant="body2"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            Issuance Date
          </AppText>
          <AppText
            variant="body1"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            23 January 2023
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText
            variant="body2"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            Asset Precision
          </AppText>
          <AppText
            variant="body1"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            0
          </AppText>
        </View>
        <View style={styles.contentWrapper}>
          <AppText
            variant="body2"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            Asset Ticker
          </AppText>
          <AppText
            variant="body1"
            style={[styles.assetDetailsText, styles.assetDetailsText2]}>
            BTC
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: '100%',
      flexDirection: 'column',
    },
    assetContainer: {
      height: '35%',
      position: 'relative',
      marginBottom: hp(20),
      borderBottomColor: 'gray',
      borderBottomWidth: 0.8,
    },
    assetStyle: {
      height: '100%',
      width: '100%',
    },
    assetChipWrapper: {
      position: 'absolute',
      zIndex: 999,
      left: 5,
      top: 10,
    },
    downloadWrapper: {
      position: 'absolute',
      zIndex: 999,
      right: 5,
      bottom: 10,
    },
    assetDetailsText: {
      color: theme.colors.bodyColor,
    },
    assetDetailsText2: {
      width: '50%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(5),
    },
    assetInfoStyle: {
      marginVertical: hp(10),
    },
    scrollingContainer: {
      height: '60%',
    },
  });
export default AssetDetailsContainer;