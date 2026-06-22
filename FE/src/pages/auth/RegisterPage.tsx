import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { cognitoAuthService } from "../../services/cognitoAuthService";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      case: /[A-Z]/.test(password) && /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const strengthCount = Object.values(passwordRules).filter(Boolean).length;

  const getStrengthColor = (index: number) => {
    if (index >= strengthCount) return "bg-slate-200";
    if (strengthCount === 1) return "bg-red-500";
    if (strengthCount === 2) return "bg-orange-400";
    if (strengthCount === 3) return "bg-yellow-400";
    return "bg-emerald-500";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password || !confirmPassword) {
      setErrorMessage(
        "Vui lòng nhập đầy đủ email, mật khẩu và xác nhận mật khẩu."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Vui lòng đồng ý với điều khoản sử dụng.");
      return;
    }

    try {
      setLoading(true);

      const result = await cognitoAuthService.register(
        email,
        password,
        email,
        undefined
      );

      console.log("Register success:", result);

      navigate("/confirm-register", {
        state: { email },
      });
    } catch (error) {
      console.error("Register error:", error);
      setErrorMessage(
        "Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu chưa đúng yêu cầu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="min-h-[calc(100vh-64px)] bg-[#faf8ff] flex overflow-hidden">
        <section className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10 md:px-8">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">
                Chào mừng bạn mới.
              </h1>
              <p className="text-slate-600">
                Tạo tài khoản để đăng ký sự kiện, nhận vé QR và tải chứng chỉ
                tham gia.
              </p>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium hover:bg-slate-50 transition"
            >
              <span className="text-lg font-bold text-blue-600">G</span>
              Tiếp tục với Google
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-300" />
              <span className="mx-4 text-xs text-slate-400 uppercase tracking-widest">
                hoặc bằng email
              </span>
              <div className="flex-grow border-t border-slate-300" />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Mật khẩu
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1 mt-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition ${getStrengthColor(
                        index
                      )}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Yêu cầu bảo mật
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <PasswordRule checked={passwordRules.length}>
                    Ít nhất 8 ký tự
                  </PasswordRule>
                  <PasswordRule checked={passwordRules.case}>
                    Chữ hoa & chữ thường
                  </PasswordRule>
                  <PasswordRule checked={passwordRules.number}>
                    Có chữ số
                  </PasswordRule>
                  <PasswordRule checked={passwordRules.special}>
                    Ký tự đặc biệt
                  </PasswordRule>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <label className="text-sm text-slate-600">
                  Tôi đồng ý với{" "}
                  <a className="text-blue-700 hover:underline" href="#">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a className="text-blue-700 hover:underline" href="#">
                    Chính sách riêng tư
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Đang đăng ký..." : "Tham gia ngay"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-700 font-medium hover:underline"
              >
                Đăng nhập tại đây
              </button>
            </p>
          </div>
        </section>

        <section className="hidden lg:flex w-1/2 bg-blue-700 relative flex-col items-center justify-center p-16 overflow-hidden">
          <div className="relative z-10 w-full max-w-lg">
            <div className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>

                <div className="text-xs font-mono text-white/70 bg-black/20 px-3 py-1 rounded">
                  ve-dien-tu.eventhub.cloud
                </div>
              </div>

              <div className="space-y-5">
                <IllustrationStep icon="🔎" titleWidth="w-32" lineWidth="w-48" />
                <IllustrationStep icon="🎟️" titleWidth="w-24" lineWidth="w-40" />
                <IllustrationStep icon="🏅" titleWidth="w-40" lineWidth="w-32" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-black/10 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-white/60">Trạng thái vé</div>
                  <div className="text-xl text-white font-bold">Sẵn sàng</div>
                </div>

                <div className="bg-black/10 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-white/60">Số lượng sự kiện</div>
                  <div className="text-xl text-white font-bold">1,000+</div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center space-y-4">
              <h2 className="text-white text-3xl font-bold">
                Mọi sự kiện trong tầm tay.
              </h2>
              <p className="text-blue-100 text-lg">
                Dễ dàng theo dõi, tham gia và lưu giữ những khoảnh khắc học
                tập, giải trí đáng nhớ cùng cộng đồng.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute top-1/4 -left-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
        </section>
      </main>
    </PublicLayout>
  );
};

type PasswordRuleProps = {
  checked: boolean;
  children: React.ReactNode;
};

const PasswordRule: React.FC<PasswordRuleProps> = ({ checked, children }) => {
  return (
    <div
      className={`flex items-center gap-2 ${
        checked ? "text-emerald-600" : "text-slate-500"
      }`}
    >
      <span>{checked ? "✓" : "○"}</span>
      {children}
    </div>
  );
};

type IllustrationStepProps = {
  icon: string;
  titleWidth: string;
  lineWidth: string;
};

const IllustrationStep: React.FC<IllustrationStepProps> = ({
  icon,
  titleWidth,
  lineWidth,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>

      <div className="flex-grow space-y-2">
        <div className={`h-2 ${titleWidth} bg-white/50 rounded`} />
        <div className={`h-2 ${lineWidth} bg-white/20 rounded`} />
      </div>
    </div>
  );
};