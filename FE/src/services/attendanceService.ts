import axiosInstance from './axiosInstance';

export interface CheckInRequest {
  ticketId: string;
}

export interface CheckInResponse {
  success: boolean;
  ticketId: string;
  fullName: string;
  message: string;
}

export interface Attendance {
  eventId: string;
  ticketId: string;
  registrationId: string;
  userId: string;
  fullName: string;
  email: string;
  checkInAt: string;
  checkedBy: string;
  status: string;
}

class AttendanceService {
  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    const response = await axiosInstance.post('/admin/tickets/checkin', data);
    return response.data;
  }

  async getEventAttendance(eventId: string): Promise<Attendance[]> {
    const response = await axiosInstance.get(`/admin/events/${eventId}/attendance`);
    return response.data;
  }

  async getTicketAttendance(ticketId: string): Promise<Attendance | null> {
    try {
      const response = await axiosInstance.get(`/attendance/${ticketId}`);
      return response.data;
    } catch {
      return null;
    }
  }
}

export default new AttendanceService();
