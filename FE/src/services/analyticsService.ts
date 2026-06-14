import axiosInstance from './axiosInstance';

export interface DashboardOverview {
  totalEvents: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitingRegistrations: number;
  totalCheckIns: number;
  averageAttendanceRate: number;
  emailSentCount: number;
  emailFailedCount: number;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  totalRegistrations: number;
  confirmedCount: number;
  waitingCount: number;
  checkInCount: number;
  attendanceRate: number;
}

export interface RegistrationStats {
  totalCount: number;
  confirmedCount: number;
  waitingCount: number;
  cancelledCount: number;
}

export interface AttendanceStats {
  totalAttended: number;
  totalExpected: number;
  attendanceRate: number;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
}

class AnalyticsService {
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await axiosInstance.get('/admin/analytics');
    return response.data;
  }

  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    const response = await axiosInstance.get(`/admin/events/${eventId}/analytics`);
    return response.data;
  }

  async getAllEventAnalytics(): Promise<EventAnalytics[]> {
    const response = await axiosInstance.get('/admin/analytics/events');
    return response.data;
  }

  async getRegistrationStats(eventId: string): Promise<RegistrationStats> {
    const response = await axiosInstance.get(`/admin/events/${eventId}/registration-stats`);
    return response.data;
  }

  async getAttendanceStats(eventId: string): Promise<AttendanceStats> {
    const response = await axiosInstance.get(`/admin/events/${eventId}/attendance-stats`);
    return response.data;
  }

  async getNotificationStats(): Promise<NotificationStats> {
    const response = await axiosInstance.get('/admin/analytics/notifications');
    return response.data;
  }
}

export default new AnalyticsService();
