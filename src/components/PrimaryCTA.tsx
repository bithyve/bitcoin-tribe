import * as React from 'react';
import { Button, useTheme } from 'react-native-paper';

function PrimaryCTA(props) {
  const theme = useTheme();
  return (
    <Button
      mode="contained"
      buttonColor={theme.colors.primaryCTA}
      onPress={() => console.log('Pressed')}>
      {props.title}
    </Button>
  );
}

export default PrimaryCTA;
