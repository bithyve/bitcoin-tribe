import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

type AssetChipProps = {
  tagText: string;
};
const AssetChip = (props: AssetChipProps) => (
  <Chip style={styles.container}>{props.tagText}</Chip>
);
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
  },
});
export default AssetChip;
