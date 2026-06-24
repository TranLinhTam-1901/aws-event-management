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
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  updateLocalProfile: (updatedFields: Partial<UserProfile>) => void;
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

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      setIsLoading(true);
      
      localStorage.setItem("remember_me", remember ? "true" : "false");

      // 1. Gọi Cognito xác thực tài khoản
      await cognitoAuthService.login(email, password);

      // 3. Gọi API khởi tạo profile (nếu chưa có) và nạp profile user từ DynamoDB lên state
      try {
        await userProfileService.initProfile();
      } catch (initError) {
        console.error("Init profile error inside context:", initError);
      }
      
      await checkAuth();
    } catch (error) {
      localStorage.removeItem("remember_me");
      console.error("Context login error:", error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await cognitoAuthService.logout();


      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");
      localStorage.removeItem("remember_me");
      
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("idToken");

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };


  const updateLocalProfile = (updatedFields: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...updatedFields,
      };
    });
  };

    useEffect(() => {
    const initAuth = async () => {
      // Quét xem thực tế trong các kho có tồn tại dấu vết phiên đăng nhập của Amplify không
      const hasLocalAmplify = Object.keys(localStorage).some(k => k.includes("LastAuthUser"));
      const hasSessionAmplify = Object.keys(sessionStorage).some(k => k.includes("LastAuthUser"));

     if (!hasLocalAmplify && !hasSessionAmplify) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");
      // localStorage.setItem("remember_me", "false");
      setUser(null);
      setIsLoading(false);
      return;
    }

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
        login,
        logout,
        checkAuth,
        updateLocalProfile,
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