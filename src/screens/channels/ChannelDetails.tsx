import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import GradientView from 'src/components/GradientView';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { ProgressBar, useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import PrimaryCTA from 'src/components/PrimaryCTA';
import Colors from 'src/theme/Colors';

const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      backgroundColor: backColor,
      borderRadius: 20,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    statusValueText: {
      color: theme.colors.greenText,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    idValueText: {
      marginTop: hp(10),
      color: theme.colors.secondaryHeadingColor,
    },
    text: {
      marginVertical: hp(3),
    },
    buttonWrapper: {
      marginTop: hp(20),
      alignItems: 'flex-end'
    },
    contentWrapper: {
      width: '100%',
      padding: windowHeight > 670 ? hp(20) : hp(10),
      borderRadius: 20,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderStyle: 'dashed',
      marginVertical: hp(5),
    },
    channelDetailsWrapper: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: hp(10),
    },
    progressbarWrapper: {
      marginVertical: hp(10),
    },
    channelIDsWrapper: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      paddingVertical: hp(10),
    },
  });

const ChannelDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, theme.colors.ctaBackColor);
  const closeChannelMutation = useMutation(ApiHandler.closeChannel);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;
  const { channel } = route.params;

  const statusColors = {
    Open: Colors.GOGreen,
    Opening: Colors.BrandeisBlue,
    Close: Colors.FireOpal,
    Closing: Colors.ChineseOrange,
    Pending: Colors.SelectiveYellow,
    Offline: Colors.ChineseWhite,
  };
  const getStatusColor = (status) => statusColors[status] || Colors.ChineseWhite;

  useEffect(() => {
    if (closeChannelMutation.isSuccess) {
      navigation.goBack();
      Toast(node.channelCreatedMsg);
    } else if (closeChannelMutation.isError) {
      Toast(`${closeChannelMutation.error}`, true);
    }
  }, [closeChannelMutation.isError, closeChannelMutation.isSuccess]);

  return (
    <ScreenContainer>
      <AppHeader title={`${node.channelsTitle}`} />
      <ModalLoading visible={closeChannelMutation.isLoading} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <GradientView
          style={[styles.container]}
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}>
          <AppText variant="body1" style={styles.titleText}>
            Status :
          </AppText>
          <AppText variant="body1" style={{ color: getStatusColor(channel.status) }}>
            {channel.status}
          </AppText>
        </GradientView>
        <View style={styles.contentWrapper}>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Asset Local Amount:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.assetLocalAmount}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              ShortChannelld:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.shortChannelId ? channel.shortChannelId : 'null'}
            </AppText>
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                CapacitySat:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.capacitySat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.capacitySat}
                color={theme.colors.accent1}
              />
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                Local Balance Mast:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.localBalanceMsat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.localBalanceMsat}
                color={theme.colors.accent1}
              />
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                Outbound Balance Mast:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.outboundBalanceMsat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.outboundBalanceMsat}
                color={theme.colors.accent1}
              />
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                Inbound Balance Msat:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.inboundBalanceMsat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.inboundBalanceMsat}
                color={theme.colors.accent1}
              />
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                Next Outbound Htlc Limit Msat:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.nextOutboundHtlcLimitMsat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.nextOutboundHtlcLimitMsat}
                color={theme.colors.accent1}
              />
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                Next Outbound Htlc Minimum Msat:
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.nextOutboundHtlcMinimumMsat}
              </AppText>
            </View>
            <View style={styles.progressbarWrapper}>
              <ProgressBar
                progress={channel.nextOutboundHtlcMinimumMsat}
                color={theme.colors.accent1}
              />
            </View>
          </>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              PeerAlias:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.peerAlias}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Ready:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.ready ? 'True' : 'False'}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Is Usable:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.isUsable ? 'True' : 'False'}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Public:
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.public ? 'True' : 'False'}
            </AppText>
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Channel ID:
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.channelId}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Funding TXID:
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.fundingTxid}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Peer PubKey:
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.peerPubkey}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Short Channel ID:
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.shortChannelId ? channel.shortChannelId : 'null'}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              Asset ID:
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.assetId}
            </AppText>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <PrimaryCTA
            title={'Close Channel'}
            onPress={() =>
              closeChannelMutation.mutate({
                channelId: channel.channelId,
                peerPubKey: channel.peerPubkey,
              })
            }
            width={wp(150)}
            loading={false}
            disabled={false}
            height={hp(16)}
            textColor={theme.colors.closeChannelCTATitle}
            buttonColor={theme.colors.closeChannelCTA}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ChannelDetails;
