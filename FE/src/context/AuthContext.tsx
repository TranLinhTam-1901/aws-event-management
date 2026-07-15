import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cognitoAuthService } from "../services/cognitoAuthService";
import type { UserProfile } from "../services/userProfileService";
import userProfileService from "../services/userProfileService";
import { Hub } from "aws-amplify/utils";

const ADMIN_CONTACT_EMAIL = import.meta.env.VITE_ADMIN_CONTACT_EMAIL || "admin@eventmanagement.com";
const BLOCKED_ACCOUNT_MESSAGE = `Tài khoản của bạn đã bị khóa. Vui lòng liên hệ qua email ${ADMIN_CONTACT_EMAIL} để được mở lại.`;
const BLOCKED_ACCOUNT_MESSAGE_KEY = "blocked_account_message";

const shouldSkipBlockedAuthCheck = () => Boolean(sessionStorage.getItem(BLOCKED_ACCOUNT_MESSAGE_KEY));

const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

const isBlockedAccountError = (error: unknown) => {
  if (!error) return false;

  const status = (error as { response?: { status?: number } })?.response?.status;
  const message = String(
    (error as { response?: { data?: { message?: string; Message?: string } } })?.response?.data?.message
    || (error as { response?: { data?: { message?: string; Message?: string } } })?.response?.data?.Message
    || (error as { message?: string })?.message
    || ""
  );

  return status === 403 && /blocked|block/i.test(message);
};

const isBlockedProfileStatus = (profile: UserProfile | null | undefined) => {
  if (!profile) return false;

  const status = profile.status;
  return status === 2 || String(status).toLowerCase() === 'blocked';
};

const persistBlockedMessage = () => {
  sessionStorage.setItem(BLOCKED_ACCOUNT_MESSAGE_KEY, BLOCKED_ACCOUNT_MESSAGE);
};

const clearBlockedMessage = () => {
  sessionStorage.removeItem(BLOCKED_ACCOUNT_MESSAGE_KEY);
};

const ensureProfileIsNotBlocked = async (
  profile: UserProfile | null | undefined,
  handleBlockedAccount: () => Promise<void>
) => {
  if (isBlockedProfileStatus(profile)) {
    await handleBlockedAccount();
    throw new Error("ACCOUNT_BLOCKED", { cause: new Error("User profile status is BLOCKED") });
  }
};


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

  const handleBlockedAccount = useCallback(async () => {
    persistBlockedMessage();

    try {
      await cognitoAuthService.logout();
    } catch (logoutError) {
      console.error("Logout after blocked account failed:", logoutError);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("remember_me");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("idToken");
    setUser(null);
    setIsLoading(false);
  }, []);

  const checkAuth = useCallback(async () => {
    if (shouldSkipBlockedAuthCheck()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      await cognitoAuthService.getCurrentUser();
      await cognitoAuthService.getAuthTokens();

      const profile = await userProfileService.getCurrentUserProfile();
      await ensureProfileIsNotBlocked(profile, handleBlockedAccount);
      if (isBlockedProfileStatus(profile)) {
        await handleBlockedAccount();
        redirectToLogin();
        return;
      }

      setUser(profile);
    } catch (error) {
      if (isBlockedAccountError(error)) {
        await handleBlockedAccount();
        redirectToLogin();
        return;
      }

      console.log("User not authenticated or profile fetch failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [handleBlockedAccount]);

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      setIsLoading(true);
      clearBlockedMessage();
      
      localStorage.setItem("remember_me", remember ? "true" : "false");

      // 1. Gọi Cognito xác thực tài khoản
      await cognitoAuthService.login(email, password);

      try {
  const initResponse = await userProfileService.initProfile();
  await ensureProfileIsNotBlocked(initResponse.profile, handleBlockedAccount);
} catch (initError) {
  // 1. Kiểm tra nếu nó đúng là một Error object
  if (initError instanceof Error) {
    if (isBlockedAccountError(initError) || initError.message === "ACCOUNT_BLOCKED") {
      await handleBlockedAccount();
      
      // 2. Ném ra Error mới kèm theo cause gốc một cách hợp lệ
      throw new Error("ACCOUNT_BLOCKED");
    }
  }
  // Đừng quên ném lại lỗi gốc nếu không rơi vào trường hợp Blocked để tránh nuốt lỗi
  throw initError;
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

      // 1. Đăng ký Hub Listener để bắt sự kiện đăng nhập thành công từ Google Redirect
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          console.log("Hub: Google OAuth Sign-In thành công!");
          try {
            // Đồng bộ khởi tạo profile lên DynamoDB nếu đây là user Google mới
            const initResponse = await userProfileService.initProfile();
            await ensureProfileIsNotBlocked(initResponse.profile, handleBlockedAccount);
          } catch (initError) {
            if (initError instanceof Error && initError.message === "ACCOUNT_BLOCKED") {
              throw initError;
            }
            console.error("Init profile error during OAuth:", initError);
          }
          await checkAuth(); // Lấy profile mới nhất về set state cho React re-render
          break;
        case "signInWithRedirect_failure":
          console.error("Hub: Lỗi trong quá trình redirect OAuth", payload.data);
          setIsLoading(false);
          break;
      }
    });


    const initAuth = async () => {

      const urlParams = new URLSearchParams(window.location.search);
      const hasOauthCode = urlParams.has("code") || window.location.hash.includes("access_token");

      if (hasOauthCode) {
        // Nếu có 'code', tức là Amplify đang xử lý bắt tay đổi Token ngầm.
        // Giữ isLoading = true và DỪNG LẠI, để Hub Listener phía trên lo nốt phần còn lại.
        setIsLoading(true);
        return;
      }

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
    return () => unsubscribe();
    }, [checkAuth]);

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