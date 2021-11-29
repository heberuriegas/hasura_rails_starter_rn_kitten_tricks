import { User } from '../../../types/user';
import { OAuthCredentials } from '../../../types/credentials';
import { AuthorizeResult } from 'react-native-app-auth';

export interface UserSignUpByEmail {
  email: string;
  name: string;
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface SignUpByEmailErrors {
  email?: string[];
  name?: string[];
  username?: string[];
  password?: string[];
  passwordConfirmation?: string[];
}

export interface SignUpData {
  user?: User;
  credentials?: OAuthCredentials;
  errors?: SignUpByEmailErrors;
}

export type SignUpByEmail = (user: UserSignUpByEmail) => Promise<void>;

export interface UserSignUpByPhoneNumber {
  phoneNumber: string;
}

export type SignUpByPhoneNumber = (user: UserSignUpByPhoneNumber) => Promise<SignUpData>;

export interface UserSignInByEmail {
  email: string;
  password: string;
}

export type SignInByEmail = (params: UserSignInByEmail) => Promise<void>;

export interface UserForgotPassword {
  email: string;
}

export interface ForgotPasswordData {
  user?: UserForgotPassword;
}

export type ForgotPassword = (user: UserForgotPassword) => Promise<void>;

export interface SignInByPhoneNumberParams {
  phoneNumber: string;
  otpCode: string;
  validationHash?: string;
}

export type SignInByPhoneNumber = (params: SignInByPhoneNumberParams) => Promise<void>;

export interface SignInByAssertionParams {
  assertion: string;
  provider: string;
}

export interface SendOtpParams {
  phoneNumber: string;
  via?: string;
  validationHash?: string;
}

export type SendOtp = (params: SendOtpParams) => Promise<void>;

export type SignInByAssertion = (params: SignInByAssertionParams) => Promise<void>;

export type SignInByOAuth2 = (authState: AuthorizeResult) => Promise<void>;

export type SignOut = () => Promise<void>;

export type UpdateUserParams = Omit<User, 'id' | 'phoneNumber' | 'email' | 'avatar' | 'createdAt' | 'updatedAt'>;

export type UpdateUser = (user: UpdateUserParams) => Promise<User>;

export interface AuthContextData {
  currentUser: User;
  displayName: string;
  refreshUser: () => void;
  setCurrentUser: (User) => void;
  isSignedIn: boolean;
  userLoading: boolean;
  signUpByEmail: SignUpByEmail;
  signUpByPhoneNumber: SignUpByPhoneNumber;
  signInByEmail: SignInByEmail;
  forgotPassword: ForgotPassword;
  signInByPhoneNumber: SignInByPhoneNumber;
  signInByAssertion: SignInByAssertion;
  signInByOAuth2: SignInByOAuth2;
  updateUser: UpdateUser;
  signOut: SignOut;
  sendOtp: SendOtp;
}
