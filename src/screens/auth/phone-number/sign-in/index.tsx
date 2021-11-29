import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Keyboard, Platform } from 'react-native';
import { Button, Text, Spinner } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { useAuth } from '../../../../hooks/use-auth';
import { useToast } from 'react-native-toast-notifications';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import RNOtpVerify from 'react-native-otp-verify';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CELL_COUNT = 6;

interface SignInByPhoneNumberParams {
  phoneNumber: string;
}

export default ({ route, navigation }): React.ReactElement => {
  const [restartListener, setRestartListener] = useState<boolean>(false);
  const [signInIsLoading, setSignInIsLoading] = React.useState<boolean>(false);
  const toast = useToast();

  const { phoneNumber } = route.params as SignInByPhoneNumberParams;

  const { signInByPhoneNumber, sendOtp } = useAuth();

  const [value, setValue] = useState<string>();
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const otpHandler = (message: string) => {
    const _value = /(\d{6})/g.exec(message)[1];
    setValue(_value);
    RNOtpVerify.removeListener();
    Keyboard.dismiss();
  };

  const sendOtpWithValidationHash = async via => {
    let validationHash = null;
    if (Platform.OS === 'android') {
      validationHash = await AsyncStorage.getItem('validationHash');
      if (!validationHash) {
        validationHash = (await RNOtpVerify.getHash())[0];
        AsyncStorage.setItem('validationHash', validationHash);
      }
    }
    sendOtp({ phoneNumber, via, validationHash });
    setRestartListener(listener => !listener);
    toast.show(
      via === 'whatsapp'
        ? 'Please confirm the code sent to your whatsapp account.'
        : 'Please confirm the code sent to your phone number by sms.',
    );
  };

  useEffect(() => {
    if (value && value.length === 6) {
      onSubmit();
    }
  }, [value]);

  useEffect(() => {
    sendOtpWithValidationHash('sms');
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNOtpVerify.getOtp().then(p => RNOtpVerify.addListener(otpHandler));

      return () => {
        RNOtpVerify.removeListener();
      };
    }
  }, [restartListener]);

  const onSubmit = async () => {
    try {
      setSignInIsLoading(true);
      await signInByPhoneNumber({ phoneNumber: phoneNumber, otpCode: value });
    } catch (err) {
      toast.show('User authentication failed due to invalid authentication code', { type: 'danger' });
    } finally {
      setSignInIsLoading(false);
    }
  };
  2;
  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        <View style={styles.headerContainer}></View>
        <View style={styles.formContainer}>
          <Text style={styles.signInLabel} category="s1" status="control">
            Enter the code received by sms or whatsapp
          </Text>
          <CodeField
            ref={ref}
            {...props}
            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
            autoFocus
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoCompleteType="postal-code"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />
          <View style={styles.resendContainer}>
            <Button appearance="ghost" status="info" onPress={() => sendOtpWithValidationHash('sms')}>
              Re-send code with sms
            </Button>
            <Button appearance="ghost" status="info" onPress={() => sendOtpWithValidationHash('whatsapp')}>
              Re-send code with whatsapp
            </Button>
          </View>
        </View>
        <Button
          style={styles.signInButton}
          size="giant"
          onPress={onSubmit}
          disabled={signInIsLoading}
          accessoryLeft={signInIsLoading ? () => <Spinner /> : null}
        >
          CONFIRM CODE
        </Button>
        <Button style={styles.signUpButton} appearance="ghost" status="control" onPress={onSignUpButtonPress}>
          Change phone number
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  resendContainer: {
    marginTop: 30,
  },
  signInLabel: {
    marginBottom: 30,
  },
  signInButton: {
    marginHorizontal: 16,
  },
  signUpButton: {
    marginVertical: 12,
  },
  codeFieldRoot: {
    width: '80%',
  },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#999',
    textAlign: 'center',
    marginHorizontal: 2,
    color: 'white',
  },
  focusCell: {
    borderColor: 'white',
  },
});
