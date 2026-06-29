import React, { useState } from "react";
import QRCode from "qrcode";
import { AppCard } from "../common/AppCard";
import { type Ticket } from "../../services/ticketService";

type TicketCardProps = {
    ticket: Ticket;
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    const [showQr, setShowQr] = useState(false);
    const [qrUrl, setQrUrl] = useState("");

    const handleToggleQr = async () => {
        if (!ticket.ticketId) return;

        if (!qrUrl) {
            const url = await QRCode.toDataURL(ticket.ticketId, {
                width: 220,
                margin: 2,
            });

            setQrUrl(url);
        }

        setShowQr((prev) => !prev);
    };

    return (
        <AppCard>
            <h3 className="text-lg font-bold mb-2">
                {ticket.eventTitle || "Ticket"}
            </h3>

            <p className="text-sm text-gray-600 mb-1">
                Trạng thái: {ticket.status}
            </p>

            <p className="text-sm text-gray-600 mb-1">
                Email: {ticket.userEmail}
            </p>

            <p className="text-sm text-gray-600 mb-1">
                Địa điểm: {ticket.E}
            </p>

            <p className="text-sm text-gray-600 mb-1">
                Thời gian: {ticket.eventStartTime}
            </p>

            <p className="text-xs text-gray-500 mb-4 break-all">
                Ticket ID: {ticket.ticketId}
            </p>

            <button
                type="button"
                onClick={handleToggleQr}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
                {showQr ? "Ẩn QR Code" : "Xem vé QR"}
            </button>

            {showQr && qrUrl && (
                <div className="mt-4 flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                    <img
                        src={qrUrl}
                        alt={`QR ${ticket.ticketId}`}
                        className="w-52 h-52 object-contain"
                    />

                    <a
                        href={qrUrl}
                        download={`${ticket.ticketId}.png`}
                        className="mt-3 text-sm text-blue-600 font-medium"
                    >
                        Tải QR
                    </a>
                </div>
            )}
        </AppCard>
    );
};