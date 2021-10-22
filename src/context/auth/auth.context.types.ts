import { User } from '../../../types/user';
import { OAuthCredentials } from '../../../types/credentials';

export interface UserRegistrationByEmail {
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

export interface RegisterData {
  user?: User;
  credentials?: OAuthCredentials;
  errors?: SignUpByEmailErrors;
}

export type SignUpByEmail = (user: UserRegistrationByEmail) => Promise<void>;

export interface SignInByEmailParams {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export type SignInByEmail = (params: SignInByEmailParams) => Promise<boolean>;

export interface SignInByPhoneNumberParams {
  phoneNumber: string;
  otpCode: string;
}

export type SignInByPhoneNumber = (params: SignInByPhoneNumberParams) => Promise<boolean>;

export interface SignInByAssertionParams {
  assertion: string;
  provider: string;
}

export type SignInByAssertion = (params: SignInByAssertionParams) => Promise<boolean>;

export type SignOut = () => Promise<boolean>;

export interface AuthContextData {
  currentUser: User;
  setCurrentUser: (User) => void;
  isSignedIn: boolean;
  isLoading: boolean;
  userLoading: boolean;
  signUpByEmail: SignUpByEmail;
  signInByEmail: SignInByEmail;
  signInByPhoneNumber: SignInByPhoneNumber;
  signInByAssertion: SignInByAssertion;
  update(User): Promise<void>;
  signOut: SignOut;
  sendOtp(phoneNumber: String, via: String, validationHash?: String): Promise<void>;
}
