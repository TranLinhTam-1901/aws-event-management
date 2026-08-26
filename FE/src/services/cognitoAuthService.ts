import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

export const cognitoAuthService = {
  register: async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ) => {
    return await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName,
          ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        },
      },
    });
  },

  confirmRegister: async (email: string, code: string) => {
    return await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  },

  login: async (email: string, password: string) => {
    return await signIn({
      username: email,
      password,
    });
  },

  logout: async () => {
    return await signOut();
  },

  getCurrentUser: async () => {
    return await getCurrentUser();
  },

  getAccessToken: async () => {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString();
  },

  forgotPassword: async (email: string) => {
    return await resetPassword({
      username: email,
    });
  },

  confirmForgotPassword: async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    return await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
  },

    getIdToken: async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  },

  getAuthTokens: async () => {
    const session = await fetchAuthSession();

    return {
      accessToken: session.tokens?.accessToken?.toString(),
      idToken: session.tokens?.idToken?.toString(),
      idTokenPayload: session.tokens?.idToken?.payload,
      
    };
  }
};