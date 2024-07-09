import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import IssueContainer from './components/IssueContainer';

function IssueScreen() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;

  const [assetName, setAssetName] = useState('');
  const [assetTicker, setAssetTicker] = useState('');
  const [totalSupplyAmt, setTotalSupplyAmt] = useState('');
  const [attatchFile, setAttatchFile] = useState('');

  return (
    <ScreenContainer>
      <AppHeader title={home.issue} subTitle={home.issueSubTitle} />
      <IssueContainer
        assetName={assetName}
        assetTicker={assetTicker}
        totalSupplyAmt={totalSupplyAmt}
        attatchFile={attatchFile}
        onChangeName={text => setAssetName(text)}
        onChangeTicker={text => setAssetTicker(text)}
        onChangeSupplyAmt={text => setTotalSupplyAmt(text)}
        onChangeFile={text => setAttatchFile(text)}
      />
    </ScreenContainer>
  );
}
export default IssueScreen;
