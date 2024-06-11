import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import UserAvatar from 'src/components/UserAvatar';
import PrimaryCTA from 'src/components/PrimaryCTA';
import Toast from 'src/components/Toast';
import TextField from 'src/components/TextField';
import RoundedCTA from 'src/components/RoundedCTA';
import TextIcon from 'src/assets/images/icon_bitcoin.svg';
import ScreenContainer from 'src/components/ScreenContainer';
import { wp } from 'src/constants/responsive';

function HomeScreen() {
  const theme = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [input, setInput] = React.useState('');

  return (
    <ScreenContainer>
      <PrimaryCTA
        title="Save"
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
      <RoundedCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.primaryCTA}
        title={'Send'}
      />
      <View style={{ margin: 5 }} />
      <RoundedCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.accent2}
        title={'Recieve'}
        width={wp(90)}
      />
      <View style={{ margin: 5 }} />
      <RoundedCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.accent1}
        title={'Buy'}
      />
      <View style={{ margin: 5 }} />
      <RoundedCTA
        icon={<TextIcon />}
        buttonColor={theme.colors.primaryCTA}
        title={'Download'}
      />
    </ScreenContainer>
  );
}

export default HomeScreen;
