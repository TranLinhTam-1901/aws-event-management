import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { cognitoAuthService } from "../../services/cognitoAuthService";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    try {
      setLoading(true);

      // Gọi hàm forgot password từ Cognito service
      await cognitoAuthService.forgotPassword(email);

      navigate("/reset-password", {
        state: { email },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage(
        "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại."
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
                Đặt lại mật khẩu
              </h1>
              <p className="text-slate-600">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt
                lại mật khẩu.
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

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Địa chỉ Email
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">
                        mail
                      </span>
                    </div>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@vi-du.com"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}
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
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-700 font-bold hover:underline"
              >
                Tham gia ngay
              </button>
            </p>
          </div>
        </section>

        <section className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          <div className="relative z-10 p-12 text-center max-w-lg space-y-8">
            <div className="inline-flex items-center justify-center p-5 bg-blue-700 rounded-2xl shadow-xl animate-bounce-slow">
              <span className="material-symbols-outlined text-6xl text-white">
                lock_reset
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Khôi phục Tài khoản
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Không lo lắng, quá trình đặt lại mật khẩu rất đơn giản. Chúng
                tôi sẽ giúp bạn truy cập lại tài khoản của mình.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  mail_outline
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Email an toàn
                </p>
                <p className="text-sm text-white/70">
                  Xác minh qua email của bạn
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  verified_user
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Bảo mật
                </p>
                <p className="text-sm text-white/70">
                  Mật khẩu mới được bảo vệ
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
