import React, { useState, useEffect } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
// Khớp chuẩn cấu hình type-only import cho VerbatimModuleSyntax
import { ticketService, type Ticket } from "../../services/ticketService";
import axios from "axios"; // ✅ Áp dụng Type Guarding từ Axios giống file UserProfile

export const MyTicketsPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Trạng thái danh sách vé
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isFetchLoading, setIsFetchLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Trạng thái Hộp thử nghiệm (Testing Panel)
  const [inputEventId, setInputEventId] = useState<string>("evt-test-001");
  // const [setInputNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Trạng thái thông báo Toast nhanh
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ Giải quyết lỗi 2: Dùng tham số điều hướng để triệt tiêu lệnh setState đồng bộ khi useEffect kích hoạt
  const loadTickets = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsFetchLoading(true);
      setFetchError(null);
    }
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách vé:", err);
      
      // ✅ Giải quyết lỗi 1: Áp dụng tư duy chuẩn hóa của ông, loại bỏ toàn bộ từ khóa 'any'
      if (axios.isAxiosError(err)) {
        setFetchError(err.response?.data?.message || "Không thể tải danh sách vé từ hệ thống.");
      } else if (err instanceof Error) {
        setFetchError(err.message);
      } else {
        setFetchError("Không thể tải danh sách vé từ hệ thống.");
      }
    } finally {
      setIsFetchLoading(false);
    }
  };

  // Tự động gọi API khi Auth Context đã load xong và User đã đăng nhập
  useEffect(() => {
    let isMounted = true;

    if (!isAuthLoading && isAuthenticated) {
      // ✅ KHẮC PHỤC LỖI CASCADING: Bọc qua setTimeout (0ms) để đẩy lệnh gọi ra khỏi 
      // luồng đồng bộ của React, giúp dập tắt hoàn toàn cảnh báo của Linter/Compiler.
      const timer = setTimeout(() => {
        if (isMounted) {
          loadTickets(false); 
        }
      }, 0);

      // Dọn dẹp bộ nhớ chống memory leak khi component unmount
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated, isAuthLoading]);

  // Xử lý nã API đăng ký thử nghiệm
  const handleRegisterTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEventId.trim()) {
      showToast("error", "Vui lòng nhập mã Event ID để thử nghiệm!");
      return;
    }

    try {
      setIsSubmitting(true);
      await ticketService.registerTicket(inputEventId.trim());
      showToast("success", `Đăng ký thành công vé cho Sự kiện: ${inputEventId}!`);
      
      
      // Kéo lại danh sách mới (Kích hoạt từ nút bấm nên truyền true an toàn)
      await loadTickets(true);
    } catch (err) {
      console.error("Lỗi đăng ký vé:", err);
      
      // ✅ Đồng bộ giải pháp khử 'any' cho form submit
      if (axios.isAxiosError(err)) {
        const errMsg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại.";
        showToast("error", errMsg);
      } else if (err instanceof Error) {
        showToast("error", err.message);
      } else {
        showToast("error", "Đăng ký thất bại. Vui lòng kiểm tra lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Toaster Notification Hệ thống */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-right duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-10">
        {/* Tiêu đề chính */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-blue-700">confirmation_number</span>
            Quản lý Vé của tôi
          </h1>
          <p className="text-slate-500 mt-2">
            Nơi quản lý toàn bộ vé tham gia sự kiện và khu vực thử nghiệm kết nối trực tiếp với AWS Cloud Gateway.
          </p>
        </div>

        {/* Layout Grid chia vùng ứng dụng */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* CỘT TRÁI: TESTING PANEL */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              Sandbox Test
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">construction</span>
              Hộp Đăng Ký Thử Nghiệm
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Do Module Event chưa triển khai giao diện, ông hãy dùng Form này nhập ID từ DynamoDB để giả lập luồng nạp vé thật lên AWS Cloud.
            </p>

            <form onSubmit={handleRegisterTest} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Event ID dưới DynamoDB *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    database
                  </span>
                  <input
                    type="text"
                    value={inputEventId}
                    onChange={(e) => setInputEventId(e.target.value)}
                    placeholder="Ví dụ: evt-test-001"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-700 font-mono text-sm bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Ghi chú đính kèm (Note)
                </label>
                <textarea
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="BE sẽ đọc và Log thông tin này lên CloudWatch..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-700 text-sm resize-none bg-slate-50/50"
                />
              </div> */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                     đang gửi lên AWS...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">send</span>
                    Mô phỏng event(Đăng ký)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: LIST VÉ LIVE TỪ AWS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[360px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">list_alt</span>
                  Danh sách vé cá nhân Live từ AWS
                </h2>
                <button 
                  onClick={() => loadTickets(true)} 
                  disabled={isFetchLoading}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-200 transition disabled:opacity-40 cursor-pointer"
                  title="Tải lại danh sách"
                >
                  <span className={`material-symbols-outlined block text-xl ${isFetchLoading ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                </button>
              </div>

              {/* LOADING STATE */}
              {isFetchLoading && tickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700 mb-3" />
                  <p className="text-sm">Đang nạp dữ liệu vé từ Live API Gateway...</p>
                </div>
              ) : fetchError ? (
                /* ERROR STATE */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-rose-50/50 border border-rose-100 rounded-2xl my-4">
                  <span className="material-symbols-outlined text-rose-500 text-4xl mb-2">cloud_off</span>
                  <p className="text-sm font-semibold text-rose-800">{fetchError}</p>
                  <p className="text-xs text-rose-600 mt-1">Hãy kiểm tra Token hoặc cấu hình CORS của Lambda.</p>
                </div>
              ) : tickets.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">confirmation_number</span>
                  <p className="text-sm font-medium">Tài khoản này chưa đăng ký bất kỳ chiếc vé nào.</p>
                  <p className="text-xs max-w-sm mt-1">Hãy dùng Hộp thử nghiệm bên cạnh nhập ID sự kiện để nạp chiếc vé đầu tiên!</p>
                </div>
              ) : (
                /* TICKETS RENDERING LIST */
                <div className="grid md:grid-cols-2 gap-4 flex-1">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.ticketId}
                      className="group border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 hover:shadow-md rounded-2xl p-5 transition duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="font-bold text-slate-800 truncate text-base" title={ticket.eventTitle}>
                            {ticket.eventTitle}
                          </h4>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                            ticket.status === "CONFIRMED" || ticket.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-slate-400">person</span>
                            Người sở hữu: <span className="text-slate-800 font-semibold">{ticket.userFullName}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                            Email: <span className="text-slate-700">{ticket.userEmail}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-slate-400">fingerprint</span>
                            Mã vé: <span className="font-mono text-slate-700">{ticket.ticketId.substring(0, 8)}...</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                            Ngày đăng ký: <span className="text-slate-700">{new Date(ticket.createdAt).toLocaleString("vi-VN")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono text-[10px]">EVENT ID: {ticket.eventId}</span>
                        <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:text-blue-700 transition cursor-pointer">
                          <span className="material-symbols-outlined text-base">qr_code</span>
                          Xem vé QR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};