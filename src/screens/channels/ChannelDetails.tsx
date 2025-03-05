import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import GradientView from 'src/components/GradientView';
import { AppTheme } from 'src/theme';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import PrimaryCTA from 'src/components/PrimaryCTA';
import Colors from 'src/theme/Colors';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import CloseChannelPopupContainer from './components/CloseChannelPopupContainer';
import InfoIcon from 'src/assets/images/infoIcon.svg';
import InfoIconLight from 'src/assets/images/infoIcon_light.svg';
import ChannelInfoModal from './components/ChannelInfoModal';

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
      alignItems: 'flex-end',
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
  const { node, channel: channelTranslations, common } = translations;
  const { channel } = route.params;
  const [visible, setVisible] = useState(false);
  const [visibleChannelInfo, setVisibleChannelInfo] = useState(false);

  const statusColors = {
    Opened: Colors.GOGreen,
    Opening: Colors.BrandeisBlue,
    Close: Colors.FireOpal,
    Closing: Colors.ChineseOrange,
    Pending: Colors.SelectiveYellow,
    Offline: Colors.ChineseWhite,
  };
  const getStatusColor = status => statusColors[status] || Colors.White;

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
      <AppHeader
        title={`${node.channelsTitle}`}
        rightIcon={isThemeDark ? <InfoIcon /> : <InfoIconLight />}
        onSettingsPress={() => setVisibleChannelInfo(true)}
      />
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
            {channelTranslations.status}
          </AppText>
          <AppText
            variant="body1"
            style={{ color: getStatusColor(channel.status) }}>
            {channel.status}
          </AppText>
        </GradientView>
        <View style={styles.contentWrapper}>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.assetLocalAmt}
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.assetLocalAmount}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.shortChannelld}
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
                {channelTranslations.capacitySat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.capacitySat}
              </AppText>
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                {channelTranslations.localBalanceMsat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.localBalanceMsat}
              </AppText>
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                {channelTranslations.outboundBalanceMsat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.outboundBalanceMsat}
              </AppText>
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                {channelTranslations.inboundBalanceMsat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.inboundBalanceMsat}
              </AppText>
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                {channelTranslations.nxtOutboundHtclLmtMsat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.nextOutboundHtlcLimitMsat}
              </AppText>
            </View>
          </>
          <>
            <View style={styles.channelDetailsWrapper}>
              <AppText variant="body2" style={styles.titleText}>
                {channelTranslations.nxtOutboundHtclMinMsat}
              </AppText>
              <AppText variant="body2" style={styles.valueText}>
                {channel.nextOutboundHtlcMinimumMsat}
              </AppText>
            </View>
          </>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.peerAlias}
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.peerAlias}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.ready}
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.ready ? 'True' : 'False'}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.isUsable}
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.isUsable ? 'True' : 'False'}
            </AppText>
          </View>
          <View style={styles.channelDetailsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.public}
            </AppText>
            <AppText variant="body2" style={styles.valueText}>
              {channel.public ? 'True' : 'False'}
            </AppText>
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.channelID}
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.channelId}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.fundingTXID}
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.fundingTxid}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.peerPubKey}
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.peerPubkey}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.shortChannelID}
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.shortChannelId ? channel.shortChannelId : 'null'}
            </AppText>
          </View>
          <View style={styles.channelIDsWrapper}>
            <AppText variant="body2" style={styles.titleText}>
              {channelTranslations.assetID}
            </AppText>
            <AppText variant="body2" style={styles.idValueText}>
              {channel.assetId}
            </AppText>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <PrimaryCTA
            title={channelTranslations.closeChannel}
            onPress={() => setVisible(true)}
            width={wp(160)}
            loading={false}
            disabled={false}
            height={hp(18)}
            textColor={theme.colors.closeChannelCTATitle}
            buttonColor={theme.colors.closeChannelCTA}
          />
        </View>
      </ScrollView>
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          backColor={theme.colors.errorPopupBackColor}
          borderColor={theme.colors.errorPopupBorderColor}
          onDismiss={() => setVisible(false)}>
          <CloseChannelPopupContainer
            title={channelTranslations.closeChannelPopupTitle}
            subTitle={channelTranslations.closeChannelPopupSubTitle}
            onPress={() => {
              setVisible(false);
              setTimeout(() => {
                closeChannelMutation.mutate({
                  channelId: channel.channelId,
                  peerPubKey: channel.peerPubkey,
                });
              }, 400);
            }}
          />
        </ResponsePopupContainer>
      </View>
      <View>
        <ChannelInfoModal
          visible={visibleChannelInfo}
          primaryCtaTitle={common.okay}
          primaryOnPress={() => setVisibleChannelInfo(false)}
        />
      </View>
    </ScreenContainer>
  );
};

export default ChannelDetails;
