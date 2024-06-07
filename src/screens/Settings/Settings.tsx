import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import PrimaryCTA from '../../components/PrimaryCTA';
import UserAvatar from '../../components/UserAvatar';
import Toast from '../../components/Toast';
import TextField from '../../components/TextField';
import TransactionCTA from '../../components/TransactionCTA';
import TextIcon from '../../assets/images/icon_bitcoin.svg';
import ScreenContainer from '../../components/ScreenContainer';
import { hp, wp } from '../../constants/responsive';

function HomeScreen() {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [input, setInput] = React.useState('');

  return (
    <ScreenContainer>
      <PrimaryCTA
        title="Save Changes"
        onPress={() => Toast('Account already created', true)}
      />
      <View style={{ margin: 5 }} />
      <PrimaryCTA
        title="Confirm & Proceed"
        onPress={() => setVisible(!visible)}
      />
      <View style={{ margin: 5 }} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <UserAvatar
          size={50}
          imageSource={
            'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          }
        />
        <UserAvatar
          size={70}
          imageSource={
            'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          }
        />
      </View>
      <TextField
        value={input}
        onChangeText={text => setInput(text)}
        placeholder="Enter Wallet Name"
        keyboardType={'default'}
      />
      <View style={{ margin: 5 }} />
      <TextField
        icon={<TextIcon />}
        value={input}
        onChangeText={text => setInput(text)}
        placeholder="Enter Amount"
        keyboardType={'number-pad'}
      />
      <View style={{ margin: 5 }} />
      <TransactionCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.primaryCTA}
        title={'Send'}
        height={hp(36)}
        width={wp(90)}
      />
      <View style={{ margin: 5 }} />
      <TransactionCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.recieveCTA}
        title={'Recieve'}
        height={hp(36)}
        width={wp(90)}
      />
      <View style={{ margin: 5 }} />
      <TransactionCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.buyCTA}
        title={'Buy'}
        height={hp(36)}
        width={wp(90)}
      />
      <View style={{ margin: 5 }} />
      <TransactionCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.primaryCTA}
        title={'Download'}
        height={hp(36)}
        width={wp(120)}
      />
    </ScreenContainer>
  );
}

export default HomeScreen;
