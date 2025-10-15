import React, { useContext, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import AppHeader from 'src/components/AppHeader';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AppText from 'src/components/AppText';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ShowQr from 'src/assets/images/showQr.svg';
import ShowQrLight from 'src/assets/images/showQrLight.svg';


const STATIC_MEMBERS = [
  {
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    desc: 'Blockchain dev',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    name: 'Emma Johnson',
    desc: 'UI/UX designer',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/21.jpg',
    name: 'Michael Smith',
    desc: 'Full-stack engineer',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    name: 'Sophia Brown',
    desc: 'Product manager',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Liam Wilson',
    desc: 'DevOps engineer',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    desc: 'Blockchain dev',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    name: 'Emma Johnson',
    desc: 'UI/UX designer',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/21.jpg',
    name: 'Michael Smith',
    desc: 'Full-stack engineer',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    name: 'Sophia Brown',
    desc: 'Product manager',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Liam Wilson',
    desc: 'DevOps engineer',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    desc: 'Blockchain dev',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    name: 'Emma Johnson',
    desc: 'UI/UX designer',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/21.jpg',
    name: 'Michael Smith',
    desc: 'Full-stack engineer',
  },
  {
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    name: 'Sophia Brown',
    desc: 'Product manager',
  },
  {
    image: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Liam Wilson',
    desc: 'DevOps engineer',
  },
];

export const GroupInfo = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const [members, setMembers] = useState(STATIC_MEMBERS);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View>
        <AppText variant="heading3SemiBold">{item.name}</AppText>
        <AppText variant="caption" style={styles.desc}>
          {item.desc}
        </AppText>
      </View>
    </View>
  );

  const handleScan = () => {
    try {
      navigation.dispatch(
        CommonActions.navigate(NavigationRoutes.GROUPQR, {
          groupId: 'MOCK_GROUP_ID',
          groupImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/183px-Bitcoin.svg.png'
        }),
      );
    } catch (error) {
      console.error('Error navigating to scan screen:', error);
      Toast(common.failedToOpenScanner, true);
    }
  };

  const HeaderComponent = () => {
    return (
      <>
        <View style={styles.groupImageCtr}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/183px-Bitcoin.svg.png',
            }}
            style={styles.groupImage}
          />
        </View>

        <AppText variant="heading3SemiBold" style={styles.title}>
          {'MicroBT stocks trading'}
        </AppText>
        <AppText variant="body2" style={styles.subTitle}>
          {
            'Exploring the future of Bitcoin — one block, one idea, one conversation at a time.'
          }
        </AppText>
        <View style={styles.divider} />
        <AppText variant="body1Bold" style={{ marginBottom: hp(20) }}>
          {`${members.length} ${community.members}`}
        </AppText>
      </>
    );
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={community.groupInfo}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
        rightIcon={ theme.dark ?  <ShowQr />: <ShowQrLight/>}
        onSettingsPress={handleScan}
      />
      <View style={styles.bodyWrapper}>
        <FlatList
          ListHeaderComponent={HeaderComponent}
          data={members}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bodyWrapper: {
      flex: 1,
    },
    groupImageCtr: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: wp(10),
    },
    groupImage: {
      height: wp(150),
      width: wp(150),
    },
    title: {
      marginTop: hp(22),
      textAlign: 'center',
    },
    subTitle: {
      marginTop: hp(10),
      textAlign: 'center',
      paddingHorizontal: wp(20),
      color: theme.colors.secondaryHeadingColor,
    },
    divider: {
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.optionsCardGradient2,
      marginTop: hp(20),
      marginBottom: hp(16),
    },
    desc: {
      color: theme.colors.secondaryHeadingColor,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(15),
      marginBottom: hp(17),
    },
    avatar: {
      width: wp(50),
      height: wp(50),
      borderRadius: wp(50),
    },
  });
