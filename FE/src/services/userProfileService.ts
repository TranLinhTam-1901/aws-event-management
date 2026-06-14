import axiosInstance from './axiosInstance';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  fullName: string;
  phone: string;
  organization: string;
}

class UserProfileService {
  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  }

  async updateUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
    const response = await axiosInstance.put('/users/me', data);
    return response.data;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  }
}

export default new UserProfileService();
