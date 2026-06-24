import React, { useState, useRef } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import userProfileService from "../../services/userProfileService";
import type { UserProfile } from "../../services/userProfileService";
import axios from "axios";
// ========================================================
// COMPONENT 1: FORM CHỈNH SỬA (Tách riêng để reset state bằng KEY)
// ========================================================


interface ProfileFormProps {
  user: UserProfile;
  updateLocalProfile: (data: { fullName: string; avatarUrl: string }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, updateLocalProfile }) => {  // Khởi tạo trực tiếp từ props, KHÔNG cần dùng useEffect để đồng bộ ngược lại nữa
  const [fullName, setFullName] = useState(user.fullName || "");
  const [previewAvatar, setPreviewAvatar] = useState(user.avatarUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Kích thước ảnh không được vượt quá 2MB." });
        return;
      }
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      let finalAvatarUrl = user.avatarUrl; 

      if (selectedFile) {
        setMessage({ type: "success", text: "Đang tải ảnh lên hệ thống đám mây..." });
        const s3Response = await userProfileService.getAvatarUploadUrl(selectedFile.type);
        await userProfileService.uploadAvatarToS3(s3Response.uploadUrl, selectedFile);
        finalAvatarUrl = s3Response.avatarUrl; 
      }

      setMessage({ type: "success", text: "Đang tiến hành lưu thông tin..." });
      await userProfileService.updateUserProfile({
        fullName: fullName.trim(),
        avatarUrl: finalAvatarUrl,
      });

      updateLocalProfile({
        fullName: fullName.trim(),
        avatarUrl: finalAvatarUrl,
      });

      setSelectedFile(null);
      setMessage({ type: "success", text: "Hồ sơ cá nhân đã được cập nhật thành công!" });
   } catch (error) { // Để trống hoặc dùng (error: unknown)
      console.error("Lỗi cập nhật profile:", error);
      
      let errorMessage = "Đã xảy ra lỗi trong quá trình lưu thông tin.";
      
      // Kiểm tra nếu error thực sự là lỗi trả về từ Axios API
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        // Nếu là lỗi code thông thường (ví dụ lỗi logic javascript)
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
  } finally {
        setIsSaving(false);
      }
    };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
      {/* Khu vực Avatar */}
      <div className="p-8 flex flex-col items-center justify-center bg-slate-50/50">
        <div className="relative group">
          {previewAvatar ? (
            <img
              src={previewAvatar}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-md">
              {(fullName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          
          <button
            type="button"
            disabled={isSaving}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />

        <button
          type="button"
          disabled={isSaving}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
        >
          Thay đổi ảnh
        </button>
        <p className="text-xs text-slate-400 mt-2 text-center">Định dạng JPG, JPEG, PNG tối đa 2MB</p>
      </div>

      {/* Form thông tin */}
      <form onSubmit={handleSaveProfile} className="p-8 md:col-span-2 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                : "bg-rose-50 text-rose-800 border border-rose-100"
            }`}
          >
            <span className="material-symbols-outlined">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Địa chỉ Email</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 text-sm select-none">
              <span className="material-symbols-outlined text-lg">mail</span>
              {user.email}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                badge
              </span>
              <input
                type="text"
                id="fullName"
                disabled={isSaving}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Vai trò tài khoản</label>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-md">
                {user.role === 1 ? "shield_person" : "person"}
              </span>
              {user.role === 1 ? "Administrator" : "Thành viên"}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-800 hover:shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              <>
                Lưu thay đổi
                <span className="material-symbols-outlined text-lg">save</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ========================================================
// COMPONENT 2: TRANG CHÍNH (QUẢN LÝ LAYOUT & AUTH LOADING)
// ========================================================
export const UserProfilePage: React.FC = () => {
  const { user, isLoading: isAuthLoading, updateLocalProfile } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản và hình ảnh đại diện của bạn.</p>
        </div>

        {user ? (
          /* Sử dụng chiêu thức "key" của React. 
            Khi `user.email` thay đổi từ rỗng sang có thật, React tự hủy form cũ 
            và khởi tạo lại form mới, giúp nạp data thẳng vào useState mà không cần dùng useEffect gán đè.
          */
          <ProfileForm 
            key={user.email} 
            user={user} 
            updateLocalProfile={updateLocalProfile} 
          />
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
            Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};