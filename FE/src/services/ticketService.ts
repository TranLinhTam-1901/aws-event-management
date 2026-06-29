import axiosInstance from "./axiosInstance";

export interface Ticket {
    ticketId: string;
    eventId: string;
    userId: string;

    userEmail: string;
    userFullName: string;

    eventTitle: string;
    eventStartTime: string;
    eventLocation: string;
    eventCategory: string;

    createdAt: string;
    status: string;
}

export interface CheckInResponse {
    success: boolean;
    message: string;
    ticketId: string;
    eventId?: string;
    eventTitle?: string;
    userId?: string;
    userEmail?: string;
    userFullName?: string;
    checkInAt?: string;
}

export const ticketService = {
    registerTicket: async (eventId: string): Promise<Ticket> => {
        const response = await axiosInstance.post<Ticket>(
            `/events/${eventId}/register`
        );

        return response.data;
    },

    getMyTickets: async (): Promise<Ticket[]> => {
        const response = await axiosInstance.get<Ticket[]>("/my-tickets");
        return Array.isArray(response.data) ? response.data : [];
    },

    getTicketById: async (ticketId: string): Promise<Ticket> => {
        const response = await axiosInstance.get<Ticket>(`/tickets/${ticketId}`);
        return response.data;
    },

    lookupTicket: async (ticketId: string): Promise<Ticket> => {
        const response = await axiosInstance.get<Ticket>(
            `/admin/tickets/${ticketId}`
        );

        return response.data;
    },

    getCertificate: async (ticketId: string): Promise<{ success: boolean; message: string; ticketId: string; certificateId: string; downloadUrl: string }> => {
        const response = await axiosInstance.get(`/certificates-v2/${ticketId}`);
        return response.data;
    },

    checkInTicket: async (
        ticketId: string,
        method: "QR" | "MANUAL"
    ): Promise<CheckInResponse> => {
        const response = await axiosInstance.post<CheckInResponse>(
            `${import.meta.env.VITE_API_BASE_URL}/tickets/checkin`,
            {
                ticketId,
                method,
            }
        );

        return response.data;
    },
};