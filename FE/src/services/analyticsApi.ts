import axiosInstance from './axiosInstance'; // Chỉnh lại đường dẫn cho khớp vị trí thật file axios của bạn

export interface DashboardOverview {
  totalEvents: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitingRegistrations: number;
  totalCheckIns: number;
  averageAttendanceRate: number;
  emailSentCount: number;
  emailFailedCount: number;
  certificatesIssuedCount: number;
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

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await axiosInstance.get<DashboardOverview>('/admin/analytics/dashboard');
  return response.data;
};

export const getEventAnalytics = async (eventId: string): Promise<EventAnalytics> => {
  const response = await axiosInstance.get<EventAnalytics>(`/admin/analytics/events/${eventId}`);
  return response.data;
};