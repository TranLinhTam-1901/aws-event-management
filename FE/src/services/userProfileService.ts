import axiosInstance from './axiosInstance';
import axios from 'axios';


export interface BackendUserProfile {
  UserId?: string;
  userId?: string;
  Email?: string;
  email?: string;
  FullName?: string;
  fullName?: string;
  AvatarUrl?: string;
  avatarUrl?: string;
  Role?: number | string;
  role?: number | string;
  Status?: number | string;
  status?: number | string;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
  LastLoginAt?: string;
  lastLoginAt?: string;
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
  avatarUrl: string;
}

export interface AvatarUploadUrlResponse {
  uploadUrl: string;
  avatarUrl: string;
}

export interface InitProfileResponse {
  isNewUser: boolean;
  profile: UserProfile;
}

class UserProfileService {
  private normalizeStatus(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['active', 'enabled', '0'].includes(normalized)) return 0;
      if (['inactive', 'disabled', '1'].includes(normalized)) return 1;
      if (['blocked', 'block', 'locked', '2'].includes(normalized)) return 2;

      const parsedNumber = Number(normalized);
      if (!Number.isNaN(parsedNumber)) return parsedNumber;
    }

    return 0;
  }

  private normalizeRole(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'admin' || normalized === '1') return 1;
      if (normalized === 'user' || normalized === '0') return 0;
    }

    return 0;
  }

  // Hàm bổ trợ: Chuyển đổi dữ liệu từ PascalCase (C#) -> camelCase (ReactJS)
  private normalizeProfile(beProfile: BackendUserProfile): UserProfile {
    return {
      userId: beProfile?.UserId || beProfile?.userId || '',
      email: beProfile?.Email || beProfile?.email || '',
      fullName: beProfile?.FullName || beProfile?.fullName || '',
      avatarUrl: beProfile?.AvatarUrl || beProfile?.avatarUrl || '',
      role: this.normalizeRole(beProfile?.Role ?? beProfile?.role ?? 0),
      isAdmin: this.normalizeRole(beProfile?.Role ?? beProfile?.role ?? 0) === 1,
      status: this.normalizeStatus(beProfile?.Status ?? beProfile?.status ?? 0),
      createdAt: beProfile?.CreatedAt || beProfile?.createdAt || '',
      updatedAt: beProfile?.UpdatedAt || beProfile?.updatedAt || '',
      lastLoginAt: beProfile?.LastLoginAt || beProfile?.lastLoginAt || '',
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

  async updateUserProfile(data: UserProfileUpdate): Promise<UserProfile> {
    const response = await axiosInstance.put('/profile/me', data);
    return this.normalizeProfile(response.data.profile);
  }

  async getAvatarUploadUrl(contentType: string): Promise<AvatarUploadUrlResponse> {
    const response = await axiosInstance.get('/profile/avatar-upload-url', {
      params: { contentType }
    });
  
    return {
      uploadUrl: response.data.UploadUrl,
      avatarUrl: response.data.AvatarUrl
    };
  }

  async uploadAvatarToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type 
      }
    });
  }


  async getAllUsers(email?: string): Promise<UserProfile[]> {
    const response = await axiosInstance.get('/admin/users', {
      params: email ? { email } : undefined,
    });
    return response.data.map((user: BackendUserProfile) => this.normalizeProfile(user));
  }

  async updateUserStatus(userId: string, status: number): Promise<UserProfile> {
    const response = await axiosInstance.patch(`/admin/users/${userId}`, { status });
    return this.normalizeProfile(response.data);
  }
}

export default new UserProfileService();
