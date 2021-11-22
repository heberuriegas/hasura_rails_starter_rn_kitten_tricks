import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spinner, StyleService } from '@ui-kitten/components';

const Loading = (): React.ReactElement => (
  <View style={styles.container}>
    <Spinner />
  </View>
);

export default Loading;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
