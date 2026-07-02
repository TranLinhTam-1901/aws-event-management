import React, { useState } from "react";
import { QRScanner } from "../../components/attendance/QRScanner";
import {
    ticketService,
    type Ticket,
    type CheckInResponse,
} from "../../services/ticketService";

export const CheckInPage: React.FC = () => {
    const [ticketId, setTicketId] = useState("");
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [result, setResult] = useState<CheckInResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const getCheckInErrorMessage = (error: any) => {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message;

        // Lỗi nghiệp vụ từ Backend
        if (status === 400 || status === 409) {
            if (
                apiMessage?.toLowerCase().includes("checked") ||
                apiMessage?.toLowerCase().includes("check-in")
            ) {
                return "Vé này đã được check-in trước đó. Không cần check-in lại.";
            }

            return apiMessage || "Không thể check-in vé này.";
        }

        if (status === 404) {
            return "Không tìm thấy vé.";
        }

        // Không nhận được response => lỗi mạng/API
        if (!error.response) {
            return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.";
        }

        // Lỗi hệ thống
        return "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
    };

    const handleSearchTicket = async (id?: string) => {
        const finalTicketId = (id || ticketId).trim();

        if (!finalTicketId) {
            setResult({
                success: false,
                message: "Vui lòng nhập Ticket ID.",
                ticketId: "",
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const foundTicket = await ticketService.getTicketById(finalTicketId);

            setTicket(foundTicket);
            setTicketId(finalTicketId);
        } catch (error) {
            console.error(error);

            setTicket(null);
            setResult({
                success: false,
                message: "Không tìm thấy Ticket.",
                ticketId: finalTicketId,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = async (value: string) => {
        await handleSearchTicket(value);

        const scannedTicketId = value.trim();
        if (!scannedTicketId) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await ticketService.checkInTicket(scannedTicketId, "QR");
            setResult(data);

            if (data.success) {
                setTicket((prev) =>
                    prev
                        ? {
                            ...prev,
                            status: "CHECKED_IN",
                            eventId: data.eventId || prev.eventId,
                            eventTitle: data.eventTitle || prev.eventTitle,
                            userId: data.userId || prev.userId,
                            userEmail: data.userEmail || prev.userEmail,
                            userFullName: data.userFullName || prev.userFullName,
                        }
                        : prev
                );
            }
        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                message: getCheckInErrorMessage(error),
                ticketId: scannedTicketId,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (method: "QR" | "MANUAL") => {
        if (!ticket) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await ticketService.checkInTicket(ticket.ticketId, method);
            setResult(data);
            if (data.success) {
                setTicket((prev) =>
                    prev
                        ? {
                            ...prev,
                            status: "CHECKED_IN",
                            eventId: data.eventId || prev.eventId,
                            eventTitle: data.eventTitle || prev.eventTitle,
                            userId: data.userId || prev.userId,
                            userEmail: data.userEmail || prev.userEmail,
                            userFullName: data.userFullName || prev.userFullName,
                        }
                        : prev
                );
            }
        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                message: getCheckInErrorMessage(error),
                ticketId: ticket.ticketId,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Check-in vé</h1>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Quét QR</h2>

                    <QRScanner onScanSuccess={handleScanSuccess} />

                    {loading && (
                        <p className="mt-4 text-blue-600 font-medium">
                            Đang xử lý...
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Nhập Ticket ID</h2>

                    <label className="block text-sm font-semibold mb-2">
                        Ticket ID
                    </label>

                    <div className="flex gap-3">
                        <input
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            placeholder="Nhập Ticket ID..."
                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3"
                        />

                        <button
                            type="button"
                            onClick={() => handleSearchTicket()}
                            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold"
                        >
                            Kiểm tra
                        </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                        Dùng khi camera không quét được QR. QR và nhập tay đều dùng chung Ticket ID.
                    </p>
                </div>
            </div>

            {ticket && (
                <div className="mt-6 bg-white rounded-2xl shadow border border-slate-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Thông tin vé</h2>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <p>
                            <b>Ticket ID:</b>
                            <br />
                            <span className="break-all">{ticket.ticketId}</span>
                        </p>

                        <p>
                            <b>Trạng thái:</b>
                            <br />
                            {ticket.status}
                        </p>

                        <p>
                            <b>Người tham dự:</b>
                            <br />
                            {ticket.userFullName}
                        </p>

                        <p>
                            <b>Email:</b>
                            <br />
                            {ticket.userEmail}
                        </p>

                        <p>
                            <b>Sự kiện:</b>
                            <br />
                            {ticket.eventTitle}
                        </p>

                        <p>
                            <b>Thời gian:</b>
                            <br />
                            {ticket.eventStartTime}
                        </p>

                        <p>
                            <b>Địa điểm:</b>
                            <br />
                            {ticket.eventLocation}
                        </p>

                        <p>
                            <b>Event ID:</b>
                            <br />
                            {ticket.eventId}
                        </p>
                    </div>

                    {ticket?.status !== "CHECKED_IN" ? (
                        <div className="mt-6 flex flex-col md:flex-row gap-3">
                            <button
                                type="button"
                                disabled
                                className="flex-1 bg-green-400 text-white py-3 rounded-xl font-bold cursor-not-allowed"
                            >
                                Quét QR để check-in
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCheckIn("MANUAL")}
                                disabled={loading}
                                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-60"
                            >
                                {loading ? "Đang check-in..." : "Check-in thủ công"}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">

                            <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-center">
                                <div className="text-green-700 text-lg font-bold">
                                    ✅ Vé đã được check-in
                                </div>

                                <div className="text-sm text-green-600 mt-1">
                                    Người tham dự đã hoàn tất check-in và có thể tải chứng nhận.
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const data = await ticketService.getCertificate(ticket.ticketId);

                                        if (data.success) {
                                            window.open(data.downloadUrl, "_blank");
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        alert("Không thể tải chứng nhận.");
                                    }
                                }}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold"
                            >
                                📄 Tải chứng nhận PDF
                            </button>

                        </div>
                    )}
                </div>
            )}

            {result && (
                <div
                    className={`mt-6 rounded-xl border p-5 ${result.success
                            ? "bg-green-50 border-green-300 text-green-800"
                            : "bg-red-50 border-red-300 text-red-800"
                        }`}
                >
                    <h2 className="text-xl font-bold mb-3">{result.message}</h2>

                    <p>
                        <b>Ticket ID:</b> {result.ticketId}
                    </p>

                    {result.eventTitle && (
                        <p>
                            <b>Sự kiện:</b> {result.eventTitle}
                        </p>
                    )}

                    {result.userFullName && (
                        <p>
                            <b>Người tham dự:</b> {result.userFullName}
                        </p>
                    )}

                    {result.userEmail && (
                        <p>
                            <b>Email:</b> {result.userEmail}
                        </p>
                    )}

                    {result.checkInAt && (
                        <p>
                            <b>Check-in lúc:</b>{" "}
                            {new Date(result.checkInAt).toLocaleString("vi-VN")}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};