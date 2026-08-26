import React, { useEffect, useState } from "react";
import { TicketCard } from "./TicketCard";
import { ticketService, type Ticket } from "../../services/ticketService";

export const MyTicketList: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTickets = async () => {
            try {
                const data = await ticketService.getMyTickets();
                setTickets(data);
            } catch (err) {
                console.error("Load tickets failed:", err);
                setError("Không tải được danh sách vé.");
            } finally {
                setLoading(false);
            }
        };

        loadTickets();
    }, []);

    if (loading) {
        return <p>Đang tải vé...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Tickets</h2>

            {tickets.length === 0 ? (
                <p className="text-gray-500">Bạn chưa có vé nào.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket.ticketId} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
};