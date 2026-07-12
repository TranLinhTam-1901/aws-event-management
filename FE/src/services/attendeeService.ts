import axiosInstance from "./axiosInstance";

export interface AttendeeItem {
    ticketId: string;
    userId?: string;
    userFullName: string;
    userEmail: string;
    eventId?: string;
    eventTitle: string;
    status: "CHECKED_IN" | "NOT_CHECKED_IN";
    checkInAt?: string | null;
}

export interface EventAttendeesResponse {
    success: boolean;
    eventId: string;
    total: number;
    checkedIn: number;
    notCheckedIn: number;
    attendees: AttendeeItem[];
}

export const attendeeService = {
    getEventAttendees: async (
        eventId: string
    ): Promise<EventAttendeesResponse> => {
        const response = await axiosInstance.get<EventAttendeesResponse>(
            `/admin/events/${encodeURIComponent(eventId)}/attendees`
        );

        return response.data;
    },
};