import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { cognitoAuthService } from "../../services/cognitoAuthService";
import { useAuth } from "../../context/AuthContext";

interface LocationState {
  email: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  const { email } = (location.state as LocationState) || {};

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ tất cả các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      setLoading(true);

      // Gọi hàm reset password từ Cognito service
      await cognitoAuthService.confirmForgotPassword(email, otp, newPassword);

      setSuccessMessage("Mật khẩu của bạn đã được đặt lại thành công!");

      // Cập nhật auth context
      await checkAuth();

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage(
        "Không thể đặt lại mật khẩu. Vui lòng kiểm tra OTP và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[#faf8ff]">
        <section className="w-full md:w-1/2 flex items-center justify-center px-4 py-10 md:px-10 bg-white">
          <div className="max-w-md w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">
                Đặt lại mật khẩu mới
              </h1>
              <p className="text-slate-600">
                Nhập mã OTP được gửi đến email của bạn cùng với mật khẩu mới.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                {/* OTP Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã OTP
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">
                        verified
                      </span>
                    </div>

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition tracking-widest text-center"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhập 6 chữ số từ email của bạn
                  </p>
                </div>

                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mật khẩu mới
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                    </div>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu mới"}
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-300" />
                <span className="mx-4 text-xs text-slate-400 uppercase tracking-widest">
                  hoặc
                </span>
                <div className="flex-grow border-t border-slate-300" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-4 px-6 bg-white border border-slate-300 text-slate-800 font-medium rounded-xl hover:bg-slate-50 active:scale-[0.98] transition flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Quay lại đăng nhập
              </button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Chưa nhận được mã OTP?{" "}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-700 font-bold hover:underline"
              >
                Yêu cầu lại
              </button>
            </p>
          </div>
        </section>

        <section className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          <div className="relative z-10 p-12 text-center max-w-lg space-y-8">
            <div className="inline-flex items-center justify-center p-5 bg-blue-700 rounded-2xl shadow-xl animate-bounce-slow">
              <span className="material-symbols-outlined text-6xl text-white">
                shield_lock
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Bảo vệ Tài khoản
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Tạo mật khẩu mới mạnh để bảo vệ tài khoản của bạn. Hãy chắc chắn
                rằng mật khẩu khó đoán và duy nhất.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  key
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Mật khẩu Mạnh
                </p>
                <p className="text-sm text-white/70">
                  Ít nhất 8 ký tự
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  gpp_good
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Xác Minh OTP
                </p>
                <p className="text-sm text-white/70">
                  Từ email của bạn
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />
        </section>
      </main>
    </PublicLayout>
  );
};
