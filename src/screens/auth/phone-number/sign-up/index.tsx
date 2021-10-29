import React from 'react';
import { View } from 'react-native';
import { Button, CheckBox, StyleService, Text, useStyleSheet, Icon, Spinner } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { PhoneIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { useAuth } from '../../../../hooks/use-auth';
import { useFormik } from 'formik';
import { useToast } from 'react-native-toast-notifications';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(Yup);
import 'yup-phone';
import { UserSignUpByPhoneNumber } from '../../../../context/auth/auth.context.types';
import PhoneInput from 'react-native-phone-number-input';

const SignUpScreen = ({ navigation }): React.ReactElement => {
  const [signUpIsLoading, setSignUpIsLoading] = React.useState<boolean>(false);
  const toast = useToast();

  const { signUpByPhoneNumber } = useAuth();

  const styles = useStyleSheet(themedStyles);

  const validationSchema = Yup.object({
    phoneNumber: Yup.string().phone().required('Required'),
  });

  const { values, touched, errors, submitForm, handleChange, handleBlur } = useFormik<UserSignUpByPhoneNumber>({
    initialValues: {
      phoneNumber: '',
      // termsAccepted: '',
    },
    validationSchema,
    onSubmit: async (_values, { setErrors, resetForm }) => {
      setSignUpIsLoading(true);
      try {
        const data = await signUpByPhoneNumber(_values);
        resetForm();
        navigation && navigation.navigate('SignIn', { phoneNumber: data.user.phoneNumber });
      } catch (err) {
        const dataErrors = err?.response?.data?.errors;
        if (dataErrors) {
          setErrors(dataErrors);
        } else {
          console.error(err);
          toast.show('User could not be created', {
            type: 'warning',
          });
        }
      } finally {
        setSignUpIsLoading(false);
      }
    },
  });

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            Hello
          </Text>
          <Text category="s1" status="control">
            Sign up to your account
          </Text>
        </View>
        <View style={styles.formContainer}>
          <PhoneInput
            defaultCode="MX"
            containerStyle={{ width: '100%', height: 60 }}
            codeTextStyle={{ fontSize: 18 }}
            textInputStyle={{ height: 60, paddingVertical: 0, fontSize: 18 }}
            textContainerStyle={{ height: 60, paddingVertical: 0 }}
            withShadow
            autoFocus
            placeholder="0000000000"
            value={values.phoneNumber}
            onChangeFormattedText={handleChange('phoneNumber')}
          />
          {touched.phoneNumber && errors.phoneNumber ? (
            <Text status="danger">{errors.phoneNumber as string}</Text>
          ) : null}
          {/* <CheckBox
            style={styles.termsCheckBox}
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.termsAccepted}
          >
            {renderCheckboxLabel}
          </CheckBox>
          {touched.termsAccepted && errors.termsAccepted ? (
            <Text status="danger">
              {errors.termsAccepted}
            </Text>
          ) : null} */}
        </View>
        <Button
          disabled={signUpIsLoading}
          accessoryLeft={signUpIsLoading ? () => <Spinner /> : null}
          style={styles.signUpButton}
          size="giant"
          onPress={submitForm}
        >
          SIGN UP
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  formInput: {
    marginTop: 16,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: 'text-control-color',
    marginLeft: 10,
  },
  signUpButton: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  signInButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
});
