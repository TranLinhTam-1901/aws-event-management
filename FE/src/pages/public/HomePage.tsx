import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();


  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role === 1) {
      console.log("Phát hiện tài khoản Admin tại trang chủ, đang điều hướng về Dashboard...");
      navigate("/admin/analytics", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);


  if (isLoading || (isAuthenticated && user?.role === 1)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  return (


    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(#2563eb_0.5px,transparent_0.5px)] bg-[size:24px_24px] opacity-10" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-lg">
                  verified_user
                </span>
                TRẢI NGHIỆM THAM GIA HOÀN HẢO
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Tham gia Sự kiện, Workshop và Đào tạo dễ dàng
              </h2>

              <p className="text-lg text-slate-600 max-w-xl">
                Đăng ký trực tuyến, nhận vé QR ngay lập tức, điểm danh nhanh
                chóng và tải chứng chỉ tham gia sau sự kiện.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate("/events")}
                  className="bg-blue-700 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg"
                >
                  Khám phá sự kiện
                  <span className="material-symbols-outlined">explore</span>
                </button>

                <button 
                  onClick={() => navigate("/my-tickets")}
                  className="bg-white border border-slate-200 px-8 py-4 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined">
                    confirmation_number
                  </span>
                  Vé của tôi
                </button>
              </div>

              <div className="flex flex-wrap gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">
                    qr_code_2
                  </span>
                  Vé QR tức thì
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">
                    workspace_premium
                  </span>
                  Chứng chỉ điện tử
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-300 blur-3xl opacity-20 rounded-full" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-200 blur-3xl opacity-30 rounded-full" />

              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
                  alt="Event"
                  className="rounded-2xl w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ["app_registration", "Đăng ký dễ dàng"],
              ["qr_code_scanner", "Vé QR tức thì"],
              ["timer", "Điểm danh nhanh"],
              ["workspace_premium", "Chứng chỉ điện tử"],
            ].map(([icon, title]) => (
              <div
                key={title}
                className="p-8 rounded-2xl border border-slate-200 text-center hover:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-blue-700">
                    {icon}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="mb-14 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Trải nghiệm tham gia tiện lợi
              </h2>
              <p className="text-lg text-slate-600">
                Tất cả những gì bạn cần để tận hưởng sự kiện một cách trọn vẹn
                nhất.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                ["search", "Khám phá sự kiện"],
                ["assignment_turned_in", "Đăng ký trực tuyến"],
                ["qr_code", "Quản lý vé QR"],
                ["notifications_active", "Nhắc hẹn sự kiện"],
                ["check_circle", "Điểm danh sự kiện"],
                ["download", "Tải chứng chỉ"],
              ].map(([icon, title]) => (
                <div
                  key={title}
                  className="group p-10 rounded-3xl bg-white border border-slate-200 hover:shadow-xl"
                >
                  <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-700 group-hover:text-white">
                    <span className="material-symbols-outlined text-3xl">
                      {icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{title}</h3>
                  <p className="text-slate-600">
                    Hỗ trợ người tham gia thao tác nhanh chóng, thuận tiện và dễ
                    theo dõi trong toàn bộ quá trình sự kiện.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto bg-blue-700 text-white rounded-[40px] p-12 lg:p-16 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Bạn đã sẵn sàng cho trải nghiệm tiếp theo?
            </h2>
            <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
              Tham gia cùng cộng đồng hàng ngàn người đam mê học hỏi và khám phá
              những sự kiện tuyệt vời nhất.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate("/register")}
                className="bg-white text-blue-700 px-10 py-4 rounded-xl font-medium"
              >
                Bắt đầu ngay
              </button>
              <button 
                onClick={() => navigate("/events")}
                className="border border-white px-10 py-4 rounded-xl font-medium hover:bg-white/10"
              >
                Xem sự kiện sắp tới
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};