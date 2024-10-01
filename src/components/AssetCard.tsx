import * as React from 'react';
import { StyleSheet, View, Image, GestureResponderEvent } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from './AppText';
import AppTouchable from './AppTouchable';
import { AppTheme } from 'src/theme';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import GradientView from './GradientView';
import Capitalize from 'src/utils/capitalizeUtils';
import Identicon from 'react-native-identicon';
import AssetChip from './AssetChip';

type AssetCardProps = {
  image?: string;
  name?: string;
  ticker?: string;
  details?: string;
  tag?: string;
  assetId?: string;
  amount?: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const AssetCard = (props: AssetCardProps) => {
  const { image, name, ticker, tag, onPress, assetId, amount, details } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, amount.toString().length),
    [theme, amount],
  );
  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.assetImageWrapper}>
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              style={styles.imageStyle}
            />
          ) : (
            <View style={styles.identiconWrapper}>
              <View style={styles.identiconWrapper2}>
                <Identicon
                  value={assetId}
                  style={styles.identiconView}
                  size={110}
                />
              </View>
            </View>
          )}
          <View style={styles.tagWrapper}>
            <AssetChip
              tagText={Capitalize(tag)}
              backColor={
                tag === 'COIN' ? theme.colors.accent2 : theme.colors.accent1
              }
              tagColor={theme.colors.primaryCTAText}
            />
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.contentWrapper2}>
            <AppText variant="body2" numberOfLines={1} style={styles.nameText}>
              {name}
            </AppText>
            <AppText
              variant="caption"
              style={styles.amountText}
              numberOfLines={1}>
              {numberWithCommas(amount)}
            </AppText>
          </View>
          <AppText variant="caption" style={styles.titleText}>
            {ticker}
          </AppText>
        </View>
      </GradientView>
    </AppTouchable>
  );
};
const getStyles = (theme: AppTheme, amtLength) =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      margin: hp(6),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    imageStyle: {
      width: '100%',
      height: '100%',
      // borderRadius: 10,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    identiconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    identiconWrapper2: {
      borderColor: theme.colors.coinsBorderColor,
      borderWidth: 2,
      padding: 5,
      borderRadius: 110,
    },
    identiconView: {
      height: 110,
      width: 110,
      borderRadius: 110,
    },
    contentWrapper: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      height: '30%',
      justifyContent: 'center',
    },
    contentWrapper2: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleText: {
      lineHeight: hp(18),
      fontWeight: '400',
      color: theme.colors.secondaryHeadingColor,
    },
    textTicker: {
      // color: theme.colors.accent1,
      width: '100%',
      height: '100%',
      // textAlign: 'center',
      // marginTop: '40%',
      // fontSize: 35,
    },
    nameText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
      width: amtLength > 10 ? '25%' : '45%',
    },
    amountText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    detailsText: {
      fontWeight: '300',
      color: theme.colors.headingColor,
      flexWrap: 'wrap',
    },
    tagTextStyle: {
      lineHeight: hp(20),
    },
    assetImageWrapper: {
      width: '100%',
      height: '70%',
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 0.8,
    },
    tagWrapper: {
      position: 'absolute',
      left: 15,
      bottom: 10,
    },
  });
export default AssetCard;
