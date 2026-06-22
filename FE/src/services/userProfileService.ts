import axiosInstance from './axiosInstance';

export interface BackendUserProfile {
  UserId: string;
  Email: string;
  FullName: string;
  AvatarUrl: string;
  Role: number;        // Enum UserRole (0 = USER, 1 = ADMIN)
  Status: number;      // Enum UserStatus (ví dụ: 0 = ACTIVE)
  CreatedAt: string;
  UpdatedAt: string;
  LastLoginAt: string;
}

// Đồng bộ 100% với: InitProfileResponseDto
export interface BackendInitProfileResponse {
  IsNewUser: boolean;
  Profile: BackendUserProfile;
}

// --- INTERFACES ĐÃ ĐƯỢC CHUẨN HÓA DÙNG Ở FRONTEND (CAMELCASE) ---
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: number;
  isAdmin: boolean;    // Flag bổ trợ check quyền nhanh ở FE
  status: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface UserProfileUpdate {
  fullName: string;
  // Bạn có thể mở rộng thêm các trường update khác nếu cần dựa theo nghiệp vụ sau này
}

export interface InitProfileResponse {
  isNewUser: boolean;
  profile: UserProfile;
}

class UserProfileService {
  // Hàm bổ trợ: Chuyển đổi dữ liệu từ PascalCase (C#) -> camelCase (ReactJS)
  private normalizeProfile(beProfile: BackendUserProfile): UserProfile {
    return {
      userId: beProfile?.UserId || '',
      email: beProfile?.Email || '',
      fullName: beProfile?.FullName || '',
      avatarUrl: beProfile?.AvatarUrl || '',
      role: beProfile?.Role ?? 0,          // Mặc định 0 (USER) nếu null
      isAdmin: beProfile?.Role === 1,      // Tự động hóa logic check admin dựa trên Enum từ BE
      status: beProfile?.Status ?? 0,
      createdAt: beProfile?.CreatedAt || '',
      updatedAt: beProfile?.UpdatedAt || '',
      lastLoginAt: beProfile?.LastLoginAt || '',
    };
  }

    async initProfile(): Promise<InitProfileResponse> {
    const response = await axiosInstance.post('/profile/init');
    const data = response.data;
    return {
      isNewUser: data.IsNewUser,
      profile: this.normalizeProfile(data.Profile)
    };
    
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
     const response = await axiosInstance.get('/profile/me');
    return this.normalizeProfile(response.data);
  }


  //Chưa dùng 
  // async updateUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
  //   const response = await axiosInstance.put('/users/me', data);
  //   return response.data;
  // }

  // async getAllUsers(): Promise<UserProfile[]> {
  //   const response = await axiosInstance.get('/admin/users');
  //   return response.data;
  // }

  // async getUserById(userId: string): Promise<UserProfile> {
  //   const response = await axiosInstance.get(`/admin/users/${userId}`);
  //   return response.data;
  // }
}

export default new UserProfileService();
