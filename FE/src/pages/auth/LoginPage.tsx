import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { signInWithRedirect } from "aws-amplify/auth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Nếu hệ thống đã check auth xong (isLoading === false) và xác nhận đã login
    if (!isLoading && isAuthenticated && user) {
      console.log("User đã login, tự động đá ra khỏi trang login. Role:", user.role);
      
      if (user.role === 1) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password, remember);

    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Đăng nhập thất bại. Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };


  // Logic xử lý đăng nhập bằng Google (OAuth 2.0 Chống State-loss)
  const handleGoogleLogin = async () => {
    try {
      setErrorMessage("");
      
      // Chiến lược UX: Ép cứng trạng thái remember_me lưu xuống localStorage vật lý
      // trước khi toàn bộ State của ứng dụng React bị hủy để điều hướng sang Google Domain.
      localStorage.setItem('remember_me', 'true');
      
      // Kích hoạt lệnh chuyển hướng đến Identity Provider (Google) qua Cognito Hosted UI
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error("Google redirect login error:", error);
      setErrorMessage("Không thể kết nối với dịch vụ đăng nhập Google.");
    }
  };

  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[#faf8ff]">
        <section className="w-full md:w-1/2 flex items-center justify-center px-4 py-10 md:px-10 bg-white">
          <div className="max-w-md w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">
                Đăng nhập Người tham gia
              </h1>
              <p className="text-slate-600">
                Vui lòng đăng nhập vào tài khoản của bạn để xem vé và tham gia
                các sự kiện mới nhất.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Mật khẩu
                    </label>

                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />

                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập vào tài khoản"}
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
                onClick={handleGoogleLogin}
                className="w-full py-4 px-6 bg-white border border-slate-300 text-slate-800 font-medium rounded-xl hover:bg-slate-50 active:scale-[0.98] transition flex items-center justify-center gap-3"
              >
                <span className="text-lg font-bold text-blue-600">G</span>
                Tiếp tục với Google
              </button>

              
            </form>

            <p className="text-center text-sm text-slate-600">
              Chưa có tài khoản tham gia?{" "}
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
                qr_code_2
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Khám phá & Trải nghiệm
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Dễ dàng tìm kiếm các sự kiện hấp dẫn, nhận vé QR điện tử và lưu
                giữ chứng chỉ tham gia ngay trên điện thoại của bạn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  confirmation_number
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Vé điện tử
                </p>
                <p className="text-sm text-white/70">
                  Check-in nhanh chóng qua QR
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-left">
                <span className="material-symbols-outlined text-blue-200 mb-2">
                  workspace_premium
                </span>
                <p className="text-xs text-white uppercase tracking-wider font-semibold">
                  Chứng chỉ
                </p>
                <p className="text-sm text-white/70">
                  Chứng nhận tham gia sự kiện
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