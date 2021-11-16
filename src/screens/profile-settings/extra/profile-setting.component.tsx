import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Layout, Text, LayoutProps, Input, InputProps } from '@ui-kitten/components';

export interface ProfileSettingProps extends LayoutProps {
  hint: string;
  editable?: boolean;
  inputProps?: InputProps;
  showErrorMessage?: boolean;
  errorMessage?: string;
}

export const ProfileSetting: React.FC<ProfileSettingProps> = ({
  style,
  hint,
  showErrorMessage,
  editable = true,
  errorMessage,
  inputProps,
  ...layoutProps
}): React.ReactElement => {
  return (
    <React.Fragment>
      <Layout level="1" {...layoutProps} style={style}>
        <View style={styles.container}>
          <Text appearance="hint" category="s1">
            {hint}
          </Text>
          <Input disabled={!editable} style={styles.input} textAlign={'right'} {...inputProps} />
        </View>
        {showErrorMessage && editable && (
          <View style={styles.errorText}>
            <Text status="danger">{errorMessage}</Text>
          </View>
        )}
      </Layout>
      <Divider />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'transparent',
    flexGrow: 1,
    borderWidth: 0,
    position: 'relative',
    left: 16,
  },
  errorText: {
    alignSelf: 'flex-end',
  },
});
