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

        setTicket({
            ticketId: finalTicketId,
            eventId: "",
            userId: "",
            userEmail: "",
            userFullName: "Chưa xác minh",
            eventTitle: "Chưa xác minh",
            eventStartTime: "",
            eventLocation: "",
            eventCategory: "",
            createdAt: "",
            status: "PENDING_CHECKIN",
        });

        setTicketId(finalTicketId);
        setResult(null);
    };

    const handleScanSuccess = async (value: string) => {
        await handleSearchTicket(value);
    };

    const handleCheckIn = async (method: "QR" | "MANUAL") => {
        if (!ticket) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await ticketService.checkInTicket(ticket.ticketId, method);
            setResult(data);
        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                message: "Check-in thất bại hoặc lỗi kết nối API.",
                ticketId: ticket.ticketId,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMockCheckIn = () => {
        if (!ticket) return;

        const now = new Date().toISOString();

        setResult({
            success: true,
            message: "Check-in thủ công thành công.",
            ticketId: ticket.ticketId,
            eventId: ticket.eventId,
            eventTitle: ticket.eventTitle || "Chưa xác minh",
            userId: ticket.userId,
            userEmail: ticket.userEmail,
            userFullName: ticket.userFullName || "Chưa xác minh",
            checkInAt: now,
        });
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

                    <div className="mt-6 flex flex-col md:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => handleCheckIn("QR")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                        >
                            Check-in bằng QR
                        </button>

                        <button
                            type="button"
                            onClick={handleMockCheckIn}
                            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl font-bold"
                        >
                            Check-in thủ công
                        </button>
                    </div>
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