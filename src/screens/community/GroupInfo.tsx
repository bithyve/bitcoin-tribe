import React, { useContext, useRef, useState } from 'react';
import { Image, Keyboard, Platform, StyleSheet, View,FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import ScreenContainer from 'src/components/ScreenContainer';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import AppHeader from 'src/components/AppHeader';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import IconScan from 'src/assets/images/ic_scan.svg';
import IconScanLight from 'src/assets/images/ic_scan_light.svg';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import QrIcon from 'src/assets/images/icon_xpub.svg'

const qrSize = (windowWidth * 65) / 100;

const STATIC_MEMBERS = [
  {
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    desc: 'Blockchain dev'
  },
  {
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    name: 'Emma Johnson',
    desc: 'UI/UX designer'
  },
  {
    image: 'https://randomuser.me/api/portraits/men/21.jpg',
    name: 'Michael Smith',
    desc: 'Full-stack engineer'
  },
  {
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    name: 'Sophia Brown',
    desc: 'Product manager'
  },
  {
    image: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Liam Wilson',
    desc: 'DevOps engineer'
  },
];

export const GroupInfo = () => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { community, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const descriptionInputRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(100);
  const styles = getStyles(theme, inputHeight);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [members, setMembers] = useState(STATIC_MEMBERS);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <AppText style={styles.name}>{item.name}</AppText>
        <AppText style={styles.desc}>{item.desc}</AppText>
      </View>
    </View>
  );

  const handleScan = () => {
    try {
      navigation.dispatch( CommonActions.navigate(NavigationRoutes.GROUPQR, {
        groupName: 'Satoshi Squad',
        groupId:"MOCK_GROUP_ID"
      }));
    } catch (error) {
      console.error('Error navigating to scan screen:', error);
      Toast(common.failedToOpenScanner, true);
    }
  };

  

  return (
    <ScreenContainer>
      <AppHeader
        title={'Group Info'}
        subTitle={''}
        enableBack={true}
        onBackNavigation={() => navigation.goBack()}
        rightIcon={<QrIcon />}
        onSettingsPress={handleScan}
      />
      <View style={styles.bodyWrapper}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
          }}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/183px-Bitcoin.svg.png',
            }}
            style={{
              height: 100,
              width: 100,
            }}
          />
        </View>

        <AppText variant="heading3" style={styles.textInputTitle}>
          {'Satoshi Squad'}
        </AppText>
        <AppText variant="body2" style={[styles.textInputTitle]}>
          {'Exploring the future of Bitcoin — one block, one idea, one conversation at a time.'}
        </AppText>




            <AppText variant="heading3" style={{marginTop:20}}>
          {`${members.length} Members`}
        </AppText>
        <FlatList
      data={members}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />











       

        
      </View>
    </ScreenContainer>
  );
};

const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    bodyWrapper: {
      flex: 1,
    },
    
    textName: {
      marginTop: hp(20),
      textAlign: 'center',
    },
    menuWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(20),
      alignSelf: 'center',
      marginBottom: hp(30),
    },
    menuItem: {
      paddingHorizontal: wp(20),
      paddingVertical: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemText: {
      marginTop: hp(10),
      textAlign: 'center',
    },
    textInputTitle: {
      marginTop: hp(5),
      marginBottom: hp(3),
      textAlign:"center"
    },
    input: {
      marginVertical: hp(5),
    },
    descInput: {
      borderRadius: hp(20),
      height: Math.max(100, inputHeight),
    },
    imageWrapper: {},
    imageStyle: {
      height: hp(80),
      width: hp(80),
      borderRadius: hp(15),
      marginVertical: hp(10),
      marginHorizontal: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    addMediafileIconWrapper: {
      marginVertical: hp(5),
    },
    buttonWrapper: {
      marginTop: hp(30),
    },
     listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#555',
  },
  });
