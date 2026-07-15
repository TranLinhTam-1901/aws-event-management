import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from "aws-amplify";
import { type KeyValueStorageInterface } from 'aws-amplify/utils'; // Interface quản lý storage từ Amplify
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';


// 1. Định nghĩa Custom Storage quản lý động cơ chế Remember Me
const dynamicAuthStorage: KeyValueStorageInterface = {
   async setItem(key: string, value: string): Promise<void> {
    // Kiểm tra trạng thái cờ remember_me được set từ LoginPage/AuthContext
    const isRemember = localStorage.getItem('remember_me') === 'true';
    
    if (isRemember) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
   const localValue = localStorage.getItem(key);
    if (localValue !== null) return localValue;
    
    return sessionStorage.getItem(key);
  },
  
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
  
  async clear(): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();
  }
};



Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
     loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_OAUTH_DOMAIN,
          scopes: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN],
          redirectSignOut: [import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT],
          responseType: 'code',
        }
      }
    },
  },
});
cognitoUserPoolsTokenProvider.setKeyValueStorage(dynamicAuthStorage);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
