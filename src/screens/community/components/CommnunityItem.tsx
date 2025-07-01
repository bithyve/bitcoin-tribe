import { Image, StyleSheet, View } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import AppTouchable from 'src/components/AppTouchable'
import Identicon from 'src/components/Identicon'
import AppText from 'src/components/AppText'
import moment from 'moment'
import { Community, Contact, Message } from 'src/models/interfaces/Community'
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes'

const getStyles = (theme: AppTheme) => StyleSheet.create({
  roomItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  roomItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomName: {
    fontWeight: '600',
    color: theme.colors.headingColor,
    flex: 1,
  },
  roomTime: {
    fontSize: 12,
    color: theme.colors.secondaryHeadingColor,
    marginLeft: 10,
  },
  roomTimeUnread: {
    fontSize: 12,
    color: theme.colors.greenText,
    marginLeft: 10,
  },
  identiconView: {
    marginRight: 10,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  roomItemContent: {
    flex: 1,
  },
  roomLastMessage: {
    fontSize: 14,
    color: theme.colors.secondaryHeadingColor,
  },
  roomTimeContainer: {
    alignItems: 'flex-end',
  },
  containerUnread: {
    backgroundColor: theme.colors.greenText,
    borderRadius: 15,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    height: 25,
    width: 25,
  },
  textUnread: {
    color: 'black',
    fontSize: 11,
    fontWeight: '600',
  },
});

const CommunityItem = ({ item }: { item: Community }) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const contact = useQuery<Contact>(RealmSchema.Contact).filtered('contactKey = $0', item.with)[0];
  const lastMessage = useQuery<Message>(RealmSchema.Message).filtered('communityId = $0', item.id).sorted('createdAt', true)[0];
  const unreadMessages = useQuery<Message>(RealmSchema.Message).filtered('communityId = $0 AND unread = $1', item.id, true).length;
  const navigation = useNavigation();

  const handleOnPress = useCallback(() => {
    navigation.navigate(NavigationRoutes.CHAT, {
      communityId: item.id,
    });
  }, [navigation, item.id])

  const renderIcon = useMemo(() => {
    if (contact?.imageUrl) {
      return (
        <Image
          source={{ uri: contact.imageUrl }}
          style={styles.identiconView}
          resizeMode="cover"
        />
      );
    }
    return (
      <Identicon
        value={contact?.contactKey}
        style={styles.identiconView}
        size={45}
      />
    );
  }, [contact?.contactKey, contact?.imageUrl]);

  return (
    <AppTouchable
    style={styles.roomItem}
    onPress={handleOnPress}>
    <View style={styles.roomItemTop}>
      {renderIcon}
      <View style={styles.roomItemContent}>
        <View style={styles.row}>
          <AppText
            numberOfLines={1}
            variant="heading2"
            style={styles.roomName}>
            {contact.name}
          </AppText>
          <View style={styles.roomTimeContainer}>
          <AppText numberOfLines={1} style={unreadMessages > 0 ? styles.roomTimeUnread : styles.roomTime}>
            {moment(item.createdAt).format('HH:mm A')}
          </AppText>
          {unreadMessages > 0 && (
            <View style={styles.containerUnread}>
              <AppText numberOfLines={1} style={styles.textUnread}>
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </AppText>
            </View>
          )}
            
          </View>
        </View>
        <AppText numberOfLines={1} style={styles.roomLastMessage}>
          {lastMessage?.text || ''}
        </AppText>
      </View>
    </View>
  </AppTouchable>
  )
}
export default CommunityItem

