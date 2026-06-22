import React, { createContext, useContext, useEffect, useState } from "react";
import { cognitoAuthService } from "../services/cognitoAuthService";
import type { UserProfile } from "../services/userProfileService";
import userProfileService from "../services/userProfileService";

// interface User {
//   userId: string;
//   username: string;
//   email: string;
//   name?: string;
// }

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // (Giữ nguyên) 1. Kiểm tra trạng thái login của Cognito trước
      await cognitoAuthService.getCurrentUser();
      await cognitoAuthService.getAuthTokens();

      // ================= THAY THẾ ĐOẠN ĐỌC PAYLOAD CŨ BẰNG ĐOẠN NÀY =================
      // Gọi API Backend lấy Profile & Role thật từ DynamoDB thay vì tự suy ra ở FE
      const profile = await userProfileService.getCurrentUserProfile();
      setUser(profile);
      // ============================================================================

    } catch (error) {
      console.log("User not authenticated or profile fetch failed:", error); // Cập nhật log cho đúng nghĩa
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await cognitoAuthService.logout();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

    useEffect(() => {
    const initAuth = async () => {
        await checkAuth();
    };

    initAuth();
    }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};