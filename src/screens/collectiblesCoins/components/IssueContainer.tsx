import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import TextField from 'src/components/TextField';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';

type issueContainerProps = {
  assetName: string;
  assetTicker: string;
  totalSupplyAmt: string;
  attatchFile: string;
  onChangeName: (text: string) => void;
  onChangeTicker: (text: string) => void;
  onChangeSupplyAmt: (text: string) => void;
  onChangeFile: (text: string) => void;
};

function IssueContainer(props: issueContainerProps) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const {
    assetName,
    assetTicker,
    totalSupplyAmt,
    attatchFile,
    onChangeName,
    onChangeTicker,
    onChangeSupplyAmt,
    onChangeFile,
  } = props;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextField
            value={assetName}
            onChangeText={onChangeName}
            placeholder={home.assetName}
            keyboardType={'default'}
            // returnKeyType={'done'}
            // onSubmitEditing={primaryOnPress}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextField
            value={assetTicker}
            onChangeText={onChangeTicker}
            placeholder={home.assetTicker}
            keyboardType={'default'}
            // returnKeyType={'done'}
            // onSubmitEditing={primaryOnPress}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextField
            value={totalSupplyAmt}
            onChangeText={onChangeSupplyAmt}
            placeholder={home.totalSupplyAmount}
            keyboardType={'default'}
            // returnKeyType={'done'}
            // onSubmitEditing={primaryOnPress}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextField
            value={attatchFile}
            onChangeText={onChangeFile}
            placeholder={home.attachFile}
            keyboardType={'default'}
            // returnKeyType={'done'}
            // onSubmitEditing={primaryOnPress}
          />
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => console.log('primary')}
          secondaryTitle={common.cancel}
          secondaryOnPress={() => console.log('secondary')}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    inputContainer: {
      marginVertical: hp(25),
    },
    inputWrapper: {
      marginVertical: hp(10),
    },
    buttonWrapper: {
      flex: 1,
      alignSelf: 'flex-end',
    },
  });
export default IssueContainer;
