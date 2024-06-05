import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

type TagUserAddedProps = {
  tagText: string;
};
const TagUserAdded = (props: TagUserAddedProps) => (
  <Chip style={styles.container}>{props.tagText}</Chip>
);
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
  },
});
export default TagUserAdded;
