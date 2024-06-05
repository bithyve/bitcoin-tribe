import * as React from 'react';
import { Chip } from 'react-native-paper';

import { StyleSheet } from 'react-native';

const TagUserAdded = props => (
  <Chip style={styles.container}>{props.tagText}</Chip>
);
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
  },
});
export default TagUserAdded;
