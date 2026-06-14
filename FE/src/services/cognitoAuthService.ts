import axiosInstance from './axiosInstance';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

class CognitoAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post('/auth/login', credentials);
    const { accessToken, refreshToken, expiresIn } = response.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return { accessToken, refreshToken, expiresIn };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async register(fullName: string, email: string, password: string): Promise<void> {
    await axiosInstance.post('/auth/register', { fullName, email, password });
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    const { accessToken, expiresIn } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    
    return { accessToken, refreshToken: refreshToken || '', expiresIn };
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export default new CognitoAuthService();
