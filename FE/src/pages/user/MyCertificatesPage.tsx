import React, { useEffect, useState } from "react";
import axios from "axios";

import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { ticketService, type Ticket } from "../../services/ticketService";

export const MyCertificatesPage: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const loadCertificates = async () => {
        try {
            const data = await ticketService.getMyTickets();

            setTickets(
                data.filter((t) => t.status === "CHECKED_IN")
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            loadCertificates();
        }
    }, [isAuthenticated, isLoading]);

    const downloadCertificate = async (ticket: Ticket) => {
        try {
            const result = await ticketService.getCertificate(ticket.ticketId);

            if (result.success) {
                window.open(result.downloadUrl, "_blank");
            }
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

                <div className="mb-10">

                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-700 text-4xl">
                            workspace_premium
                        </span>

                        Chứng chỉ của tôi
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Danh sách các chứng chỉ đã đạt được sau khi tham gia
                        và điểm danh thành công tại các hội thảo.
                    </p>

                </div>

                {loadingData ? (

                    <div className="text-center py-20">
                        Đang tải...
                    </div>

                ) : tickets.length === 0 ? (

                    <div className="bg-white rounded-3xl border p-16 text-center">

                        <span className="material-symbols-outlined text-6xl text-slate-300">
                            workspace_premium
                        </span>

                        <h3 className="mt-4 text-xl font-bold">
                            Chưa có chứng chỉ
                        </h3>

                        <p className="text-slate-500 mt-2">
                            Sau khi tham gia và được Admin check-in,
                            chứng chỉ sẽ xuất hiện tại đây.
                        </p>

                    </div>

                ) : (

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {tickets.map((ticket) => (

                            <div
                                key={ticket.ticketId}
                                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition"
                            >

                                <div className="flex items-center justify-between">

                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-semibold">
                                        Đã cấp
                                    </span>

                                    <span className="material-symbols-outlined text-emerald-600">
                                        verified
                                    </span>

                                </div>

                                <h2 className="mt-5 text-lg font-bold">
                                    {ticket.eventTitle}
                                </h2>

                                <div className="mt-5 space-y-2 text-sm text-slate-600">

                                    <p>
                                        📍 {ticket.eventLocation}
                                    </p>

                                    <p>
                                        📅{" "}
                                        {new Date(
                                            ticket.eventStartTime
                                        ).toLocaleDateString("vi-VN")}
                                    </p>

                                    <p>
                                        👤 {ticket.userFullName}
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        downloadCertificate(ticket)
                                    }
                                    className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3 font-semibold transition cursor-pointer"
                                >
                                    📄 Tải chứng chỉ
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </main>

            <Footer />
        </div>
    );
};