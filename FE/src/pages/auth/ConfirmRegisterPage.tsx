import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { cognitoAuthService } from "../../services/cognitoAuthService";
import { useAuth } from "../../context/AuthContext";

export const ConfirmRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  const defaultEmail = location.state?.email || "";

  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !code) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mã OTP.");
      return;
    }

    try {
      setLoading(true);

      await cognitoAuthService.confirmRegister(email, code);

      setSuccessMessage("Xác thực tài khoản thành công! Đang chuyển hướng...");

      // Cập nhật auth context
      await checkAuth();

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.");
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
                Xác thực email
              </h1>
              <p className="text-slate-600">
                Nhập mã OTP được gửi đến email của bạn để xác thực tài khoản.
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

            <form onSubmit={handleConfirm} className="space-y-6">
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
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition tracking-widest text-center"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhập 6 chữ số từ email của bạn
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xác thực..." : "Xác thực tài khoản"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="w-full py-4 px-6 bg-white border border-slate-300 text-slate-800 font-medium rounded-xl hover:bg-slate-50 active:scale-[0.98] transition flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Quay lại đăng ký
              </button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-700 font-bold hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </section>

        <section className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          <div className="relative z-10 p-12 text-center max-w-lg space-y-8">
            <div className="inline-flex items-center justify-center p-5 bg-blue-700 rounded-2xl shadow-xl animate-bounce-slow">
              <span className="material-symbols-outlined text-6xl text-white">
                verified_user
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Xác thực Email
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Mã OTP đã được gửi đến email của bạn. Nhập mã này để hoàn tất
                quá trình đăng ký tài khoản.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  mail_outline
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Email Xác minh
                </p>
                <p className="text-sm text-white/70">
                  Kiểm tra hộp thư của bạn
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  gpp_good
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Bảo mật
                </p>
                <p className="text-sm text-white/70">
                  Tài khoản được bảo vệ
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