import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { ticketService, type Ticket } from "../../services/ticketService";
import axios from "axios";

export const MyTicketsPage: React.FC = () => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isFetchLoading, setIsFetchLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [inputEventId, setInputEventId] = useState<string>("43613581-6512-45ee-afba-fca4d5fdd933");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [showQr, setShowQr] = useState(false);
    const [selectedQr, setSelectedQr] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState("");

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

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

            if (axios.isAxiosError(err)) {
                setFetchError(
                    err.response?.data?.message ||
                    "Không thể tải danh sách vé từ hệ thống."
                );
            } else if (err instanceof Error) {
                setFetchError(err.message);
            } else {
                setFetchError("Không thể tải danh sách vé từ hệ thống.");
            }
        } finally {
            setIsFetchLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (!isAuthLoading && isAuthenticated) {
            const timer = setTimeout(() => {
                if (isMounted) {
                    loadTickets(false);
                }
            }, 0);

            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, [isAuthenticated, isAuthLoading]);

    const handleRegisterTest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputEventId.trim()) {
            showToast("error", "Vui lòng nhập mã Event ID để thử nghiệm!");
            return;
        }

        try {
            setIsSubmitting(true);
            await ticketService.registerTicket(inputEventId.trim());
            showToast(
                "success",
                `Đăng ký thành công vé cho Sự kiện: ${inputEventId}!`
            );

            await loadTickets(true);
        } catch (err) {
            console.error("Lỗi đăng ký vé:", err);

            if (axios.isAxiosError(err)) {
                const errMsg =
                    err.response?.data?.message ||
                    "Đăng ký thất bại. Vui lòng kiểm tra lại.";
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

    const handleViewQr = async (ticket: Ticket) => {
        if (!ticket.ticketId) {
            showToast("error", "Vé không có Ticket ID.");
            return;
        }

        try {
            const qr = await QRCode.toDataURL(ticket.ticketId, {
                width: 260,
                margin: 2,
            });

            setSelectedQr(qr);
            setSelectedTicketId(ticket.ticketId);
            setShowQr(true);
        } catch (error) {
            console.error("Lỗi tạo QR:", error);
            showToast("error", "Không thể tạo mã QR.");
        }
    };

    const handleDownloadCertificate = async (ticket: Ticket) => {
        try {
            const data = await ticketService.getCertificate(ticket.ticketId);

            if (data.success && data.downloadUrl) {
                showToast("success", "Đang mở chứng chỉ PDF...");
                window.open(data.downloadUrl, "_blank");
                await loadTickets(true);
            } else {
                showToast("error", data.message || "Không thể tải chứng chỉ.");
            }
        } catch (error) {
            console.error("Lỗi tải chứng chỉ:", error);

            if (axios.isAxiosError(error)) {
                showToast(
                    "error",
                    error.response?.data?.message || "Không thể tải chứng chỉ."
                );
            } else {
                showToast("error", "Không thể tải chứng chỉ.");
            }
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

            {toast && (
                <div
                    className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-right duration-300 ${toast.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    <span className="material-symbols-outlined text-xl">
                        {toast.type === "success" ? "check_circle" : "error"}
                    </span>
                    {toast.message}
                </div>
            )}

            {showQr && (
                <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center relative">
                        <button
                            onClick={() => setShowQr(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Mã QR vé
                        </h3>

                        <p className="text-xs text-slate-500 mb-5">
                            Đưa mã này cho ban tổ chức để quét điểm danh.
                        </p>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 inline-block">
                            <img
                                src={selectedQr}
                                alt={`QR ${selectedTicketId}`}
                                className="w-64 h-64 object-contain"
                            />
                        </div>

                        <p className="mt-4 text-xs text-slate-500 break-all">
                            Ticket ID:
                            <br />
                            <b className="text-slate-800">{selectedTicketId}</b>
                        </p>

                        <a
                            href={selectedQr}
                            download={`${selectedTicketId}.png`}
                            className="mt-5 inline-flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-medium transition"
                        >
                            <span className="material-symbols-outlined text-xl">
                                download
                            </span>
                            Tải QR
                        </a>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-blue-700">
                            confirmation_number
                        </span>
                        Quản lý Vé của tôi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Nơi quản lý toàn bộ vé tham gia sự kiện và khu vực thử nghiệm kết
                        nối trực tiếp với AWS Cloud Gateway.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                            Sandbox Test
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">
                                construction
                            </span>
                            Hộp Đăng Ký Thử Nghiệm
                        </h3>

                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Do Module Event chưa triển khai giao diện, ông hãy dùng Form này
                            nhập ID từ DynamoDB để giả lập luồng nạp vé thật lên AWS Cloud.
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
                                        <span className="material-symbols-outlined text-xl">
                                            send
                                        </span>
                                        Mô phỏng event(Đăng ký)
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[360px] flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-700">
                                        list_alt
                                    </span>
                                    Danh sách vé cá nhân Live từ AWS
                                </h2>

                                <button
                                    onClick={() => loadTickets(true)}
                                    disabled={isFetchLoading}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-200 transition disabled:opacity-40 cursor-pointer"
                                    title="Tải lại danh sách"
                                >
                                    <span
                                        className={`material-symbols-outlined block text-xl ${isFetchLoading ? "animate-spin" : ""
                                            }`}
                                    >
                                        refresh
                                    </span>
                                </button>
                            </div>

                            {isFetchLoading && tickets.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700 mb-3" />
                                    <p className="text-sm">
                                        Đang nạp dữ liệu vé từ Live API Gateway...
                                    </p>
                                </div>
                            ) : fetchError ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-rose-50/50 border border-rose-100 rounded-2xl my-4">
                                    <span className="material-symbols-outlined text-rose-500 text-4xl mb-2">
                                        cloud_off
                                    </span>
                                    <p className="text-sm font-semibold text-rose-800">
                                        {fetchError}
                                    </p>
                                    <p className="text-xs text-rose-600 mt-1">
                                        Hãy kiểm tra Token hoặc cấu hình CORS của Lambda.
                                    </p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-16">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
                                        confirmation_number
                                    </span>
                                    <p className="text-sm font-medium">
                                        Tài khoản này chưa đăng ký bất kỳ chiếc vé nào.
                                    </p>
                                    <p className="text-xs max-w-sm mt-1">
                                        Hãy dùng Hộp thử nghiệm bên cạnh nhập ID sự kiện để nạp
                                        chiếc vé đầu tiên!
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4 flex-1">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket.ticketId}
                                            className="group border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 hover:shadow-md rounded-2xl p-5 transition duration-200 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <h4
                                                        className="font-bold text-slate-800 truncate text-base"
                                                        title={ticket.eventTitle}
                                                    >
                                                        {ticket.eventTitle}
                                                    </h4>

                                                    <span
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${ticket.status === "CONFIRMED" ||
                                                                ticket.status === "SUCCESS"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-amber-100 text-amber-800"
                                                            }`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                                                    <p className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-base text-slate-400">
                                                            person
                                                        </span>
                                                        Người sở hữu:
                                                        <span className="text-slate-800 font-semibold">
                                                            {ticket.userFullName}
                                                        </span>
                                                    </p>

                                                    <p className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-base text-slate-400">
                                                            mail
                                                        </span>
                                                        Email:
                                                        <span className="text-slate-700">
                                                            {ticket.userEmail}
                                                        </span>
                                                    </p>

                                                    <p className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-base text-slate-400">
                                                            fingerprint
                                                        </span>
                                                        Mã vé:
                                                        <span className="font-mono text-slate-700">
                                                            {ticket.ticketId.substring(0, 8)}...
                                                        </span>
                                                    </p>

                                                    <p className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-base text-slate-400">
                                                            calendar_today
                                                        </span>
                                                        Ngày đăng ký:
                                                        <span className="text-slate-700">
                                                            {new Date(ticket.createdAt).toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                                <span className="font-mono text-[10px]">
                                                    EVENT ID: {ticket.eventId}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    {ticket.status === "CHECKED_IN" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadCertificate(ticket)}
                                                            className="flex items-center gap-1 text-emerald-600 font-semibold hover:text-emerald-800 transition cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                workspace_premium
                                                            </span>
                                                            Tải chứng chỉ
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewQr(ticket)}
                                                        className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 transition cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            qr_code
                                                        </span>
                                                        Xem QR
                                                    </button>
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