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
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';

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
    containerAmts: {
      flexDirection: 'row',
      marginVertical: hp(5),
    },
    text: {
      marginVertical: hp(3),
    },
    buttonWrapper: {
      marginTop: hp(20),
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
          <View>
            {Object.keys(channel).map(key => (
              <View style={styles.containerAmts}>
                <AppText style={styles.text} numberOfLines={1}>
                  {`${key.charAt(0).toUpperCase() + key.slice(1)}: `}
                </AppText>
                <AppText style={styles.text} numberOfLines={1}>
                  {`${channel[key]}`}
                </AppText>
              </View>
            ))}
          </View>
        </GradientView>

        <View style={styles.buttonWrapper}>
          <Buttons
            primaryTitle={'Close Channel'}
            primaryOnPress={() =>
              closeChannelMutation.mutate({
                channelId: channel.channelId,
                peerPubKey: channel.peerPubkey,
              })
            }
            disabled={false}
            width={wp(150)}
            primaryLoading={false}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ChannelDetails;
