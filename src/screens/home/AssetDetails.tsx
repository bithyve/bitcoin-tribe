import React from 'react';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import AssetDetailsContainer from './components/AssetDetailsContainer';

function AssetDetails() {
  return (
    <ScreenContainer>
      <AppHeader enableBack={true} />
      <AssetDetailsContainer />
    </ScreenContainer>
  );
}

export default AssetDetails;
