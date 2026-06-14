import axiosInstance from './axiosInstance';

export interface NotificationLog {
  notificationId: string;
  eventId: string;
  userId: string;
  email: string;
  type: string;
  status: string;
  errorMessage?: string;
  sentAt: string;
}

export interface SendEmailRequest {
  toEmail: string;
  subject: string;
  body: string;
  fullName: string;
}

class NotificationService {
  async getNotificationLogs(eventId?: string): Promise<NotificationLog[]> {
    const params = eventId ? { eventId } : {};
    const response = await axiosInstance.get('/admin/notifications/logs', { params });
    return response.data;
  }

  async sendManualEmail(data: SendEmailRequest): Promise<NotificationLog> {
    const response = await axiosInstance.post('/admin/notifications/send', data);
    return response.data;
  }

  async sendEventNotification(
    eventId: string,
    type: 'confirmation' | 'reminder' | 'certificate'
  ): Promise<void> {
    await axiosInstance.post(`/admin/events/${eventId}/send-notification`, { type });
  }

  async resendNotification(notificationId: string): Promise<void> {
    await axiosInstance.post(`/admin/notifications/${notificationId}/resend`);
  }
}

export default new NotificationService();
